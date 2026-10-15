const assert = require('node:assert/strict')
const { test } = require('node:test')
const { EventEmitter } = require('node:events')
const { readFileSync } = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')
const vm = require('node:vm')
const utils = require('../src/utils')

// Run the real module with a fake Companion base that records the TCP target, variables and status.
async function companion(config) {
	let Instance
	const intervals = new Map()
	const sockets = []
	const clock = {
		now: Date.now(),
		intervals,
		advance(ms) {
			const end = this.now + ms
			while (true) {
				const next = [...intervals.values()].sort((a, b) => a.next - b.next)[0]
				if (!next || next.next > end) break
				this.now = next.next
				next.next += next.delay
				next.callback()
			}
			this.now = end
		},
	}
	class FakeBase {
		constructor() {
			this.label = 'aps'
			this.values = {}
			this.statuses = []
			this.updates = []
			this.logs = []
		}
		setActionDefinitions() {}
		setFeedbackDefinitions() {}
		setPresetDefinitions() {}
		setVariableDefinitions(definitions) {
			this.variableDefinitions = definitions
		}
		setVariableValues(values) {
			this.updates.push(values)
			Object.assign(this.values, values)
		}
		getVariableValue(id) {
			return this.values[id]
		}
		log(level, message) {
			this.logs.push({ level, message })
		}
		updateStatus(status, message) {
			this.statuses.push({ status, message })
		}
		checkFeedbacks() {}
	}
	class FakeTCP extends EventEmitter {
		constructor(host, port) {
			super()
			this.host = host
			this.port = port
			this.isConnected = false
			sockets.push(this)
		}
		send() {
			return Promise.resolve()
		}
		destroy() {
			this.destroyed = true
			this.isConnected = false
		}
	}
	const filename = path.resolve(__dirname, '../src/index.js')
	const localRequire = createRequire(filename)
	vm.runInNewContext(
		readFileSync(filename, 'utf8'),
		{
			require(name) {
				if (name === './utils')
					return { ...utils, getTrialTimeLeft: (expires) => utils.getTrialTimeLeft(expires, clock.now) }
				if (name === '@companion-module/base')
					return {
						...localRequire(name),
						InstanceBase: FakeBase,
						TCPHelper: FakeTCP,
						runEntrypoint(instance) {
							Instance = instance
						},
					}
				return localRequire(name)
			},
			Buffer,
			console,
			setTimeout,
			clearTimeout,
			setInterval(callback, delay) {
				const handle = { unref() {} }
				intervals.set(handle, { callback, delay, next: clock.now + delay })
				return handle
			},
			clearInterval(handle) {
				intervals.delete(handle)
			},
		},
		{ filename },
	)
	const instance = new Instance()
	await instance.configUpdated(config)
	const connect = () => {
		instance.socket.isConnected = true
		instance.socket.emit('connect')
	}
	const sendMessage = (message, socket = instance.socket) => {
		const body = Buffer.from(JSON.stringify(message))
		const header = Buffer.alloc(4)
		header.writeUInt32BE(body.length)
		socket.emit('data', Buffer.concat([header, body]))
	}
	const send = (action, data) => sendMessage({ action, data })
	return { instance, connect, send, sendMessage, clock, sockets }
}

test('parseBonjourTarget reads valid discovery values and rejects unusable values', () => {
	assert.deepEqual(utils.parseBonjourTarget('192.168.1.20:31600'), { host: '192.168.1.20', port: 31600 })
	assert.deepEqual(utils.parseBonjourTarget('[2001:db8::20]:31600'), { host: '2001:db8::20', port: 31600 })
	for (const value of [null, undefined, '', 'manual', '192.168.1.20', ':31600', '192.168.1.20:0', '192.168.1.20:x']) {
		assert.equal(utils.parseBonjourTarget(value), null, String(value))
	}
})

test('getAPSMachineName prefers the PC tag and falls back to the hostname', () => {
	assert.equal(utils.getAPSMachineName({ computer_tag: 'Macbook #1', hostname: 'mbp.local' }), 'Macbook #1')
	assert.equal(utils.getAPSMachineName({ computer_tag: '  ', hostname: 'Lenove_AV' }), 'Lenove_AV')
	assert.equal(utils.getAPSMachineName({}), null)
})

