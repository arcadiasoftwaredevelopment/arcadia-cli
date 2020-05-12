const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { Bitbucket } = require('bitbucket')
const { EOL } = require('os')

const workspace = 'arcadiasoftware'
const projectKey = 'ARCPROJTEMP'
const bitbucketCredentialsFilePath = path.join(__dirname, '../bitbucket-credentials.json')

const loginBitbucket = (username, password) => {

    return new Promise(async (resolve, reject) => {

        try {
            const clientOptions = {
                auth : {
                    username,
                    password
                },
                notice: false
            }

            const bitbucket = new Bitbucket(clientOptions)
            const { data:userData } = await bitbucket.user.get({ fields: ['username', 'display_name'] })

            if (!userData || !userData.username) {
                return reject('Could not find Bitbucket account')
            }

            // Store Bitbucket credentials to be used in the next time
            const bitbucketCredentialsJson = JSON.stringify(clientOptions.auth)
            await fs.promises.writeFile(bitbucketCredentialsFilePath, bitbucketCredentialsJson)

            console.log(chalk.green(`Hi ${userData.display_name}, you login Bitbucket successfully`))

            return resolve()
        }
        catch (error) {
            return reject(`Error while logging in Bitbucket:${EOL + error}`)
        }
    })
}

const getBitbucket = () => {

    return new Promise(async (resolve, reject) => {

        try {
            await fs.promises.access(bitbucketCredentialsFilePath, fs.constants.F_OK)
        }
        catch (error) {
            return reject(`Could not access Bitbucket credentials. Please try to login once`)
        }

        try {
            const buffer = await fs.promises.readFile(bitbucketCredentialsFilePath)
            const bitbucketCredentialsJson = buffer.toString()
            const auth = JSON.parse(bitbucketCredentialsJson)

            const clientOptions = {
                auth,
                notice: false
            }
            const bitbucket = new Bitbucket(clientOptions)
            return resolve({bitbucket, auth})
        }
        catch (error) {
            return reject(`Error while accessing Bitbucket:${EOL + error}`)
        }
    })
}

const listAllTemplates = () => {

    return new Promise(async (resolve, reject) => {

        try {
            const {bitbucket, auth} = await getBitbucket()
            const {data} = await bitbucket.repositories.list({
                workspace,
                q: `project.key="${projectKey}"`
            })

            const templates = []
            for (let i = 0; i < data.values.length; i++) {
                const value = data.values[i]

                const encodedUsername = encodeURI(auth.username)
                const encodedPassword = encodeURI(auth.password)
                const encodedWorkspace = encodeURI(workspace)
                const encodedSlug = encodeURI(value.slug)
                templates.push({
                    name: value.slug,
                    gitUrl: `https://${encodedUsername}:${encodedPassword}@bitbucket.org/${encodedWorkspace}/${encodedSlug}.git`
                })
            }

            return resolve(templates)
        }
        catch (error) {
            return reject(`Error while accessing repository information from Bitbucket:${EOL + error}`)
        }
    })
}

module.exports = {
    loginBitbucket,
    listAllTemplates
}