import inquirer from 'inquirer'
import { downloadModsMenu } from './downloadModsMenu'
import { getFilenameWithoutExtension } from '../util'
import { unzipFile } from '../services/unzip/unzipSingleArchive'
import {
  executeFileManipulation,
  FileActionsList,
} from '../services/deployment/fileManipulator'
import { unzipArchivesList } from '../services/unzip/unzipArchivesList'
import { installFomodMods } from '../fomod/installFomodMods'

enum MainOptionsList {
  Download = '1. Download Mods',
  Unzip = '2. Unzip Mods from Folder',
  FOMOD = '3. Do FOMOD Installation',
  Deploy = '4. Deploy',
  Exit = '5. Exit',
}

export const mainMenu = async (): Promise<void> => {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'mainOption',
      message:
        'Welcome to Fallout 4 Immersive Wasteland installator! Please choose an option:',
      choices: Object.values(MainOptionsList),
    },
  ])

  const mainActivitiesList = {
    [MainOptionsList.Download]: downloadModsMenu,
    [MainOptionsList.Unzip]: unzip,
    [MainOptionsList.FOMOD]: doFomodInstallation,
    [MainOptionsList.Deploy]: deploy,
    [MainOptionsList.Exit]: exit,
  }

  await mainActivitiesList[answer.mainOption]()
}

const unzip = async () => {
  await unzipArchivesList('./downloaded', './unzipped')
  mainMenu()
}

const doFomodInstallation = async () => {
  console.log('Doing FOMOD installation...')
  await installFomodMods()
  mainMenu()
  //runFomodInstaller()
  // Add your FOMOD installation logic here
}

const deploy = async (): Promise<void> => {
  console.log('Deploying mods...')
  await executeFileManipulation(
    FileActionsList.copySequentially,
    './from',
    './to',
  )
}
const exit = (): void => {
  console.log('Goodbye!')
  process.exit(0)
}
