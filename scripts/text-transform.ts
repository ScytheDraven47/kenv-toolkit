// Name: Text Transform

import '@johnlindquist/kit'

const { titleCase } = await npm('title-case')

const selectedText = await getSelectedText()

const upperText = selectedText.toLocaleUpperCase()
const lowerText = selectedText.toLocaleLowerCase()
const titleText = titleCase(selectedText)

const selectedOption = await micro('How do you want to transform this text?', [
	{
		name: 'UPPER CASE',
		description: truncateText(upperText),
		value: upperText,
	},
	{
		name: 'lower case',
		description: truncateText(lowerText),
		value: lowerText,
	},
	{
		name: 'Title Case',
		description: truncateText(titleText),
		value: titleText,
	},
])

await setSelectedText(selectedOption)

function truncateText(text: string) {
	return text.slice(0, 47).concat('...')
}
