import { CDNAddress, CDNNames } from './types'
import inquirer from 'inquirer'

export const findURIUsingAddress = (addresses: CDNAddress[], city: CDNNames) =>
  addresses.find((address: CDNAddress) => address.short_name === city)

export const manualSelectUI = async () =>
  await inquirer.prompt([
    {
      type: 'list',
      name: 'short_name',
      message: 'Please select downloading host:',
      choices: Object.values(CDNNames),
    },
  ])
