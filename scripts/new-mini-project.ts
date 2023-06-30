// Name: Create New Mini Project

import '@johnlindquist/kit'

const projectName = await arg({
	placeholder: 'Project Name?',
	onInput: (input) => {
		setHint(formatProjectDirName(input))
	},
})

const finalPath = home(
	'OneDrive',
	'Synced_Code',
	'Projects',
	formatProjectDirName(projectName)
)
const indexPath = `${finalPath}/index.html`
const stylePath = `${finalPath}/style.css`
const scriptPath = `${finalPath}/script.js`

if (pathExists(finalPath)) {
	const doContinue = await arg('Project already exists', [
		{
			name: 'Open',
			value: true,
		},
		{
			name: 'Pick a new name',
			value: false,
			onSubmit: async () => {
				await run('new-mini-project')
				return ''
			},
		},
		{
			name: 'Cancel',
			value: false,
		},
	])
	if (!doContinue) {
		process.exit()
	}
}

await ensureDir(finalPath)
await ensureFile(indexPath)
await ensureFile(stylePath)
await ensureFile(scriptPath)

await exec(
	`code -n "${finalPath}" "${indexPath}" "${stylePath}" "${scriptPath}"`
)

function formatProjectDirName(projectName: string): string {
	return projectName.toLowerCase().replaceAll(' ', '-')
}
