jest.mock('bitbucket')
jest.mock('fs')
jest.mock('config')

import BitbucketRepository from './bitbucket.repository'
import config from 'config'

describe('BitbucketRepository', () => {

    describe('loginBitbucket', () => {

        let _setMockWriteFile: Function
        let _setMockGetUser: Function

        beforeEach(() => {
            const {setMockWriteFile} = require('fs')
            const {setMockGetUser} = require('bitbucket')

            _setMockWriteFile = setMockWriteFile
            _setMockGetUser = setMockGetUser
        })

        it('should login successfully',   async () => {

            const mockWriteFile = jest.fn<Promise<void>, []>()
            _setMockWriteFile(mockWriteFile)

            const mockGetUser = jest.fn().mockResolvedValue({data: {username: 'test-username', display_name: 'test-display-name'}})
            _setMockGetUser(mockGetUser)

            await BitbucketRepository.loginBitbucket('username', 'password')
            expect(mockWriteFile).toHaveBeenCalled()
            expect(mockGetUser).toHaveBeenCalled()
        })

        it(`should throw error when could not find Bitbucket account`,  () => {

            const mockGetUser = jest.fn().mockResolvedValue(null)
            _setMockGetUser(mockGetUser)

            expect(BitbucketRepository.loginBitbucket('username', 'password')).rejects.toThrow(new Error('Could not find Bitbucket account'))

        })

    })

    describe('getBitbucket', () => {

        let _setMockAccess: Function
        let _setMockReadFile: Function

        beforeEach(() => {
            const {setMockAccess, setMockReadFile} = require('fs')
            _setMockAccess = setMockAccess
            _setMockReadFile = setMockReadFile
        })

        it('should get Bitbucket credentials successfully', async () => {

            const mockAccess = jest.fn<Promise<void>, []>()
            _setMockAccess(mockAccess)

            const mockCredentials = {
                username: 'username',
                password: 'password'
            }
            const mockCredentialsJSON = JSON.stringify(mockCredentials)
            const buffer = Buffer.from(mockCredentialsJSON, 'utf8')
            const mockReadFile = jest.fn().mockResolvedValue(buffer)
            _setMockReadFile(mockReadFile)

            const {bitbucket, credentials} = await BitbucketRepository.getBitbucket()
            expect(bitbucket).not.toBeNull()
            expect(credentials.username).toEqual(mockCredentials.username)
            expect(credentials.password).toEqual(mockCredentials.password)
            expect(mockAccess).toHaveBeenCalled()
            expect(mockReadFile).toHaveBeenCalled()
        })

        it('should throw error when cannot access Bitbucket credentials',  () => {

            const mockAccess = jest.fn().mockRejectedValue(new Error())
            _setMockAccess(mockAccess)

            expect(BitbucketRepository.getBitbucket()).rejects.toThrow(new Error(`Could not access Bitbucket credentials. Please try to login once`))

        })

    })

    describe('listAllTemplates', () => {

        let _bitbucket: any

        beforeEach(() => {
            const {Bitbucket} = require('bitbucket')
            _bitbucket = new Bitbucket()
        })

        it('should return all templates successfully',  async () => {

            const mockRepositories: any[] = [
                {slug: 'Repository 1'},
                {slug: 'ABC!@#$ %^&+'}
            ]
            const mockGetRepositories = jest.fn().mockResolvedValue({data: {values: mockRepositories}})
            _bitbucket.repositories.list = mockGetRepositories

            const mockCredentials = {
                username: 'username',
                password: 'password'
            }

            const workspace = config.get<string>('bitbucket.workspace')

            BitbucketRepository.getBitbucket = jest.fn().mockResolvedValue({bitbucket: _bitbucket, credentials: mockCredentials})
            const results = await BitbucketRepository.listAllTemplates()
            expect(results.length).toEqual(mockRepositories.length)
            for (let i = 0;i < results.length;i++) {
                const result = results[i]
                const mockRepository = mockRepositories[i]

                expect(result.name).toEqual(mockRepository.slug)

                const encodedUsername = encodeURI(mockCredentials.username)
                const encodedPassword = encodeURI(mockCredentials.password)
                const encodedWorkspace = encodeURI(workspace)
                const encodedSlug = encodeURI(mockRepository.slug)
                const gitUrl = `https://${encodedUsername}:${encodedPassword}@bitbucket.org/${encodedWorkspace}/${encodedSlug}.git`
                expect(result.gitUrl).toEqual(gitUrl)
            }
            expect(mockGetRepositories).toHaveBeenCalled()
        })
    });
})