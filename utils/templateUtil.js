const chalk = require('chalk')
const isBinaryFile = require("isbinaryfile").isBinaryFile;
const fs = require('fs')
const path = require('path')
const { EOL } = require('os')

const TemplateSymbol_ProductName = /_ProjectName_/g
const TemplateSymbol_DatabaseName = /_DatabaseName_/g

const copyFilesInDirectoryRecursively = (fromDirectoryPath, toDirectoryPath, projectName, databaseName) => {

    return new Promise(async (resolve, reject) => {

        try {

            const resourceNames = await fs.promises.readdir(fromDirectoryPath)
            const promises = []
            for (let i = 0;i < resourceNames.length;i++) {

                const resourceName = resourceNames[i]

                if (resourceName.startsWith('.git')) continue

                const renamedResourceName = resourceName
                    .replace(TemplateSymbol_ProductName, projectName)
                    .replace(TemplateSymbol_DatabaseName, databaseName)

                const resourcePath = path.join(fromDirectoryPath, resourceName)
                const promise = fs.promises.lstat(resourcePath).then(async (resourceInfo) => {

                    if (resourceInfo.isDirectory()) {
                        // Directory
                        const srcDirectoryPath = resourcePath
                        const destDirectoryPath = path.join(toDirectoryPath, renamedResourceName)
                        await fs.promises.mkdir(destDirectoryPath)
                        await copyFilesInDirectoryRecursively(srcDirectoryPath, destDirectoryPath, projectName, databaseName)
                    }
                    else {
                        // File
                        const srcFilePath = resourcePath
                        const destFilePath = path.join(toDirectoryPath, renamedResourceName)

                        const thisFileIsBinary = await isBinaryFile(srcFilePath)
                        if (thisFileIsBinary) {
                            await fs.promises.copyFile(srcFilePath, destFilePath)
                            console.log(chalk.green('Created ' + destFilePath))
                        }
                        else {
                            const data = await fs.promises.readFile(srcFilePath)
                            const fileContent = data.toString()
                            const updatedFileContent = fileContent
                                .replace(TemplateSymbol_ProductName, projectName)
                                .replace(TemplateSymbol_DatabaseName, databaseName)

                            await fs.promises.writeFile(destFilePath, updatedFileContent)
                            console.log(chalk.green('Created ' + destFilePath))
                        }
                    }
                })
                promises.push(promise)
            }

            await Promise.all(promises)
            return resolve()
        }
        catch (error) {
            return reject(`Error during copy template files:${EOL + error}`)
        }
    })

}

module.exports = {
    copyFilesInDirectoryRecursively
}