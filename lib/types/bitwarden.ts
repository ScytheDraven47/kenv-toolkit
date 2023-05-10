export type BitwardenCommandResponse = {
	error: boolean
	value: string
}

export type BitwardenStatus =
	| 'unauthenticated'
	| 'unlocked'
	| 'uninstalled'
	| 'locked'

export type BitwardenFolder = {
	object: string
	id: string
	name: string
}
export type BitwardenCardItem = {
	object: string
	id: string
	organizationId: any
	folderId: string
	type: 3
	reprompt: number
	name: string
	notes: any
	favorite: boolean
	fields: {
		name: string
		value: string
		type: number
		linkedId: any
	}[]
	card: {
		cardholderName: string
		brand: string | null
		number: string
		expMonth: string
		expYear: string
		code: string
	}
	collectionIds: any[]
	revisionDate: string
	creationDate: string
	deletedDate: any
}
export type BitwardenPasswordItem = {
	object: string
	id: string
	organizationId: any
	folderId: string
	type: 1
	reprompt: number
	name: string
	notes: string
	favorite: boolean
	login?: {
		uris: {
			match: any
			uri: string
		}[]
		username: string
		password: string
		totp: any
		passwordRevisionDate: any
	}
	collectionIds: any[]
	revisionDate: string
	creationDate: string
	deletedDate: any
}
export type BitwardenItem = BitwardenPasswordItem | BitwardenCardItem

export function isPassword(item: BitwardenItem): item is BitwardenPasswordItem {
	return item.type === 1
}
export function isCard(item: BitwardenItem): item is BitwardenCardItem {
	return item.type === 3
}