test('manual config connects to the entered IP and port', async () => {
	const { instance } = await companion({ host: '10.0.0.5', port: '31600', bonjourHost: null })
	assert.equal(instance.socket.host, '10.0.0.5')
	assert.equal(instance.socket.port, 31600)
})

test('existing configs without a discovery field still connect manually', async () => {
	const { instance } = await companion({ host: '10.0.0.5', port: '31600' })
	assert.equal(instance.socket.host, '10.0.0.5')
})

test('a discovered machine overrides the manual IP and port', async () => {
	const { instance } = await companion({ host: '127.0.0.1', port: '31600', bonjourHost: '192.168.1.34:31601' })
	assert.equal(instance.socket.host, '192.168.1.34')
	assert.equal(instance.socket.port, 31601)
})

test('aps_info names the connected machine in variables and status, and disconnect clears it', async () => {
	const { instance, connect, send } = await companion({ host: '127.0.0.1', port: '31600' })
	assert.equal(instance.values.connected_machine_name, '-')
	assert.ok(instance.variableDefinitions.some((v) => v.variableId === 'connected_machine_name'))

	connect()
	send('aps_info', {
		platform: 'macos',
		app_version: '4.5 (52)',
		computer_tag: 'Macbook #1',
		hostname: 'Mortens-MacBook-Pro-473.local',
		instanceId: 'bced85d4-8b7e-4672-a3bb-578cfb95da2a',
	})
	assert.equal(instance.values.connected_machine_name, 'Macbook #1')
	assert.equal(instance.values.connected_machine_computer_tag, 'Macbook #1')
	assert.equal(instance.values.connected_machine_hostname, 'Mortens-MacBook-Pro-473.local')
	assert.equal(instance.values.connected_machine_instance_id, 'bced85d4-8b7e-4672-a3bb-578cfb95da2a')
	assert.equal(instance.values.connected_machine_platform, 'Mac')
	assert.equal(instance.values.connected_machine_aps_version, '4.5 (52)')
	assert.deepEqual(instance.statuses.at(-1), { status: 'ok', message: 'Macbook #1 · Mac · APS 4.5 (52)' })
	const summary = instance.getConfigFields().find((f) => f.id === 'info-connected-machine').value
	assert.match(summary, /<b>Platform:<\/b> Mac/)
	assert.match(summary, /<b>APS version:<\/b> 4\.5 \(52\)/)
	assert.match(summary, /<b>Address:<\/b> 127\.0\.0\.1:31600/)

	instance.socket.isConnected = false
	instance.socket.emit('status_change', 'disconnected')
	assert.equal(instance.values.connected_machine_name, '-')
	assert.equal(instance.values.connected_machine_instance_id, '-')
	assert.equal(instance.values.connected_machine_platform, '-')
	assert.equal(instance.values.connected_machine_aps_version, '-')
	assert.equal(
		instance.getConfigFields().find((f) => f.id === 'info-connected-machine').value,
		'Machine details appear here once APS has connected. Reopen this panel to refresh.',
	)
})

test('a Windows machine without a PC tag is named by its hostname', async () => {
	const { instance, connect, send } = await companion({ host: '127.0.0.1', port: '31600' })
	connect()
	send('aps_info', { platform: 'windows', computer_tag: '', hostname: 'Lenove_AV' })
	assert.equal(instance.values.connected_machine_name, 'Lenove_AV')
	assert.equal(instance.values.connected_machine_computer_tag, '-')
	assert.equal(instance.values.connected_machine_platform, 'PC')
	assert.equal(instance.values.connected_machine_aps_version, '-')
	assert.deepEqual(instance.statuses.at(-1), { status: 'ok', message: 'Lenove_AV · PC' })
})

test('an API version warning is not replaced by the machine name', async () => {
	const { instance, connect, send, sendMessage } = await companion({ host: '127.0.0.1', port: '31600' })
	connect()
	sendMessage({ action: 'api_version', api_version: 3 })
	const warning = instance.statuses.at(-1)
	assert.equal(warning.status, 'unknown_warning')
	send('aps_info', { computer_tag: 'FOH-PC' })
	assert.deepEqual(instance.statuses.at(-1), warning)
	assert.equal(instance.values.connected_machine_name, 'FOH-PC')
})

