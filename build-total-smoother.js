const TOTAL_FIELDS = [
	['Slides_builds_count', 'builds_count'],
	['Powerpoint_Slides_builds_count', 'powerpoint_builds_count'],
]

function isCount(value) {
	return (typeof value === 'string' && /^\d+$/.test(value)) || (Number.isSafeInteger(value) && value >= 0)
}

// Display-only smoothing. Never use a held total as confirmation of the new slide's count.
class BuildTotalSmoother {
	constructor(publish, timers = { setTimeout, clearTimeout }) {
		this.publish = publish
		this.timers = timers
		this.platform = null
		this.totals = new Map()
		this.scope = null
		this.slide = null
	}

	setPlatform(platform) {
		if (platform === this.platform) return
		this.reset()
		this.platform = platform
	}

	resetConnection() {
		this.reset()
		this.platform = null
	}

	reset(publishPending = true) {
		const updates = {}
		for (const [variable, state] of this.totals) {
			if (state.pending) {
				this.timers.clearTimeout(state.pending.timer)
				updates[variable] = state.pending.latest
			}
		}
		this.totals.clear()
		this.scope = null
		this.slide = null
		if (publishPending && Object.keys(updates).length > 0) this.publish(updates)
	}

	values(data) {
		const updates = Object.fromEntries(TOTAL_FIELDS.map(([variable, field]) => [variable, data[field]]))
		// Keep Windows and unidentified servers on the original immediate path, without timers.
		if (this.platform !== 'macos') return updates

		const rawSlide = data.slide_number ?? data.powerpoint_slide_number
		if (!isCount(rawSlide) || Number(rawSlide) <= 0) {
			this.reset(false)
			return updates
		}
		const slide = Number(rawSlide)
		// These are the presentation identifiers available in existing files feedback.
		const scope = JSON.stringify([data.curr ?? null, data.slides_count ?? null])
		if (scope !== this.scope) this.reset(false)
		const slideChanged = this.slide !== null && slide !== this.slide
		this.scope = scope
		this.slide = slide

		for (const [variable, field] of TOTAL_FIELDS) {
			const incoming = data[field]
			let state = this.totals.get(variable)
			if (!state) {
				state = { value: incoming, pending: null }
				this.totals.set(variable, state)
			}
			if (isCount(incoming)) {
				if (state.pending) this.timers.clearTimeout(state.pending.timer)
				state.pending = null
				state.value = incoming
			} else if (state.pending) {
				// Even another slide change cannot prolong an unresolved hold.
				state.pending.latest = incoming
				updates[variable] = state.value
			} else if (slideChanged && isCount(state.value)) {
				const pending = { latest: incoming, timer: null }
				state.pending = pending
				pending.timer = this.timers.setTimeout(() => {
					if (this.totals.get(variable) !== state || state.pending !== pending) return
					state.pending = null
					state.value = pending.latest
					this.publish({ [variable]: pending.latest })
				}, 1000)
				updates[variable] = state.value
			} else {
				state.value = incoming
			}
		}
		return updates
	}
}

module.exports = { BuildTotalSmoother }
