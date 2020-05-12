#!/usr/bin/env node

require('dotenv').config()
const yargs = require('yargs')
const readlineSync = require('readline-sync')
const chalk = require('chalk')

const bitbucketRepository = require('./repositories/bitbucketRepository')
const gitLocalRepository = require('./repositories/gitLocalRepository')
const templateUtil = require('./utils/templateUtil')

yargs.scriptName('create-arcadia-project')
yargs.version('0.1.0')
yargs.demandCommand(1, 'You need at least one command before moving on')

yargs.command('login', 'Login to Bitbucket repository',
    yargs => {
        yargs.version(false)
    },
    async () => {

        try {
            // The command line will try to find Bitbucket's username and password from Environment configuration first
            // If the configuration is not found, the system will prompt user to input username and password
            const username = process.env.BITBUCKET_USERNAME || readlineSync.question('Username: ')
            const password = process.env.BITBUCKET_PASSWORD || readlineSync.question('Password: ', {hideEchoBack: true})

            await bitbucketRepository.loginBitbucket(username, password)
        }
        catch (error) {
            console.log(chalk.red(error))
        }
    })

yargs.command('new', 'Create a new project',
    yargs => {
        yargs.version(false)
        yargs.options({
            t: {
                describe: 'Repository name of a template',
                alias: 'template',
                type: 'string',
                demandOption: true
            },
            p: {
                describe: 'Name of a project you want to create',
                alias: 'project',
                type: 'string',
                default: 'Project'
            },
            d: {
                describe: 'Name of a database you want to use',
                alias: 'database',
                type: 'string',
                default: 'Database'
            }
        })
    },
    async (argv) => {

        const templates = await bitbucketRepository.listAllTemplates()
        const selectedTemplate = templates.find(template => template.name === argv.template)

        if (!selectedTemplate) {
            return console.log(chalk.red('Template not found'))
        }

        const gitLocalDirectoryPath = await gitLocalRepository.cloneOrPullRepository(selectedTemplate)
        await templateUtil.copyFilesInDirectoryRecursively(gitLocalDirectoryPath, process.cwd(), argv.project, argv.database)
        console.log(chalk.green(`Completely created project '${argv.project}' with template '${argv.template}'`))
    })

yargs.command('template', 'Manipulate on template',
    yargs => {
        yargs.version(false)
        yargs.options({
            l: {
                describe: 'List all templates',
                alias: 'list'
            },
            c: {
                describe: 'Clean templates',
                alias: 'clean'
            }
        })
    },
    async (argv) => {

        try {
            if (argv.list) {
                const templates = await bitbucketRepository.listAllTemplates()
                templates.sort((a, b) => {
                    return a.name.localeCompare(b.name)
                })
                for (let i = 0;i < templates.length;i++) {
                    const template = templates[i]
                    const message = `${i+1}. ${template.name}`
                    if (i%2 === 0)
                        console.log(chalk.inverse.gray.bgWhite(message))
                    else
                        console.log(message)
                }
            } else if (argv.clean) {
                await gitLocalRepository.removeGitLocalDirectory()
            }
            else {
                yargs.showHelp()
            }
        }
        catch (error) {
            console.log(chalk.red(error))
        }
    })

yargs.parse()