test('getTrialTimeLeft formats the remaining trial time like APS Hub', () => {
	const now = Date.parse('2026-08-01T12:00:00Z')
	assert.equal(utils.getTrialTimeLeft('2026-08-04T16:00:00Z', now), '3d 4h')
	assert.equal(utils.getTrialTimeLeft('2026-08-01T14:05:00Z', now), '2h 5m')
	assert.equal(utils.getTrialTimeLeft('2026-08-01T12:12:00Z', now), '12m')
	assert.equal(utils.getTrialTimeLeft('2026-08-01T11:00:00Z', now), 'expired')
	assert.equal(utils.getTrialTimeLeft(undefined, now), null)
})

test('license_status shows the licence in variables, status and settings', async () => {
	const { instance, connect, send } = await companion({ host: '127.0.0.1', port: '31600' })
	connect()
	send('aps_info', {
		platform: 'windows',
		app_version: '4.6.0.1',
		computer_tag: 'FOH-PC',
		capabilities: ['license_status'],
	})
	const expires = new Date(Date.now() + (2 * 60 + 5) * 60000 - 1000).toISOString()
	send('license_status', { state: 'trial', trial_expires_at: expires, will_close: false })
	assert.equal(instance.values.connected_machine_licence, 'Trial')
	assert.equal(instance.values.connected_machine_trial_time_left, '2h 5m')
	assert.deepEqual(instance.statuses.at(-1), { status: 'ok', message: 'FOH-PC · PC · APS 4.6.0.1 · Trial' })
	const summary = () => instance.getConfigFields().find((f) => f.id === 'info-connected-machine').value
	assert.match(summary(), /<b>Licence:<\/b> Trial(<br\/>|$)/)

	send('license_status', { state: 'licensed', will_close: false })
	assert.equal(instance.values.connected_machine_licence, 'Licensed')
	assert.equal(instance.values.connected_machine_trial_time_left, '-')
	assert.equal(instance.trialTimer, null)
	assert.deepEqual(instance.statuses.at(-1), { status: 'ok', message: 'FOH-PC · PC · APS 4.6.0.1' })
	assert.match(summary(), /<b>Licence:<\/b> Licensed/)

	instance.socket.isConnected = false
	instance.socket.emit('status_change', 'disconnected')
	assert.equal(instance.values.connected_machine_licence, '-')
})

test('licence is ignored without the capability and reported as unsupported', async () => {
	const { instance, connect, send } = await companion({ host: '127.0.0.1', port: '31600' })
	connect()
	send('aps_info', { platform: 'macos', computer_tag: 'Old Mac' })
	send('license_status', { state: 'trial', trial_expires_at: '2099-01-01T00:00:00Z', will_close: false })
	assert.equal(instance.values.connected_machine_licence, '-')
	assert.equal(instance.trialTimer, null)
	assert.match(
		instance.getConfigFields().find((f) => f.id === 'info-connected-machine').value,
		/<b>Licence:<\/b> Not reported by this APS version/,
	)
})

function startTrial(harness) {
	harness.connect()
	harness.send('aps_info', { platform: 'macos', capabilities: ['license_status'] })
	harness.send('license_status', {
		state: 'trial',
		trial_expires_at: new Date(harness.clock.now + 120000).toISOString(),
	})
}

test('trial refresh uses one 30-second interval and updates the countdown', async (t) => {
	const h = await companion({ host: '127.0.0.1', port: 31600 })
	t.after(() => h.instance.destroy())
	startTrial(h)
	const handle = h.instance.trialTimer
	assert.equal(h.clock.intervals.size, 1)
	assert.equal(h.clock.intervals.get(handle).delay, 30000)
	h.send('license_status', h.instance.licenceStatus)
	assert.equal(h.instance.trialTimer, handle)
	assert.equal(h.clock.intervals.size, 1)
	assert.equal(h.instance.values.connected_machine_trial_time_left, '2m')
	h.clock.advance(60000)
	assert.equal(h.instance.values.connected_machine_trial_time_left, '1m')
})

