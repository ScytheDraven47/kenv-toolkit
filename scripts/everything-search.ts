// Name: Everything Search
// Shortcode: es

import '@johnlindquist/kit'
import { Choice } from '@johnlindquist/kit'
import { EverythingSearchResult } from '../lib/types/everything'
const csv = await npm('csvtojson')

const MAX_RESULTS = 100
let isRegex = false

const file = await arg({
	shortcuts: [
		{
			name: `Regex ${isRegex ? '✓' : '✗'}`,
			key: 'ctrl+r',
			bar: 'right',
			onPress: async (query, state) => {
				isRegex = !isRegex
				setName(`Regex ${isRegex ? '✓' : '✗'}`)
				await populateResults(query)
			},
		},
	],
	placeholder: 'Search Everything',
	debounceInput: 200,
	onInput: populateResults,
})

async function populateResults(query) {
	setHint('Searching...')
	await setChoices([])

	if (!query) {
		return
	}

	try {
		const choices = (await search(query)).map(formatChoice)
		await setChoices(choices)
		setHint(choices.length === 0 ? 'No results found' : '')
	} catch (error) {
		setHint(`Failed to fetch results: ${error}`)
	}
}

function formatChoice(result: EverythingSearchResult): Choice {
	let date = new Date(result['Date Modified']).toLocaleString()
	return {
		name: `${result.Name}`,
		description: `[${date}] ${result.Path}`,
	}
}

async function search(query) {
	const result = await execSearch(query)
	if (result.error) return []
	const results = await csv().fromString(result.value)
	// if (isRegex) inspect(results, 'es-results-regex')
	return results as EverythingSearchResult[]
}

async function execSearch(query: string): Promise<{
	error: boolean
	value: string
}> {
	const command = `es ${generateFlags()} ${query}`
	return await exec(command)
		.then((res) => {
			if (res.exitCode !== 0) throw res
			return {
				error: false,
				value: res.stdout,
			}
		})
		.catch((res) => {
			return {
				error: true,
				value: res.stderr,
			}
		})
}

function generateFlags() {
	const sortOptions = [
		'name',
		'path',
		'size',
		'extension',
		'date-created',
		'date-modified',
		'date-accessed',
		'attributes',
		'file-list-file-name',
		'run-count',
		'date-recently-changed',
		'date-run',
	]
	const optionalFlags = [
		// `-case`,
		// `-whole-word`,
		`-match-path`,
		// `-diacritics`,

		// `-offset 0`,
		`-max-results ${MAX_RESULTS}`,

		// `-path C:\\`,
		// `-parent-path C:\\`,
		// `-parent C:\\`,

		// `/ad`, //? Folders
		// `/a-d`, //? Files
		// `/a[RHSDAVNTPLCOIE]`, //? DIR style attributes serach

		// `-s`, //? Sort by full path
		`-sort-${sortOptions[5]}-descending`,
	]
	const requiredFlags = [
		`-csv`,

		`-name`,
		`-path-column`,
		`-full-path-and-name`,
		`-extension`,
		`-size`,
		`-date-created`,
		`-date-modified`,
		`-date-accessed`,
		`-attributes`,
		`-file-list-file-name`,
		`-run-count`,
		`-date-run`,
		`-date-recently-changed`,

		`-size-format 1`,
		`-date-format 1`,
	]
	const finalFlags = [...optionalFlags, ...requiredFlags]
	if (isRegex) finalFlags.push(`-regex`)
	return finalFlags.join(' ')
}
