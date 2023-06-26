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
const conversationName = await arg(
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

if (conversationName) {
	if (!conversationNames.includes(conversationName)) {
		conversationNames.push(conversationName)
		write()
	}
}

const bot = new Bard(`__Secure-1PSID=${bardCookie}`)
let chatName = `Ask Bard - ${conversationName || 'tmp'}`
let conversationId = conversationName || `tmp-${new Date().toISOString()}`
let saveFile = `ask-bard-conversation-${conversationName}${new Date().toISOString()}`
let currentMessage = ``

await chat({
	name: chatName,
	shortcuts: [
		{
			name: 'Speak',
			key: 'ctrl+r',
			bar: 'right',
			onPress: async () => {
				const prevMessage = (await getLastBardMessage()).text
				say(prevMessage, {
					name: 'Microsoft Zira - English (United States)',
					rate: 1.2,
					pitch: 0.9,
				})
			},
		},
		{
			name: 'Done',
			key: 'ctrl+enter',
			bar: 'right',
			onPress: async () => {
				await saveChat()
				process.exit(0)
			},
		},
	],
	onSubmit: async (prompt) => {
		//* Instant reply
		// let response = await bot.ask(prompt)
		// chat.addMessage(response)

		//* Typed reply
		chat.addMessage(`...`)
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

async function saveChat() {
	const conversation = await chat.getMessages()
	await inspect(
		conversation,
		// .map(
		// 	(message) =>
		// 		`${message.position === 'left' ? 'Bard:' : 'Human:'}\n${message.text}`
		// )
		// .join('\n\n'),
		saveFile
	)
}

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