test('repeated config saves clear the trial interval before reconnecting', async (t) => {
	const config = { host: '127.0.0.1', port: 31600 }
	const h = await companion(config)
	t.after(() => h.instance.destroy())
	for (let cycle = 0; cycle < 4; cycle++) {
		startTrial(h)
		const oldSocket = h.instance.socket
		const oldHandle = h.instance.trialTimer
		assert.equal(h.clock.intervals.size, 1)
		await h.instance.configUpdated(config)
		assert.equal(h.clock.intervals.size, 0)
		assert.equal(h.instance.trialTimer, null)
		assert.equal(oldSocket.destroyed, true)
		const updateCount = h.instance.updates.length
		h.clock.advance(90000)
		assert.equal(h.instance.updates.length, updateCount)
		h.sendMessage({ action: 'aps_info', data: { capabilities: ['license_status'] } }, oldSocket)
		h.sendMessage({ action: 'license_status', data: { state: 'trial' } }, oldSocket)
		oldSocket.emit('connect')
		oldSocket.emit('status_change', 'disconnected')
		assert.equal(h.clock.intervals.size, 0)
		assert.equal(h.instance.updates.length, updateCount)
		assert.equal(h.clock.intervals.has(oldHandle), false)
	}
	startTrial(h)
	assert.equal(h.clock.intervals.size, 1)
	await h.instance.destroy()
	assert.equal(h.clock.intervals.size, 0)
})

for (const cleanup of ['licensed', 'cleared', 'disconnect', 'destroy']) {
	test(`trial interval stops after ${cleanup} without further refreshes`, async (t) => {
		const h = await companion({ host: '127.0.0.1', port: 31600 })
		t.after(() => h.instance.destroy())
		startTrial(h)
		if (cleanup === 'licensed') h.send('license_status', { state: 'licensed' })
		if (cleanup === 'cleared') h.instance.setLicenceStatus(null)
		if (cleanup === 'disconnect') {
			h.instance.socket.isConnected = false
			h.instance.socket.emit('status_change', 'disconnected')
		}
		if (cleanup === 'destroy') await h.instance.destroy()
		assert.equal(h.clock.intervals.size, 0)
		assert.equal(h.instance.trialTimer, null)
		const updateCount = h.instance.updates.length
		h.clock.advance(90000)
		assert.equal(h.instance.updates.length, updateCount)
	})
}

test('disconnect immediately reports its reason and clears connected state', async (t) => {
	const h = await companion({ host: '127.0.0.1', port: 31600 })
	t.after(() => h.instance.destroy())
	startTrial(h)
	h.send('aps_info', {
		computer_tag: 'Old machine',
		capabilities: ['license_status', 'presentation_preparation_feedback'],
	})
	h.send('presentation_preparing', { is_preparing: true, command_type: 'slot', slot: 1 })
	assert.equal(h.instance.values.presentation_preparing, true)
	h.instance.socket.isConnected = false
	h.instance.socket.emit('status_change', 'disconnected', 'APS closed')
	assert.deepEqual(h.instance.statuses.at(-1), { status: 'disconnected', message: 'APS closed' })
	assert.equal(h.instance.values.connected_machine_name, '-')
	assert.equal(h.instance.values.connected_machine_licence, '-')
	assert.equal(h.instance.values.presentation_preparing, false)
	assert.equal(h.clock.intervals.size, 0)
	h.connect()
	h.send('aps_info', { computer_tag: 'Reconnected' })
	assert.deepEqual(h.instance.statuses.at(-1), { status: 'ok', message: 'Reconnected' })
})

test('socket errors expose safe reasons after underlying status events', async (t) => {
	const h = await companion({ host: '127.0.0.1', port: 31600 })
	t.after(() => h.instance.destroy())
	for (const [error, message] of [
		[new Error('connect ECONNREFUSED'), 'connect ECONNREFUSED'],
		['Host unreachable', 'Host unreachable'],
		[{ message: 'Timed out' }, 'Timed out'],
		[42, '42'],
		[null, 'Unknown socket error'],
		[undefined, 'Unknown socket error'],
		['  ', 'Unknown socket error'],
		[Object.create(null), 'Unknown socket error'],
	]) {
		h.instance.socket.emit('status_change', 'unknown_error', message)
		h.instance.socket.emit('error', error)
		assert.deepEqual(h.instance.statuses.at(-1), { status: 'connection_failure', message })
		assert.deepEqual(h.instance.logs.at(-1), { level: 'error', message: `APS socket: ${message}` })
	}
})

test('generic OK events preserve machine descriptions and API warnings', async (t) => {
	const h = await companion({ host: '127.0.0.1', port: 31600 })
	t.after(() => h.instance.destroy())
	h.connect()
	h.send('aps_info', { computer_tag: 'FOH' })
	for (const version of [2, 3]) {
		h.sendMessage({ action: 'api_version', api_version: version })
		const status = h.instance.statuses.at(-1)
		h.instance.socket.emit('status_change', 'ok')
		assert.deepEqual(h.instance.statuses.at(-1), status)
	}
})

