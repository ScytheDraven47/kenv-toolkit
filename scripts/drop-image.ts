// Name: drop image

import '@johnlindquist/kit'
const Jimp = await npm('jimp')

const files = await drop()

const selectedSize = await micro(
	{
		placeholder: 'Select a size (<width>x<height>):',
		strict: false,
		validate: (choice) => {
			return /^[0-9]*[0-9][0-9]*x[0-9]*[0-9][0-9]*\d*$/i.test(choice)
		},
	},
	['100x100', '250x250', '500x500']
)
const [width, height] = selectedSize.split('x').map(Number)

files.forEach(async (file) => {
	// let file = files[0]
	let imagePath = file.path
	let image = await Jimp.read(imagePath)
	let newPath = appendToFilename(imagePath, `-${width}x${height}`)
	await image.resize(width, height).write(newPath)
})

function appendToFilename(filepath: string, suffix: string) {
	const dir = path.dirname(filepath)
	const ext = path.extname(filepath)
	const filenameParts = path.basename(filepath).split(ext)
	filenameParts.pop()
	const newFilename = `${filenameParts.join('')}${suffix}${ext}`
	return path.resolve(dir, newFilename)
}
