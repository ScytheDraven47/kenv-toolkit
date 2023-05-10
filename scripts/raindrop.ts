// Name: Raindrop
// Description: Search your Raindrop.io bookmarks
// Author: Bruno Paz
// Github: @brpaz
// Shortcode: rd

import '@johnlindquist/kit'
import { Choice } from '@johnlindquist/kit'

const COLLECTION_ID_ALL = 0
const COLLECTION_ID_UNSORTED = -1

interface RaindropResponse {
	items: RaindropBookmark[]
}

interface RaindropBookmark {
	_id: string
	title: string
	link: string
	excerpt: string
	tags: string[]
	created: string
	type: string
}

const raindropAPIKey = await env('RAINDROP_API_KEY', {
	placeholder: 'Enter your Raindrop.io Test API Key',
	hint: md(
		`Get a [Raindrop.io Test API Key](https://app.raindrop.io/settings/integrations)`
	),

	secret: true,
})

async function raindropSearch(
	query: string,
	collectionId: number
): Promise<Choice[]> {
	const url = `https://api.raindrop.io/rest/v1/raindrops/${collectionId}?search=${query}&access_token=${raindropAPIKey}`

	const response = await get(url)
	const data: RaindropResponse = await response.data

	return data.items.map((item) => ({
		name: item.title,
		description: item.excerpt,
		value: item.link,
		onSubmit: async () => {
			open(item.link)
		},
	}))
}

async function allBookmarks() {
	await arg({
		placeholder: 'Search your Raindrop.io bookmarks',
		enter: 'Open in Raindrop.io',
		onInput: _.debounce(async (query) => {
			setHint('Searching...')
			setChoices([])

			if (!query) {
				return
			}

			try {
				const choices = await raindropSearch(query, COLLECTION_ID_ALL)
				setChoices(choices)
				setHint(choices.length === 0 ? 'No bookmarks found' : '')
			} catch (error) {
				setHint(`Failed to fetch bookmarks: ${error}`)
			}
		}, 200),
	})
}

async function unsortedBookmarks() {
	await arg({
		placeholder: 'Search your Raindrop.io unsorted bookmarks',
		enter: 'Open in Raindrop.io',
		onInput: _.debounce(async (query) => {
			setHint('Searching...')
			setChoices([])

			if (!query) {
				return
			}

			try {
				const choices = await raindropSearch(query, COLLECTION_ID_UNSORTED)
				setChoices(choices)
				setHint(choices.length === 0 ? 'No bookmarks found' : '')
			} catch (error) {
				setHint(`Failed to fetch bookmarks: ${error}`)
			}
		}, 200),
	})
}

onTab('All', allBookmarks)
onTab('Unsorted', unsortedBookmarks)
