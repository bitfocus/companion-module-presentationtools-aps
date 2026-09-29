const assert = require('node:assert/strict')
const { test } = require('node:test')
const { EventEmitter } = require('node:events')
const { readFileSync } = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')
const vm = require('node:vm')
const { BuildTotalSmoother } = require('../build-total-smoother')

function clock() {
	let now = 0
	let nextId = 0
	const jobs = new Map()
	return {
		jobs,
		created: 0,
		setTimeout(callback, delay) {
			this.created++
			const id = ++nextId
			jobs.set(id, { callback, at: now + delay })
			return id
		},
		clearTimeout(id) {
			jobs.delete(id)
		},
		advance(ms) {
			now += ms
			for (const [id, job] of jobs) {
				if (job.at <= now) {
					jobs.delete(id)
					job.callback()
				}
			}
		},
	}
}

function files(slide, count, extra = {}) {
	return {
		curr: 'Demo.pptx',
		slide_number: String(slide),
		slides_count: '20',
		current_build: '0',
		builds_count: count,
		powerpoint_current_build: '0',
		powerpoint_builds_count: count,
		...extra,
	}
}

function fixture(platform = 'macos') {
	const timers = clock()
	const displayed = {}
	const smoother = new BuildTotalSmoother((values) => Object.assign(displayed, values), timers)
	const receive = (data) => Object.assign(displayed, smoother.values(data))
	smoother.setPlatform(platform)
	return { timers, displayed, smoother, receive }
}

function totals(displayed, expected) {
	assert.equal(displayed.Slides_builds_count, expected)
	assert.equal(displayed.Powerpoint_Slides_builds_count, expected)
}

for (const platform of ['windows', null, undefined, 'MACOS', 'other']) {
	test(`${platform}: every value is immediate and no timers are created`, () => {
		const f = fixture()
		f.smoother.setPlatform(platform)
		for (const [slide, value] of [
			[1, '5'],
			[2, '-'],
			[2, '3'],
			[3, '0'],
			[4, undefined],
			[5, ''],
		]) {
			f.receive(files(slide, value))
			totals(f.displayed, value)
		}
		assert.equal(f.timers.created, 0)
	})
}

test('Mac holds both totals then immediately accepts numeric values, including zero', () => {
	for (const value of ['3', '0']) {
		const f = fixture()
		f.receive(files(1, '5'))
		f.receive(files(2, '-'))
		totals(f.displayed, '5')
		f.timers.advance(250)
		f.receive(files(2, value))
		totals(f.displayed, value)
		f.timers.advance(2000)
		totals(f.displayed, value)
		assert.equal(f.timers.jobs.size, 0)
	}
})

test('repeated messages and rapid slide changes cannot extend a hold', () => {
	const f = fixture()
	f.receive(files(5, '5'))
	f.receive(files(6, '-'))
	f.timers.advance(600)
	f.receive(files(6, '-'))
	f.receive(files(4, ''))
	f.timers.advance(399)
	totals(f.displayed, '5')
	f.timers.advance(1)
	totals(f.displayed, '')
	f.receive(files(3, '-'))
	totals(f.displayed, '-')
	assert.equal(f.timers.created, 2)
})

test('first unavailable and same-slide unavailable totals are immediate', () => {
	const f = fixture()
	f.receive(files(1, '-'))
	totals(f.displayed, '-')
	f.receive(files(1, '4'))
	f.receive(files(1, '-'))
	totals(f.displayed, '-')
	assert.equal(f.timers.created, 0)
})

test('generic and PowerPoint totals resolve independently', () => {
	const f = fixture()
	f.receive(files(1, '5'))
	f.receive(files(2, '-', { powerpoint_builds_count: '0' }))
	assert.equal(f.displayed.Slides_builds_count, '5')
	assert.equal(f.displayed.Powerpoint_Slides_builds_count, '0')
	f.timers.advance(1000)
	assert.equal(f.displayed.Slides_builds_count, '-')
	assert.equal(f.displayed.Powerpoint_Slides_builds_count, '0')
})

test('missing legacy totals do not borrow a generic value', () => {
	const f = fixture()
	f.receive(files(1, '5', { powerpoint_builds_count: undefined }))
	f.receive(files(2, '-', { powerpoint_builds_count: undefined }))
	assert.equal(f.displayed.Slides_builds_count, '5')
	assert.equal(f.displayed.Powerpoint_Slides_builds_count, undefined)
})

