import chalk from 'chalk'
import {isBinaryFile} from 'isbinaryfile'
import fs from 'fs'
import path from 'path'
import { EOL } from 'os'
import validator from 'validator'

namespace TemplateUtil {

    const TemplateSymbol_ProductName = /_ProjectName_/g
    const TemplateSymbol_DatabaseName = /_DatabaseName_/g

    export const copyFilesInDirectoryRecursively = async(fromDirectoryPath: string,
                                                        toDirectoryPath: string,
                                                        projectName: string,
                                                        databaseName: string): Promise<void> => {

        try {

            const resourceNames = await fs.promises.readdir(fromDirectoryPath)
            const promises = []
            for (let i = 0; i < resourceNames.length; i++) {

                const resourceName = resourceNames[i]

                if (resourceName.startsWith('.git')) continue

                let renamedResourceName = resourceName
                if (!validator.isEmpty(projectName)) {
                    renamedResourceName = renamedResourceName.replace(TemplateSymbol_ProductName, projectName)
                }
                if (!validator.isEmpty(databaseName)) {
                    renamedResourceName = renamedResourceName.replace(TemplateSymbol_DatabaseName, databaseName)
                }

                const resourcePath = path.join(fromDirectoryPath, resourceName)
                const promise = fs.promises.lstat(resourcePath).then(async (resourceInfo) => {

                    if (resourceInfo.isDirectory()) {
                        // Directory
                        const srcDirectoryPath = resourcePath
                        const destDirectoryPath = path.join(toDirectoryPath, renamedResourceName)
                        await fs.promises.mkdir(destDirectoryPath)
                        await copyFilesInDirectoryRecursively(srcDirectoryPath, destDirectoryPath, projectName, databaseName)
                    } else {
                        // File
                        const srcFilePath = resourcePath
                        const destFilePath = path.join(toDirectoryPath, renamedResourceName)

                        const thisFileIsBinary = await isBinaryFile(srcFilePath)
                        if (thisFileIsBinary) {
                            await fs.promises.copyFile(srcFilePath, destFilePath)
                            console.log(chalk.green('Created ' + destFilePath))
                        } else {
                            const data = await fs.promises.readFile(srcFilePath)
                            const fileContent = data.toString()
                            let updatedFileContent = fileContent

                            if (!validator.isEmpty(projectName)) {
                                updatedFileContent = updatedFileContent.replace(TemplateSymbol_ProductName, projectName)
                            }

                            if (!validator.isEmpty(databaseName)) {
                                updatedFileContent = updatedFileContent.replace(TemplateSymbol_DatabaseName, databaseName)
                            }

                            await fs.promises.writeFile(destFilePath, updatedFileContent)
                            console.log(chalk.green('Created ' + destFilePath))
                        }
                    }
                })
                promises.push(promise)
            }

            await Promise.all(promises)

        } catch (error) {
            throw new Error(`Error during copy template files:${EOL + error}`)
        }

    }
}

export default TemplateUtil