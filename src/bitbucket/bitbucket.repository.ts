import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import {Bitbucket} from 'bitbucket'
import { EOL } from 'os'
import BitbucketCredentials from './bitbucket-credentials.interface'
import {Options} from 'bitbucket/lib/bitbucket'
import Repository from './repository.interface'

namespace BitbucketRepository {

    const bitbucketCredentialsFilePath = path.join(__dirname, '../../bitbucket-credentials.json')

    export let loginBitbucket = async (username: string, password: string): Promise<void> => {

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

    export let getBitbucket = async (): Promise<BitbucketCredentials> => {

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

    export let listAllTemplates = async (): Promise<Repository[]> => {

        const workspace = 'arcadiasoftware'
        const projectKey = 'ARCPROJTEMP'
        try {

            const {bitbucket, credentials} = await getBitbucket()
            let url: string | undefined = undefined;
            let allTemplates: Repository[] = [];
            let pageString = "1";

            do {
                // Fetch repositories with pagination
                const { data } = await bitbucket.repositories.list({
                    workspace,
                    q: `project.key="${projectKey}"`,
                    page: pageString
                });

                if (!data.values) throw new Error('Could not find any Arcadia repository from your Bitbucket credentials');

                // Process and collect repositories
                const templates: Repository[] = data.values.map(value => {
                    const encodedUsername = encodeURI(credentials.username);
                    const encodedPassword = encodeURI(credentials.password);
                    const encodedWorkspace = encodeURI(workspace);
                    const encodedSlug = encodeURI(value.slug);

                    return {
                        name: value.slug,
                        gitUrl: `https://${encodedUsername}:${encodedPassword}@bitbucket.org/${encodedWorkspace}/${encodedSlug}.git`,
                    };
                });

                allTemplates = allTemplates.concat(templates);

                // Set the URL for the next page
                url = data.next;
                
                let page = data.page ?? 0;
                let pagelen = data.pagelen ?? 0;
                let size = data.size ?? 0;

                if(page * pagelen < size) {
                    pageString = String(page + 1);
                }
            } while (url);
            
            // Sort the results by name
            allTemplates.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

            return allTemplates;
        } catch (error) {
            throw new Error(`Error while accessing repository information from Bitbucket:${EOL + error}`)
        }
    }
}

export default BitbucketRepository