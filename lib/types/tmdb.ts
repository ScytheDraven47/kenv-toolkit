export type TMDbSearchResult = {
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

export type TMDbSearchResponse = {
	page: number
	results: TMDbSearchResult[]
	total_pages: number
	total_results: number
}

export type TMDbSeriesDetails = {
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

export type TMDbImageDetails = {
	aspect_ratio: number
	height: number
	iso_639_1: string
	file_path: string
	vote_average: number
	vote_count: number
	width: number
}

export type TMDbSeriesDetailsWithImages = TMDbSeriesDetails & {
	images: {
		backdrops: TMDbImageDetails[]
		logos: TMDbImageDetails[]
		posters: TMDbImageDetails[]
	}
}
