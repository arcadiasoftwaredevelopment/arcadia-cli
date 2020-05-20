import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import {Bitbucket} from 'bitbucket'
import { EOL } from 'os'
import BitbucketCredentials from './bitbucket-credentials.interface'
import {Options} from 'bitbucket/lib/bitbucket'
import Repository from './repository.interface'

namespace BitbucketRepository {

    const workspace = 'arcadiasoftware'
    const projectKey = 'ARCPROJTEMP'
    const bitbucketCredentialsFilePath = path.join(__dirname, '../../bitbucket-credentials.json')

    export const loginBitbucket = async (username: string, password: string): Promise<void> => {

        try {
            const clientOptions = {
                auth: {
                    username,
                    password
                },
                notice: false
            }

            const bitbucket = new Bitbucket(clientOptions)
            const response = await bitbucket.user.get({fields: 'username,display_name'})

            if (!response || !response.data || !response.data.username) {
                throw new Error('Could not find Bitbucket account')
            }

            // Store Bitbucket credentials to be used in the next time
            const bitbucketCredentialsJson = JSON.stringify(clientOptions.auth)
            await fs.promises.writeFile(bitbucketCredentialsFilePath, bitbucketCredentialsJson)

            console.log(chalk.green(`Hi ${response.data.display_name}, you login Bitbucket successfully`))

        } catch (error) {
            throw new Error(`Error while logging in Bitbucket:${EOL + error}`)
        }
    }

    export const getBitbucket = async (): Promise<BitbucketCredentials> => {

        try {
            await fs.promises.access(bitbucketCredentialsFilePath, fs.constants.F_OK)
        } catch (error) {
            throw new Error(`Could not access Bitbucket credentials. Please try to login once`)
        }

        try {
            const buffer = await fs.promises.readFile(bitbucketCredentialsFilePath)
            const bitbucketCredentialsJson = buffer.toString()
            const credentials = JSON.parse(bitbucketCredentialsJson)

            const clientOptions: Options = {
                auth: credentials,
                notice: false
            }
            const bitbucket = new Bitbucket(clientOptions)
            return {bitbucket, credentials}
        } catch (error) {
            throw new Error(`Error while accessing Bitbucket:${EOL + error}`)
        }
    }

    export const listAllTemplates = async (): Promise<Repository[]> => {

        try {
            const {bitbucket, credentials} = await getBitbucket()
            const {data} = await bitbucket.repositories.list({
                workspace,
                q: `project.key="${projectKey}"`
            })

            if (!data.values) throw new Error('Could not find any Arcadia repository from your Bitbucket credentials')

            const templates: Repository[] = []
            for (let i = 0; i < data.values.length; i++) {
                const value = data.values[i]

                const encodedUsername = encodeURI(credentials.username)
                const encodedPassword = encodeURI(credentials.password)
                const encodedWorkspace = encodeURI(workspace)
                const encodedSlug = encodeURI(value.slug)
                templates.push({
                    name: value.slug,
                    gitUrl: `https://${encodedUsername}:${encodedPassword}@bitbucket.org/${encodedWorkspace}/${encodedSlug}.git`
                })
            }

            return templates
        } catch (error) {
            throw new Error(`Error while accessing repository information from Bitbucket:${EOL + error}`)
        }
    }
}

export default BitbucketRepository