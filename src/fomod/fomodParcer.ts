import path from 'path'
import { readFileSync } from 'fs'
import { parseStringPromise } from 'xml2js'
import inquirer from 'inquirer'

const pathToXML = path.join(
  './from/CBBE 3BA (3BBB)-30174-2-47-1676473395/fomod',
)
const moduleConfigPath = path.join(pathToXML, '/ModuleConfig.xml')
const metadataPath = path.join(pathToXML, '/Info.xml')

const parseFomodXml = async (filePath: string) =>
  await parseStringPromise(readFileSync(filePath, 'utf16le'))

type InstallOption = {
  name: string
  description: string
  filePaths: string[]
}

const getInstallOptions = (parsedFomod: any): InstallOption[] => {
  const options: InstallOption[] = []
  const installSteps = parsedFomod?.config?.installSteps?.[0]?.installStep

  if (!installSteps || installSteps.length === 0) {
    console.error('No install steps found in FOMOD XML.')
    return options
  }

  const groups = installSteps[0]?.optionalFileGroups?.[0]?.group

  if (!groups || groups.length === 0) {
    console.error('No optional file groups found in FOMOD XML.')
    return options
  }

  groups.forEach((group: any) => {
    const groupName = group?.$?.name || 'Unnamed Group'
    const plugins = group.plugins?.[0]?.plugin

    if (!plugins || plugins.length === 0) {
      console.error(`No plugins found in group ${groupName}.`)
      return
    }

    plugins.forEach((plugin: any) => {
      //console.log(JSON.stringify(plugin, null, 1))
      const name = plugin?.$?.name || 'Unnamed Plugin'
      const description = plugin?.description?.[0] || 'No description available'
      // Extract file paths from the "folder" elements within "files"
      const filePaths =
        plugin?.files?.[0]?.folder?.map((folder: any) => folder?.$?.source) ||
        []

      if (filePaths.length > 0) {
        options.push({ name, description, filePaths })
      } else {
        console.error(
          `No files found for plugin ${name} in group ${groupName}.`,
        )
      }
    })
  })

  return options
}

async function promptUser(installOptions: InstallOption[]) {
  const choices = installOptions.map((option) => ({
    name: `${option.name} - ${option.description}`,
    value: option,
  }))

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedOptions',
      message: 'Choose the options you want to install:',
      choices: choices,
    },
  ])

  return answers.selectedOptions
}

// Example usage
export const runFomodInstaller = async () => {
  const parsedFomod = await parseFomodXml(moduleConfigPath)
  const installOptions = getInstallOptions(parsedFomod)
  console.log(JSON.stringify(installOptions, null, 1))
  //const selectedOptions = await promptUser(installOptions)
  //console.log('You selected:', selectedOptions)
  // Process selected options...
}
