// Name: Bitwarden Passwords
// Author: ScytheDraven47
// Shortcode: bw
// installs @bitwaden/cli globally

import '@johnlindquist/kit'
import { Choice } from '@johnlindquist/kit'
import {
	BitwardenCommandResponse,
	BitwardenFolder,
	BitwardenItem,
	BitwardenPasswordItem,
	BitwardenStatus,
	isPassword,
} from '../lib/types/bitwarden'

const LOGGING = false

let status = null
statusCheck: while (status !== 'unlocked') {
	LOGGING && console.log('checking status...')
	status = await getStatus()
	LOGGING && console.log(status)
	switch (status) {
		case 'uninstalled':
			LOGGING && console.log('requesting install...')
			await installOrExit()
			break
		case 'unauthenticated':
			LOGGING && console.log('logging in...')
			if (await login()) break statusCheck
			break
		case 'locked':
			LOGGING && console.log('unlocking...')
			if (await unlock()) break statusCheck
			break
		case 'unlocked':
			LOGGING && console.log('loading passwords...')
			break
	}
}

const items = await getItems()
const folders = await getFolders()

const selectedEntry = await micro(
	{
		placeholder: 'Bitwarden Passwords',
		key: 'bitwarden-passwords',
		flags: {
			pasteBoth: {
				shortcut: 'ctrl+shift+enter',
				name: 'Paste Both (with Tab)',
				bar: 'right',
			},
			copyUsername: {
				shortcut: 'ctrl+enter',
				name: 'Copy Username',
				bar: 'right',
			},
			copyPassword: {
				shortcut: 'enter',
				name: 'Copy Password',
				bar: 'right',
			},
		},
	},
	items.map(formatChoice)
)

if (flag?.copyUsername) {
	await copy(selectedEntry.username)
} else if (flag?.pasteBoth) {
	await setSelectedText(selectedEntry.username)
	keyboard.pressKey(Key.Tab)
	await setSelectedText(selectedEntry.password)
} else {
	await copy(selectedEntry.password)
}

//?-------------------------------?//
//?       Process Functions       ?//
//?-------------------------------?//

async function getStatus(): Promise<BitwardenStatus> {
	let result
	if (process.env?.BW_SESSION_KEY) {
		result = await execBitwardenCommand(
			`status --session ${process.env.BW_SESSION_KEY}`
		)
	} else {
		result = await execBitwardenCommand(`status`)
	}
	if (!result.error) {
		const resultStatus = JSON.parse(result.value)
		return resultStatus.status
	} else {
		return `uninstalled`
	}
}

async function installOrExit() {
	const choice = await mini(
		'You seem to be missing @bitwarden/cli, do you consent to a global install?',
		['Yes', 'No']
	)
	if (choice === 'Yes') {
		await term('npm i -g @bitwarden/cli')
	} else {
		exit()
	}
}

async function login(): Promise<boolean> {
	const username = await mini('Enter your email.')
	const password = await mini({
		placeholder: 'Enter your master password.',
		secret: true,
	})
	const method = await mini('Select your 2FA method, if any.', [
		{
			name: 'None',
			value: null,
		},
		{
			name: 'Authenticator',
			value: 0,
		},
		{
			name: 'Email (TBD)',
			value: 1,
			disableSubmit: true,
		},
		{
			name: 'YubiKey (TBD)',
			value: 3,
			disableSubmit: true,
		},
	])
	let mfa = ''
	if (method !== null) {
		const mfaKey = await mini({
			placeholder: 'Please enter your 2FA code.',
			height: PROMPT.HEIGHT.INPUT_ONLY,
		})
		mfa = `--method ${method} --code ${mfaKey}`
	}

	const result = await execBitwardenCommand(
		`login "${username}" "${password}" ${mfa} --raw`
	)

	if (result.error) {
		LOGGING && console.log('login failed')
		return false
	}

	await updateSessionEnv('BW_SESSION_KEY', result.value)
	return true
}

async function unlock(): Promise<boolean> {
	const password = await mini({
		placeholder: 'Invalid session, Enter your master password.',
		secret: true,
	})

	const result = await execBitwardenCommand(`unlock "${password}" --raw`)

	if (result.error) {
		LOGGING && console.log('unlock failed')
		return false
	}

	await updateSessionEnv('BW_SESSION_KEY', result.value)
	return true
}

async function getItems(): Promise<BitwardenPasswordItem[]> {
	const result = await execBitwardenCommand(
		`list items --session ${process.env.BW_SESSION_KEY}`
	)
	if (result.error) return []
	const items = JSON.parse(result.value) as BitwardenItem[]

	const passwordItems = items.filter(isPassword)

	return passwordItems
}

async function getFolders(): Promise<BitwardenFolder[]> {
	const result = await execBitwardenCommand(
		`list folders --session ${process.env.BW_SESSION_KEY}`
	)
	if (result.error) return []
	const folders = JSON.parse(result.value) as BitwardenFolder[]

	return folders
}

//?------------------------------?//
//?       Helper Functions       ?//
//?------------------------------?//

async function execBitwardenCommand(
	command: string
): Promise<BitwardenCommandResponse> {
	return await exec(`bw ${command}`)
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

async function updateSessionEnv(key, value) {
	process.env.BW_SESSION_KEY = value
	if (typeof process.env?.[key] !== 'undefined') {
		await replace({
			files: kenvPath('.env').replaceAll(/\\/g, '/'),
			from: new RegExp(`${key}=.*`),
			to: `${key}=${value}`,
			glob: {
				dot: true,
			},
		})
	} else {
		await env(key, () => value)
	}
}

function formatChoice(item: BitwardenPasswordItem): Choice {
	const folder = folders.find((folder) => folder.id === item.folderId)
	return {
		id: item.id,
		name: `${item.name} (${item.login.username})`,
		description: `[${folder.name}] ${item.notes || ''}`,
		value: {
			username: item.login.username,
			password: item.login.password,
		},
	}
}
