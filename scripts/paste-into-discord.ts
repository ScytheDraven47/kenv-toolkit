// Name: Paste into Discord
// Description: Wraps code in Discord-friendly markdown and converts tabs to spaces
// TODO: Un-indent so at least one line is at 0
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

const newText = initialText[0].value
	.replace(/^\t+/gm, (match) => ' '.repeat(numSpaces * match.length))
	.trim()

await setSelectedText(`\`\`\`${language}\n${newText}\n\`\`\``)
