// Name: The Movie Database
// Shortcode: tmdb

import '@johnlindquist/kit'
import { Choice } from '@johnlindquist/kit'
import {
	TMDbSearchResponse,
	TMDbSearchResult,
	TMDbSeriesDetailsWithImages,
} from '../lib/types/tmdb'

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

function formatMd(seriesDetails: TMDbSeriesDetailsWithImages) {
	let releaseYear = new Date(seriesDetails.first_air_date).getFullYear()
	let posterSrc = TMDbImagePath(seriesDetails.poster_path)
	let backdropSrc = TMDbImagePath(seriesDetails.backdrop_path)
	return `---
tmdb-id: ${seriesDetails.id}
watched: 
banner: "${backdropSrc}"
cover: "${posterSrc}"
---

# ${seriesDetails.name}

[release:: ${releaseYear}]
[status:: "${seriesDetails.status}"]
[runtime:: ${seriesDetails.episode_run_time}min]
[genres:: ${seriesDetails.genres
		.map((genre) => `"${genre.name.toLowerCase()}"`)
		.join(', ')}]

${seriesDetails.overview}

## Seasons

| # | Season | Release | Episodes | Art |
| - | ------ | ------- | -------- | --- |
${seriesDetails.seasons
	.sort((a, b) => a.season_number - b.season_number)
	.map(
		(season) =>
			'| ' +
			[
				season.season_number,
				season.name,
				new Date(season.air_date).getFullYear(),
				season.season_number === 0
					? season.episode_count
					: `(episode-count:: ${season.episode_count})`,
				`![\\|50](${TMDbImagePath(season.poster_path)})`,
			].join(' | ') +
			' |'
	)
	.join('\n')}

${seriesDetails.images.backdrops
	.map((image) => `![|100](${TMDbImagePath(image.file_path)})`)
	.join(' ')}

${seriesDetails.images.logos
	.map((image) => `![|100](${TMDbImagePath(image.file_path)})`)
	.join(' ')}

${seriesDetails.images.posters
	.map((image) => `![|100](${TMDbImagePath(image.file_path)})`)
	.join(' ')}
`
}

async function searchSeries(query) {
	let response = await fetch(TMDbUrl('/search/tv', { query }))
	let data = (await response.json()) satisfies TMDbSearchResponse

	return data.results
}

async function getSeriesDetails(id) {
	console.log(TMDbUrl(`/tv/${id}`, { append_to_response: 'images' }))
	let response = await fetch(
		TMDbUrl(`/tv/${id}`, { append_to_response: 'images' })
	)
	let data = (await response.json()) satisfies TMDbSeriesDetailsWithImages

	return data
}
