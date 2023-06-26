// Name: Open Movie Database
// Shortcode:

import '@johnlindquist/kit'
import { Choice } from '@johnlindquist/kit'

type OMDbSearchResult = {
	Title: string
	Year: string
	imdbID: string
	Type: string
	Poster: string
}

const api_key = await env('OMDB_API_KEY')

const selectedMedia = (await arg({
	placeholder: 'Search for a movie or series',
	enter: 'Open in iMDb',
	onInput: _.debounce(async (query) => {
		setHint('Searching...')
		setChoices([])

		if (!query) {
			return
		}

		try {
			const choices = await searchMedia(query)
			setChoices(formatMediaChoices(choices))
			setHint(choices.length === 0 ? 'No media found' : '')
		} catch (error) {
			setHint(`Failed to fetch media: ${error}`)
		}
	}, 200),
	flags: {
		poster: {
			shortcut: 'ctrl+enter',
			name: 'Copy poster link',
			bar: 'right',
		},
	},
	height: 400,
})) satisfies {
	imdbID: string
	poster: string
}

if (flag?.poster) {
	await copy(selectedMedia.poster)
} else {
	browse(`https://www.imdb.com/title/${selectedMedia.imdbID}`)
}

function formatMediaChoices(media: OMDbSearchResult[]): Choice[] {
	return media.map((result) => {
		return {
			id: result.imdbID,
			value: {
				imdbID: result.imdbID,
				poster: result.Poster,
			},
			name: result.Title,
			description: `Release: ${result.Year ?? '?'}`,
			icon: result.Poster,
			preview: `<img class="max-h-full max-w-full" src=${result.Poster} alt="Poster for ${result.Title}">`,
		} satisfies Choice
	})
}

async function searchMedia(query) {
	let response = await fetch(
		`https://www.omdbapi.com/?apikey=${api_key}&s=${query}`
	)
	let data = (await response.json()) satisfies {
		Search: OMDbSearchResult[]
		totalResults: string
		Response: string
	}

	return data.Search
}
