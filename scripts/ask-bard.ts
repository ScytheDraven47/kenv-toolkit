// Name: Ask Bard
// Shortcode: bard

import '@johnlindquist/kit'
import { Bard } from 'googlebard'

const bardCookie = await env('BARD_COOKIE', {
	hint: md(
		`Log in to [https://bard.google.com](https://bard.google.com) then retrieve your "__Secure-1PSID" cookie from your browser's Developer Tools -> Storage tab`
	),
})

const { conversationNames, write } = await db('ask-bard-conversation-names', {
	conversationNames: [],
})
const conversationId = await arg(
	{
		placeholder: 'Start a new conversation:',
		hint: 'Or select a previous one. Ctrl+Enter to skip.',
		strict: false,
		shortcuts: [
			{
				name: 'Skip',
				key: 'ctrl+enter',
				onPress: () => {
					submit(null)
				},
				bar: 'right',
			},
		],
	},
	conversationNames
)

if (conversationId) {
	if (!conversationNames.includes(conversationId)) {
		conversationNames.push(conversationId)
		write()
	}
}

const bot = new Bard(`__Secure-1PSID=${bardCookie}`)
let currentMessage = ``

await chat({
	name: `Ask Bard - ${conversationId || 'tmp'}`,
	shortcuts: [
		{
			name: 'Speak',
			key: 'ctrl+r',
			bar: 'right',
			onPress: async () => {
				const prevMessage = (await getLastBardMessage()).text
				say(prevMessage, {})
			},
		},
	],
	onSubmit: async (prompt) => {
		//* Instant reply
		// let response = await bot.ask(prompt)
		// chat.addMessage(response)

		//* Typed reply
		chat.addMessage(``)
		await bot.askStream(
			async (res) => {
				currentMessage += res
				const index = (await getLastBardMessage()).index
				chat.setMessage(index, md(currentMessage))
			},
			prompt,
			conversationId
		)
		currentMessage = ``
	},
})

const conversation = await chat.getMessages()
inspect(
	conversation
		.map(
			(message) =>
				`${message.position === 'left' ? 'Bard:\n' : 'Human:\n'}${message.text}`
		)
		.join('\n\n')
)

function findLastIndex<T>(
	array: Array<T>,
	predicate: (value: T, index: number, obj: T[]) => boolean
): number {
	let l = array.length
	while (l--) {
		if (predicate(array[l], l, array)) return l
	}
	return -1
}

async function getLastBardMessage() {
	const messages = await chat.getMessages()
	const index = findLastIndex(
		messages,
		(message) => message.position === 'left'
	)
	const message = messages[index]
	return { index, ...message }
}
