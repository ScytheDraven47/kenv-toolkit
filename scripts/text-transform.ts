// Name: Text Manipulation
// Author: ramiroaraujo
// Description: Transform clipboard text based on user-selected options

import '@johnlindquist/kit'

let transformations = {
	upperCase: (text) => text.toUpperCase(),
	lowerCase: (text) => text.toLowerCase(),
	capitalize: (text) =>
		text
			.split('\n')
			.map((line) =>
				line
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')
			)
			.join('\n'),
	decodeUrl: (text) =>
		text
			.split('\n')
			.map((line) => decodeURIComponent(line))
			.join('\n'),
	snakeCase: (text) =>
		text
			.split('\n')
			.map((line) =>
				line
					.replace(/[\s-_]+(\w)/g, (_, p) => `_${p.toLowerCase()}`)
					.replace(/^[A-Z]/, (match) => match.toLowerCase())
			)
			.join('\n'),
	camelCase: (text) =>
		text
			.split('\n')
			.map((line) =>
				line
					.replace(/[\s-_]+(\w)/g, (_, p) => p.toUpperCase())
					.replace(/^[A-Z]/, (match) => match.toLowerCase())
			)
			.join('\n'),
	kebabCase: (text) =>
		text
			.split('\n')
			.map((line) =>
				line
					.replace(/[\s-_]+(\w)/g, (_, p) => `-${p.toLowerCase()}`)
					.replace(/^[A-Z]/, (match) => match.toLowerCase())
			)
			.join('\n'),
	reverseCharacters: (text) =>
		text
			.split('\n')
			.map((line) => line.split('').reverse().join(''))
			.join('\n'),
	removeDuplicateLines: (text) => {
		let lines = text.split('\n')
		return [...new Set(lines)].join('\n')
	},
	keepOnlyDuplicateLines: (text) => {
		let lines = text.split('\n')
		let duplicates = lines.filter(
			(item, index) => lines.indexOf(item) !== index
		)
		return [...new Set(duplicates)].join('\n')
	},
	removeEmptyLines: (text) =>
		text
			.split('\n')
			.filter((line) => line.trim() !== '')
			.join('\n'),
	removeAllNewLines: (text) =>
		text
			.split('\n')
			.map((line) => line.trim())
			.join(''),
	trimEachLine: (text) =>
		text
			.split('\n')
			.map((line) => line.trim())
			.join('\n'),
	sortLinesAlphabetically: (text) => text.split('\n').sort().join('\n'),
	sortLinesNumerically: (text) =>
		text
			.split('\n')
			.sort((a, b) => a - b)
			.join('\n'),
	reverseLines: (text) => text.split('\n').reverse().join('\n'),
	shuffleLines: (text) => {
		let lines = text.split('\n')
		for (let i = lines.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1))
			let temp = lines[i]
			lines[i] = lines[j]
			lines[j] = temp
		}
		return lines.join('\n')
	},
	joinBy: (text, separator) => text.split('\n').join(separator),
	splitBy: (text, separator) => text.split(separator).join('\n'),
	removeWrapping: (text) => {
		const lines = text.split('\n')
		const matchingPairs = [
			['(', ')'],
			['[', ']'],
			['{', '}'],
			['<', '>'],
			['"', '"'],
			["'", "'"],
		]
		return lines
			.map((line) => {
				const firstChar = line.charAt(0)
				const lastChar = line.charAt(line.length - 1)

				for (const [open, close] of matchingPairs) {
					if (firstChar === open && lastChar === close) {
						return line.slice(1, -1)
					}
				}

				if (firstChar === lastChar) {
					return line.slice(1, -1)
				}

				return line
			})
			.join('\n')
	},
	wrapEachLine: (text, wrapper) => {
		const lines = text.split('\n')

		return lines.map((line) => `${wrapper}${line}${wrapper}`).join('\n')
	},
	captureEachLine: (text, regex) => {
		const lines = text.split('\n')
		const pattern = new RegExp(regex)

		return lines
			.map((line) => {
				const match = line.match(pattern)
				return match ? match[0] : ''
			})
			.join('\n')
	},
	removeLinesMatching: (text, regex) => {
		if (regex.length === 0) return text
		const lines = text.split('\n')
		const pattern = new RegExp(regex, 'i')

		return lines.filter((line) => !pattern.test(line)).join('\n')
	},
	keepLinesMatching: (text, regex) => {
		if (regex.length === 0) return text
		const lines = text.split('\n')
		const pattern = new RegExp(regex, 'i')

		return lines.filter((line) => pattern.test(line)).join('\n')
	},
	prependTextToAllLines: (text, prefix) => {
		const lines = text.split('\n')
		return lines.map((line) => prefix + line).join('\n')
	},

	appendTextToAllLines: (text, suffix) => {
		const lines = text.split('\n')
		return lines.map((line) => line + suffix).join('\n')
	},

	replaceRegexInAllLines: (text, regexWithReplacement) => {
		const [regex, replacement] = regexWithReplacement.split('|')
		const pattern = new RegExp(regex, 'g')
		const lines = text.split('\n')
		return lines.map((line) => line.replace(pattern, replacement)).join('\n')
	},
	removeRegexInAllLines: (text, regex) => {
		const pattern = new RegExp(regex, 'g')
		const lines = text.split('\n')
		return lines.map((line) => line.replace(pattern, '')).join('\n')
	},
	generateNumberedList: (text) => {
		const lines = text.split('\n')
		return lines.map((line, index) => `${index + 1}. ${line}`).join('\n')
	},
	noop: (text) => text,
}

