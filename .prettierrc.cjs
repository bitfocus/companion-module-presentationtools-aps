module.exports = {
	...require('@companion-module/tools/.prettierrc.json'),
	// Preserve the reviewed template's .yarnrc.yml byte-for-byte.
	overrides: [{ files: '.yarnrc.yml', options: { singleQuote: false } }],
}
