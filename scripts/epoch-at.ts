// Name: Epoch At

import '@johnlindquist/kit'

const now = getDateString()
const time = await arg({
	placeholder: 'Input time:',
	hint: now,
	defaultValue: now,
	validate: (choice) => {
		try {
			new Date(choice)
			return true
		} catch (_) {
			return false
		}
	},
})

await copy(new Date(time).valueOf().toString().slice(0, -3))

function getDateString() {
	const now = new Date()
	const [y, m, d, h, i, s] = [
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		now.getHours(),
		now.getMinutes(),
		now.getSeconds(),
	].map(padZero)
	return `${y}-${m}-${d} ${h}:${i}:${s}`
}

function padZero(number: string | number) {
	return number.toString().padStart(2, '0')
}