test('unusable manual targets report BadConfig without creating sockets', async () => {
	for (const config of [
		{},
		{ port: 31600 },
		{ host: '127.0.0.1' },
		{ host: '   ', port: 31600 },
		...[null, undefined, '', ' ', 0, -1, 65536, 1.5, 'x', '31600suffix', true, {}, []].map((port) => ({
			host: '127.0.0.1',
			port,
		})),
	]) {
		const h = await companion(config)
		assert.equal(h.sockets.length, 0, JSON.stringify(config))
		assert.equal(h.instance.getConnectionTarget(), null)
		assert.deepEqual(h.instance.statuses.at(-1), {
			status: 'bad_config',
			message: 'Select an APS machine or enter a valid IP and port',
		})
		await h.instance.destroy()
	}
})

test('invalid discovery never falls back to valid hidden manual settings', async () => {
	for (const bonjourHost of [
		'manual',
		'broken',
		'   ',
		':31600',
		' :31600',
		'[]:31600',
		'[::1:31600',
		'host:x',
		'host:65536',
		false,
		123,
		{},
	]) {
		const h = await companion({ host: '127.0.0.1', port: 31600, bonjourHost })
		assert.equal(h.sockets.length, 0, JSON.stringify(bonjourHost))
		assert.deepEqual(h.instance.statuses.at(-1), {
			status: 'bad_config',
			message: 'Select the APS machine again or choose Manual',
		})
		await h.instance.destroy()
	}
})

test('valid targets normalize ports and preserve Manual, IPv4 and bracketed IPv6 discovery', async () => {
	for (const bonjourHost of [undefined, null, '', '127.0.0.1:31600', '[2001:db8::20]:31600']) {
		const h = await companion({ host: ' 127.0.0.1 ', port: '31600', bonjourHost })
		assert.equal(h.sockets.length, 1)
		assert.equal(h.instance.socket.host, bonjourHost?.startsWith('[') ? '2001:db8::20' : '127.0.0.1')
		assert.equal(h.instance.socket.port, 31600)
		await h.instance.destroy()
	}
	for (const port of [1, 65535, '1', '65535']) {
		assert.deepEqual(utils.resolveConnectionTarget({ host: 'host.local', port }).target, {
			host: 'host.local',
			port: Number(port),
		})
	}
})

test('invalidating a target detaches the old connection before destroy and ignores its events', async () => {
	const config = { host: '127.0.0.1', port: 31600 }
	const h = await companion(config)
	startTrial(h)
	const oldSocket = h.instance.socket
	const destroy = oldSocket.destroy.bind(oldSocket)
	oldSocket.destroy = () => {
		assert.notEqual(h.instance.socket, oldSocket)
		oldSocket.emit('status_change', 'disconnected', 'old socket')
		destroy()
	}
	config.host = ''
	await h.instance.configUpdated(config)
	assert.equal(oldSocket.destroyed, true)
	assert.equal(h.instance.socket, undefined)
	assert.equal(h.instance.apsPlatform, null)
	assert.equal(h.instance.connectedMachine, null)
	const statuses = h.instance.statuses.length
	const updates = h.instance.updates.length
	const logs = h.instance.logs.length
	oldSocket.emit('error', new Error('old error'))
	oldSocket.emit('connect')
	h.sendMessage({ action: 'aps_info', data: { platform: 'windows', capabilities: ['license_status'] } }, oldSocket)
	h.sendMessage({ action: 'license_status', data: { state: 'trial' } }, oldSocket)
	assert.equal(h.instance.statuses.length, statuses)
	assert.equal(h.instance.updates.length, updates)
	assert.equal(h.instance.logs.length, logs)
	assert.equal(h.clock.intervals.size, 0)
	assert.equal(h.instance.apsPlatform, null)
	await h.instance.destroy()
})

test('machine summary uses the endpoint snapshot until configuration is saved', async (t) => {
	const config = { host: '127.0.0.1', port: '31600' }
	const h = await companion(config)
	t.after(() => h.instance.destroy())
	h.connect()
	h.send('aps_info', { computer_tag: 'FOH' })
	config.host = '192.168.1.2'
	const statuses = h.instance.statuses.length
	assert.match(h.instance.getConnectedMachineSummary(), /127\.0\.0\.1:31600/)
	assert.equal(h.instance.statuses.length, statuses)
})
