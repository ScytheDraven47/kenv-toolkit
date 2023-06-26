// Name: The Movie Database
// Shortcode:

import '@johnlindquist/kit'
import { Choice } from '@johnlindquist/kit'

type TMDbSearchResult = {
	adult: boolean
	backdrop_path: string
	genre_ids: number[]
	id: number
	origin_country: string[]
	original_language: string
	original_name: string
	overview: string
	popularity: number
	poster_path: string
	first_air_date: string
	name: string
	vote_average: number
	vote_count: number
}

const api_key = await env('TMDB_API_KEY')

// const selectedMediaType = await arg('Movie or Series', ['Movie', 'Series'])

const selectedMedia = (await arg({
	placeholder: `Search for a series`,
	onInput: _.debounce(async (query) => {
		setHint('Searching...')
		setChoices([])

		if (!query) {
			return
		}

		try {
			const choices = await searchSeries(query)
			debugger
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
	id: string
	poster: string
}

if (flag?.poster) {
	await copy(selectedMedia.poster)
} else {
	// browse(`${selectedMedia.id}`)
}

function formatMediaChoices(media: TMDbSearchResult[]): Choice[] {
	return media.map((result) => {
		let releaseYear = new Date(result.first_air_date).getFullYear()
		let posterSrc = `https://image.tmdb.org/t/p/original${result.poster_path}`
		return {
			id: result.id.toString(),
			value: {
				id: result.id.toString(),
				poster: posterSrc,
			},
			name: result.name,
			description: `Release: ${releaseYear ?? '?'}`,
			preview: `<img class="max-h-full max-w-full" src=${posterSrc} alt="Poster for ${result.name}">`,
		} satisfies Choice
	})
}

async function searchSeries(query) {
	let response = await fetch(
		`https://api.themoviedb.org/3/search/tv?api_key=${api_key}&query=${query}`
	)
	debugger
	let data = (await response.json()) satisfies {
		page: number
		results: TMDbSearchResult[]
		total_pages: number
		total_results: number
	}
	debugger

	return data.results
}
