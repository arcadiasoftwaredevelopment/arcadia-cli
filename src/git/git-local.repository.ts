const git = require('simple-git')
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { EOL } from 'os'
import rimraf from 'rimraf'
import Repository from '../bitbucket/repository.interface'

namespace GitLocalRepository {

    const gitLocalParentDirectoryPath = path.join(__dirname, '../../git-repositories')

    export let removeGitLocalDirectory = (): Promise<void> => {

        return new Promise((resolve, reject) => {

            rimraf(gitLocalParentDirectoryPath, {}, (error) => {
                if (error) {
                    reject(`Error while removing templates:${EOL + error}`)
                    return
                }
                resolve()
            })
        })
    }

    export let cloneOrPullRepository = async (repository: Repository): Promise<string> => {

        try {
            // Check if the parent directory exists
            try {
                await fs.promises.access(gitLocalParentDirectoryPath)
            } catch {
                await fs.promises.mkdir(gitLocalParentDirectoryPath)
            }

            // Child directory
            const gitLocalDirectoryPath = path.join(gitLocalParentDirectoryPath, repository.name)

            try {
                await fs.promises.access(gitLocalDirectoryPath, fs.constants.F_OK)
                // If child directory exists, that means we can pull new version of source code
                await git(gitLocalDirectoryPath).silent(true).pull(repository.gitUrl, 'master')
                console.log(chalk.green(`Pulled '${repository.name}' repository at ${gitLocalDirectoryPath}`))
            } catch {
                // If child directory never exists, then we will clone a new one
                await git().silent(true).clone(repository.gitUrl, gitLocalDirectoryPath)
                console.log(chalk.green(`Cloned '${repository.name}' repository to ${gitLocalDirectoryPath}`))
            }

            return gitLocalDirectoryPath
        } catch (error) {
            throw new Error(`Error while cloning or pulling:${EOL + error}`)
        }
    }
}

export default GitLocalRepository