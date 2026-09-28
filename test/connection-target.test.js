const assert = require('node:assert/strict')
const { test } = require('node:test')
const { EventEmitter } = require('node:events')
const { readFileSync } = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')
const vm = require('node:vm')
const utils = require('../utils')

// Run the real module with a fake Companion base that records the TCP target, variables and status.
async function companion(config) {
	let Instance
	class FakeBase {
		constructor() {
			this.label = 'aps'
			this.values = {}
			this.statuses = []
		}
		setActionDefinitions() {}
		setFeedbackDefinitions() {}
		setPresetDefinitions() {}
		setVariableDefinitions(definitions) {
			this.variableDefinitions = definitions
		}
		setVariableValues(values) {
			Object.assign(this.values, values)
		}
		getVariableValue(id) {
			return this.values[id]
		}
		log() {}
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
		}
		send() {
			return Promise.resolve()
		}
		destroy() {}
	}
	const filename = path.resolve(__dirname, '../index.js')
	const localRequire = createRequire(filename)
	vm.runInNewContext(
		readFileSync(filename, 'utf8'),
		{
			require(name) {
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
			setInterval,
			clearInterval,
		},
		{ filename },
	)
	const instance = new Instance()
	await instance.configUpdated(config)
	const connect = () => {
		instance.socket.isConnected = true
		instance.socket.emit('connect')
	}
	const sendMessage = (message) => {
		const body = Buffer.from(JSON.stringify(message))
		const header = Buffer.alloc(4)
		header.writeUInt32BE(body.length)
		instance.socket.emit('data', Buffer.concat([header, body]))
	}
	const send = (action, data) => sendMessage({ action, data })
	return { instance, connect, send, sendMessage }
}

test('parseBonjourTarget reads Companion discovery values and treats anything else as Manual', () => {
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
	assert.equal(instance.socket.port, '31600')
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