test('presentation changes and unavailable slide numbers cancel holds', () => {
	for (const change of [{ curr: 'Other.pptx' }, { slides_count: '30' }, { slide_number: '-' }]) {
		const f = fixture()
		f.receive(files(1, '5'))
		f.receive(files(2, '-'))
		f.receive(files(3, '-', change))
		totals(f.displayed, '-')
		assert.equal(f.timers.jobs.size, 0)
	}
})

test('obsolete callbacks cannot overwrite a new resolved count', () => {
	const f = fixture()
	f.receive(files(1, '5'))
	f.receive(files(2, '-'))
	const callbacks = [...f.timers.jobs.values()].map((job) => job.callback)
	f.smoother.reset()
	f.receive(files(3, '2'))
	for (const callback of callbacks) callback()
	totals(f.displayed, '2')
})

// Exercise the real message parser and event handlers with a simulated APS connection.
async function companion() {
	const timers = clock()
	let Instance
	class FakeBase {
		constructor() {
			this.values = {}
		}
		setVariableValues(values) {
			Object.assign(this.values, values)
		}
		log() {}
		updateStatus() {}
		checkFeedbacks() {}
	}
	class FakeTCP extends EventEmitter {
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
						InstanceBase: FakeBase,
						TCPHelper: FakeTCP,
						InstanceStatus: { Ok: 'ok' },
						runEntrypoint(instance) {
							Instance = instance
						},
					}
				if (name === './build-total-smoother')
					return {
						BuildTotalSmoother: class extends BuildTotalSmoother {
							constructor(publish) {
								super(publish, timers)
							}
						},
					}
				return localRequire(name)
			},
			Buffer,
			console,
			setTimeout,
			clearTimeout,
		},
		{ filename },
	)
	const instance = new Instance()
	for (const method of ['actions', 'variables', 'feedbacks', 'presets']) instance[method] = () => {}
	await instance.configUpdated({ host: '127.0.0.1', port: 31601 })
	instance.socket.emit('connect')
	const send = (action, data) => {
		const body = Buffer.from(JSON.stringify({ action, data }))
		const header = Buffer.alloc(4)
		header.writeUInt32BE(body.length)
		instance.socket.emit('data', Buffer.concat([header, body]))
	}
	return { instance, send, timers }
}

test('real files handler smooths only totals and leaves current build and slide immediate', async () => {
	const { instance, send, timers } = await companion()
	send('aps_info', { platform: 'macos' })
	send('files', files(1, '5'))
	send('files', files(2, '-', { current_build: '1', powerpoint_current_build: '1' }))
	totals(instance.values, '5')
	assert.equal(instance.values.slide_number, '2')
	assert.equal(instance.values.Slides_current_build, '1')
	assert.equal(instance.values.Powerpoint_Slides_current_build, '1')
	timers.advance(1000)
	totals(instance.values, '-')
})

test('Mac disconnect and reconnect to Windows cannot retain smoothing', async () => {
	const { instance, send, timers } = await companion()
	send('aps_info', { platform: 'macos' })
	send('files', files(1, '5'))
	send('files', files(2, '-'))
	instance.socket.emit('status_change', 'disconnected')
	totals(instance.values, '-')
	assert.equal(timers.jobs.size, 0)
	instance.socket.emit('connect')
	for (const platform of [undefined, 'windows']) {
		if (platform) send('aps_info', { platform })
		send('files', files(1, '3'))
		send('files', files(2, '-'))
		totals(instance.values, '-')
		send('files', files(2, '0'))
		totals(instance.values, '0')
	}
	assert.equal(timers.created, 2)
})

for (const event of ['end presentation', 'application change', 'reconfigure', 'destroy', 'error']) {
	test(`${event} clears pending totals through the real lifecycle handler`, async () => {
		const { instance, send, timers } = await companion()
		send('aps_info', { platform: 'macos' })
		send('files', files(1, '5'))
		send('files', files(2, '-'))
		if (event === 'end presentation') send('any_presentation_displayed', { is_any_presentation_displayed: false })
		if (event === 'application change') send('active_application', { application: 'Keynote' })
		if (event === 'reconfigure') await instance.configUpdated({ host: '127.0.0.2', port: 31601 })
		if (event === 'destroy') await instance.destroy()
		if (event === 'error') instance.socket.emit('error', new Error('Disconnected'))
		totals(instance.values, '-')
		assert.equal(timers.jobs.size, 0)
		timers.advance(2000)
		totals(instance.values, '-')
	})
}
