// Name: Ask Bard
// Shortcode: bard

import '@johnlindquist/kit'
import { Bard } from 'googlebard'

const bardCookie = await env('BARD_COOKIE', {
	description: `Log in to https://bard.google.com then retrieve your "__Secure-1PSID" cookie from your browser's Developer Tools -> Storage tab`,
})

const { conversationNames, write } = await db('ask-bard-conversation-names', {
	conversationNames: [],
})
const conversationId = await arg(
	{
		placeholder: 'Select a conversation',
		strict: false,
		shortcuts: [
			{
				name: 'Skip',
				key: 'ctrl+enter',
				onPress: () => submit(null),
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

await chat({
	name: `Ask Bard - ${conversationId || 'tmp'}`,
	onSubmit: async (prompt) => {
		let response
		if (conversationId) {
			response = await bot.ask(prompt, conversationId)
		} else {
			response = await bot.ask(prompt)
		}
		let messages = await chat.getMessages()
		chat.addMessage(response)
	},
})

// Simulating response streaming

// await bot.askStream(
// 	(res) => {
// 		inspect(res, 'ask-bard-response-stream')
// 	},
// 	prompt,
// 	conversationId
// )
