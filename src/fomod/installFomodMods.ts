import path from 'path'
import { findFomodFolders } from '../util'
import { getInstallOptions, parseFomodXml, promptUser } from './fomodParcer'
import { error } from 'console'

export const installFomodMods = async () => {
  const folders = await findFomodFolders('./unzipped')
  for (const folderPath of folders) {
    const moduleConfigPath = path.join(folderPath, '/ModuleConfig.xml')
    console.log(moduleConfigPath)
    try {
      const parsedFomod = await parseFomodXml(moduleConfigPath)
      const installOptions = getInstallOptions(parsedFomod)
      //console.log(JSON.stringify(installOptions, null, 1))
      const selectedOptions = await promptUser(installOptions)
    } catch (e) {
      console.error(e)
    }
  }
}