let options = [
	// Existing options here
	{
		name: 'Decode URL',
		description: 'Decode a URL-encoded text',
		value: {
			key: 'decodeUrl',
		},
	},
	{
		name: 'Upper Case',
		description: 'Transform the entire text to upper case',
		value: {
			key: 'upperCase',
		},
	},
	{
		name: 'Lower Case',
		description: 'Transform the entire text to lower case',
		value: {
			key: 'lowerCase',
		},
	},
	{
		name: 'snake_case',
		description: 'Convert text to snake_case',
		value: {
			key: 'snakeCase',
		},
	},
	{
		name: 'Capitalize',
		description: 'Convert text to Capital Case',
		value: {
			key: 'capitalize',
		},
	},
	{
		name: 'camelCase',
		description: 'Convert text to camelCase',
		value: {
			key: 'camelCase',
		},
	},
	{
		name: 'kebab-case',
		description: 'Convert text to kebab-case',
		value: {
			key: 'kebabCase',
		},
	},
	{
		name: 'Reverse Characters',
		description: 'Reverse the characters in the text',
		value: {
			key: 'reverseCharacters',
		},
	},
	{
		name: 'Remove Duplicate Lines',
		description: 'Remove duplicate lines from the text',
		value: {
			key: 'removeDuplicateLines',
		},
	},
	{
		name: 'Keep Only Duplicate Lines',
		description: 'Keep only duplicate lines in the text',
		value: {
			key: 'keepOnlyDuplicateLines',
		},
	},
	{
		name: 'Remove Empty Lines',
		description: 'Remove empty lines from the text',
		value: {
			key: 'removeEmptyLines',
		},
	},
	{
		name: 'Remove All New Lines',
		description: 'Remove all new lines from the text',
		value: {
			key: 'removeAllNewLines',
		},
	},
	{
		name: 'Trim Each Line',
		description: 'Trim whitespace from the beginning and end of each line',
		value: {
			key: 'trimEachLine',
		},
	},
	{
		name: 'Sort Lines Alphabetically',
		description: 'Sort lines alphabetically',
		value: {
			key: 'sortLinesAlphabetically',
		},
	},
	{
		name: 'Sort Lines Numerically',
		description: 'Sort lines numerically',
		value: {
			key: 'sortLinesNumerically',
		},
	},
	{
		name: 'Reverse Lines',
		description: 'Reverse the order of lines',
		value: {
			key: 'reverseLines',
		},
	},
	{
		name: 'Shuffle Lines',
		description: 'Randomly shuffle the order of lines',
		value: {
			key: 'shuffleLines',
		},
	},
	{
		name: 'Join By',
		description: 'Join lines by a custom separator',
		value: {
			key: 'joinBy',
			parameter: {
				name: 'Separator',
				description: 'Enter a separator to join lines',
				defaultValue: ',',
			},
		},
	},
	{
		name: 'Split By',
		description: 'Split lines by a custom separator',
		value: {
			key: 'splitBy',
			parameter: {
				name: 'Separator',
				description: 'Enter a separator to split lines',
			},
		},
	},
	{
		name: 'Remove Wrapping',
		description: 'Remove wrapping characters from each line',
		value: {
			key: 'removeWrapping',
		},
	},
	{
		name: 'Wrap Each Line With',
		description: 'Wrap each line with a custom character or string',
		value: {
			key: 'wrapEachLine',
			parameter: {
				name: 'Wrapper',
				description: 'Enter a wrapper for each line',
				defaultValue: '"',
			},
		},
	},
	{
		name: 'Capture Each Line',
		description:
			'Capture and return the first match of a regex pattern in each line',
		value: {
			key: 'captureEachLine',
			parameter: {
				name: 'Pattern',
				description: 'Enter a regex pattern to capture',
				defaultValue: '\\d+',
			},
		},
	},
	{
		name: 'Remove Lines Matching',
		description: 'Remove lines that match the given regex',
		value: {
			key: 'removeLinesMatching',
			parameter: {
				name: 'Regex',
				description: 'Enter a regex to match lines to remove',
				defaultValue: '',
			},
		},
	},
	{
		name: 'Keep Lines Matching',
		description: 'Keep lines that match the given regex',
		value: {
			key: 'keepLinesMatching',
			parameter: {
				name: 'Regex',
				description: 'Enter a regex to match lines to keep',
				defaultValue: '',
			},
		},
	},
	{
		name: 'Prepend Text to All Lines',
		description: 'Add text to the beginning of all lines',
		value: {
			key: 'prependTextToAllLines',
			parameter: {
				name: 'Text',
				description: 'Enter text to prepend to all lines',
				defaultValue: '',
			},
		},
	},
	{
		name: 'Append Text to All Lines',
		description: 'Add text to the end of all lines',
		value: {
			key: 'appendTextToAllLines',
			parameter: {
				name: 'Text',
				description: 'Enter text to append to all lines',
				defaultValue: '',
			},
		},
	},
	{
		name: 'Replace Regex in All Lines',
		description: 'Replace regex matches in all lines with specified text',
		value: {
			key: 'replaceRegexInAllLines',
			parameter: {
				name: 'Regex and Replacement',
				description: "Enter regex and replacement text separated by a '|'",
				defaultValue: '',
			},
		},
	},
	{
		name: 'Generate Numbered List',
		description: 'Prepend numbers to each line',
		value: {
			key: 'generateNumberedList',
		},
	},
	{
		name: 'Remove Regex In All Lines',
		description: 'Remove matches of the provided regex in all lines',
		value: {
			key: 'removeRegexInAllLines',
			parameter: {
				name: 'Regex',
				description: 'Enter a regex to remove from all lines',
			},
		},
	},
	{
		name: 'No Operation',
		description:
			'Do nothing to the text, if you accidentally hit Cmd + enter and need no more transformations',
	},
]

const handleTransformation = async (text, transformation) => {
	let { key, parameter } = transformation
	let paramValue = parameter
		? await arg(
				{
					input: parameter.defaultValue,
				},
				(input) => md(`<pre>${transformations[key](text, input)}</pre>`)
		  )
		: null
	return transformations[key](text, paramValue)
}

let flags = {
	rerun: {
		name: 'Rerun',
		shortcut: 'cmd+enter',
	},
}

let clipboardText = await clipboard.readText()
let operations: string[] = []
let rerun = true

while (rerun) {
	let transformation = await arg(
		{
			placeholder: 'Choose a text transformation (Cmd + enter to rerun)',
			flags,
			hint: operations.join(' > '),
		},
		options
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((option) => {
				return {
					...option,
					preview: () => {
						try {
							if (option.value.parameter) throw ''
							return md(
								`<pre>${transformations[option.value.key](clipboardText)}</pre>`
							)
						} catch (e) {
							return '...'
						}
					},
				}
			})
	)
	rerun = flag?.rerun as boolean

	clipboardText = await handleTransformation(clipboardText, transformation)
	operations.push(transformation.key)
}

await clipboard.writeText(clipboardText)

await notify('Text transformation applied and copied to clipboard')
