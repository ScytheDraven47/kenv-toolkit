// Name: The Movie Database
// Shortcode: tmdb

import '@johnlindquist/kit'
import { Choice } from '@johnlindquist/kit'

const api_key = await env('TMDB_API_KEY')
const TMDbUrl = (path = '', params = {}) => {
	const url = new URL(`https://api.themoviedb.org/3${path}`)
	const allParams = {
		...Object.fromEntries(url.searchParams),
		...params,
		api_key,
	}
	url.search = new URLSearchParams(allParams).toString()
	return url.toString()
}
const TMDbImagePath = (path: string) =>
	`https://image.tmdb.org/t/p/original${path}`

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

type TMDbSeriesDetails = {
	adult: boolean
	backdrop_path: string
	created_by: []
	episode_run_time: number[]
	first_air_date: string
	genres: { id: number; name: string }[]
	homepage: string
	id: number
	in_production: boolean
	languages: string[]
	last_air_date: string
	last_episode_to_air: {
		id: number
		name: string
		overview: string
		vote_average: number
		vote_count: number
		air_date: string
		episode_number: number
		production_code: string
		runtime: number
		season_number: number
		show_id: number
		still_path: string
	}
	name: string
	next_episode_to_air: null
	networks: {
		id: number
		logo_path: string
		name: string
		origin_country: string
	}[]
	number_of_episodes: number
	number_of_seasons: number
	origin_country: ['JP']
	original_language: string
	original_name: string
	overview: string
	popularity: number
	poster_path: string
	production_companies: {
		id: number
		logo_path: string
		name: string
		origin_country: string
	}[]
	production_countries: { iso_3166_1: string; name: string }[]
	seasons: {
		air_date: string
		episode_count: number
		id: number
		name: string
		overview: string
		poster_path: string
		season_number: number
	}[]
	spoken_languages: { english_name: string; iso_639_1: string; name: string }[]
	status: string
	tagline: string
	type: string
	vote_average: number
	vote_count: number
}

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
		backdrop: {
			shortcut: 'ctrl+shift+enter',
			name: 'Copy backdrop link',
			bar: 'right',
		},
	},
	height: 400,
})) satisfies {
	id: string
	poster: string
	backdrop: string
}

if (flag?.poster) {
	await copy(selectedMedia.poster)
	exit()
} else if (flag?.backdrop) {
	await copy(selectedMedia.backdrop)
	exit()
}

const seriesDetails = await getSeriesDetails(selectedMedia.id)

await editor(formatMd(seriesDetails))
// await editor(JSON.stringify(seriesDetails, null, 2))

function formatMediaChoices(media: TMDbSearchResult[]): Choice[] {
	return media.map((result) => {
		let releaseYear = new Date(result.first_air_date).getFullYear()
		let posterSrc = TMDbImagePath(result.poster_path)
		let backdropSrc = TMDbImagePath(result.backdrop_path)
		return {
			id: result.id.toString(),
			value: {
				id: result.id.toString(),
				poster: posterSrc,
				backdrop: backdropSrc,
			},
			name: result.name,
			description: `Release: ${releaseYear ?? '?'}`,
			preview: `<div class='grid grid-cols-5 gap-4 p-4'>
				<img class='col-span-2' src=${posterSrc} alt="Poster for ${result.name}" />
				<img class='col-span-3' src=${backdropSrc} alt="Backdrop for ${result.name}" />
			</div>`,
		} satisfies Choice
	})
}

function formatMd(seriesDetails: TMDbSeriesDetails) {
	let releaseYear = new Date(seriesDetails.first_air_date).getFullYear()
	let posterSrc = TMDbImagePath(seriesDetails.poster_path)
	let backdropSrc = TMDbImagePath(seriesDetails.backdrop_path)
	return `---
watched: 
release: ${releaseYear}
finished: ${seriesDetails.status === 'Ended' ? 'true' : 'false'}
episode-length: ${seriesDetails.episode_run_time}
episode-count:
${seriesDetails.seasons
	.filter((season) => season.season_number > 0)
	.map((season) => ` - ${season.episode_count}`)
	.join('\n')}
genres:
${seriesDetails.genres
	.map((genre) => ` - ${genre.name.toLowerCase()}`)
	.join('\n')}
backdrop: ${backdropSrc}
poster: ${posterSrc}
---

![|300](${backdropSrc})

# ${seriesDetails.name}

${seriesDetails.overview}

![|300](${posterSrc})
`
}

async function searchSeries(query) {
	let response = await fetch(TMDbUrl('/search/tv', { query }))
	let data = (await response.json()) satisfies {
		page: number
		results: TMDbSearchResult[]
		total_pages: number
		total_results: number
	}

	return data.results
}

async function getSeriesDetails(id) {
	let response = await fetch(
		TMDbUrl(`/tv/${id}`, { append_to_response: 'images' })
	)
	let data = (await response.json()) satisfies TMDbSeriesDetails

	return data
}
