import inquirer from 'inquirer'
import { mainMenu } from './mainMenu'
import { CDNNames } from '../types'
import { downloadModsFromList } from '../services/downloadMods/downloadModsFromList'

export const downloadModsMenu = async (): Promise<void> => {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'downloadOption',
      message: 'Please select downloading host:',
      choices: Object.values(CDNNames),
    },
  ])

  await downloadModsFromList(answer.downloadOption)

  await mainMenu()
}
