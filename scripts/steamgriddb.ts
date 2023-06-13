// Name: SteamGridDB
// Shortcode: steamgrid

import '@johnlindquist/kit'
import { Choice, PromptConfig } from '@johnlindquist/kit'
import SGDB, { SGDBGame, SGDBImage } from 'steamgriddb'

interface SGDBGameExtended extends SGDBGame {
	release_date?: number
}
interface SGDBImageExtended extends SGDBImage {
	width?: number
	height?: number
}

const client = new SGDB(await env('STEAMGRIDDB_API_KEY'))

const selectedGame = await arg({
	placeholder: 'Search for a game',
	enter: 'Select Game',
	onInput: _.debounce(async (query) => {
		setHint('Searching...')
		setChoices([])

		if (!query) {
			return
		}

		try {
			const choices = await client.searchGame(query)
			setChoices(formatGameChoices(choices))
			setHint(choices.length === 0 ? 'No games found' : '')
		} catch (error) {
			setHint(`Failed to fetch games: ${error}`)
		}
	}, 200),
})

const tabs = [
	{
		name: 'Grids',
		choices: await client.getGridsById(Number(selectedGame)),
	},
	{
		name: 'Heroes',
		choices: await client.getHeroesById(Number(selectedGame)),
	},
	{
		name: 'Logos',
		choices: await client.getLogosById(Number(selectedGame)),
	},
	{
		name: 'Icons',
		choices: await client.getIconsById(Number(selectedGame)),
	},
]

const tabConfig = {
	placeholder: 'Select an image',
	shortcuts: [
		{
			name: 'copy',
			key: 'ctrl+c',
			onPress: (_, state) => {
				copy(state.focused.value)
			},
			bar: 'right',
		},
	],
} as PromptConfig

tabs.forEach((tab) => {
	onTab(tab.name, async () => {
		await arg(tabConfig, formatImageChoices(tab.choices))
	})
})

function formatGameChoices(games: SGDBGameExtended[]): Choice[] {
	return games.map((game) => {
		let releaseYear = null
		if (game?.release_date) {
			releaseYear = new Date(game.release_date * 1000).getFullYear()
		}
		return {
			id: game.id.toString(),
			value: game.id.toString(),
			name: game.name,
			description: `Release: ${releaseYear ?? '?'}`,
		} satisfies Choice
	})
}

function formatImageChoices(images: SGDBImageExtended[]): Choice[] {
	return images.map((image) => {
		let ratioType = 'square'
		if (image.width >= image.height * 1.25) {
			ratioType = 'landscape'
		}
		if (image.height >= image.width * 1.25) {
			ratioType = 'portrait'
		}
		return {
			id: image.id.toString(),
			name: `${ratioType} [${image.width}x${image.height}]`,
			description: `${image.score} ↑ | @${image.author.name}`,
			value: image.url.toString(),
			onSubmit: async () => {
				let url = image.url.toString()
				copy(url)
				await widget(
					`<img class="object-contain max-w-max max-w-max h-full w-full pointer-events-none" src="${image.url.toString()}" />`,
					{
						height: image.height,
						width: image.width,
					}
				)
			},
			icon: image.thumb.toString(),
			preview: () =>
				`<img class="object-contain max-w-max max-w-max h-full w-full" src="${image.thumb.toString()}" />${
					image.notes ? md(image.notes) : ''
				}`,
		}
	})
}
