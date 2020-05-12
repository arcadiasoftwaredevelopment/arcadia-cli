const git = require('simple-git')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const { EOL } = require('os')
const rimraf = require("rimraf")

const gitLocalParentDirectoryPath = path.join(__dirname, '../git-repositories')

const removeGitLocalDirectory = () => {

    return new Promise((resolve, reject) => {

        rimraf(gitLocalParentDirectoryPath, {}, (error) => {
            if (error) return reject(`Error while removing templates:${EOL + error}`)
            resolve()
        })
    })
}

const cloneOrPullRepository = ({name, gitUrl}) => {

    return new Promise(async (resolve, reject) => {

        try {
            // Check if the parent directory exists
            try {
                await fs.promises.access(gitLocalParentDirectoryPath)
            }
            catch {
                await fs.promises.mkdir(gitLocalParentDirectoryPath)
            }

            // Child directory
            const gitLocalDirectoryPath = path.join(gitLocalParentDirectoryPath, name)

            try {
                await fs.promises.access(gitLocalDirectoryPath, fs.constants.F_OK)
                // If child directory exists, that means we can pull new version of source code
                await git(gitLocalDirectoryPath).silent(true).pull(gitUrl, 'master')
                console.log(chalk.green(`Pulled '${name}' repository at ${gitLocalDirectoryPath}`))
            }
            catch {
                // If child directory never exists, then we will clone a new one
                await git().silent(true).clone(gitUrl, gitLocalDirectoryPath)
                console.log(chalk.green(`Cloned '${name}' repository to ${gitLocalDirectoryPath}`))
            }

            return resolve(gitLocalDirectoryPath)
        }
        catch (error) {
            return reject(`Error while cloning or pulling:${EOL + error}`)
        }
    })
}

module.exports = {
    cloneOrPullRepository,
    removeGitLocalDirectory
}