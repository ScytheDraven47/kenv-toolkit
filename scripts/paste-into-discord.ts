// Name: Paste into Discord
// Description: Wraps code in Discord-friendly markdown and converts tabs to spaces
// TODO: Add more languages

import '@johnlindquist/kit'

const initialText = await getClipboardHistory()

const numSpaces = 2

const language = await arg('Which language are you using?', [
	{ name: 'TypeScript', id: 'ts', value: 'ts' },
	{ name: 'JavaScript', id: 'js', value: 'js' },
	{ name: 'HTML', id: 'html', value: 'html' },
	{ name: 'C', id: 'c', value: 'c' },
	{ name: 'C#', id: 'cs', value: 'cs' },
	{ name: 'CSS', id: 'css', value: 'css' },
	{ name: 'bash', id: 'bash', value: 'bash' },
	{ name: 'Command Line', id: 'cmd', value: 'cmd' },
])

const minTabs = initialText[0].value.split(/\r?\n/).reduce((prev, curr) => {
	if (/^\t*$/.test(curr)) return prev
	const match = curr.match(/^(\t)+/g)
	const count = match ? match[0].length : 0
	return Math.min(prev, count)
}, Number.MAX_VALUE)

const newText = initialText[0].value
	.replace(/^\t+/gm, (match) =>
		' '.repeat(numSpaces * (match.length - minTabs))
	)
	.trim()

await setSelectedText(`\`\`\`${language}\n${newText}\n\`\`\``)
