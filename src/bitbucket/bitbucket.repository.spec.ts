jest.mock('bitbucket')
jest.mock('fs')

import BitbucketRepository from './bitbucket.repository'

describe('BitbucketRepository', () => {

    let _setMockWriteFile: Function
    let _setMockAccess: Function
    let _setMockReadFile: Function
    let _setMockGetUser: Function;

    beforeEach(() => {
        const {setMockWriteFile, setMockAccess, setMockReadFile} = require('fs')
        _setMockWriteFile = setMockWriteFile
        _setMockAccess = setMockAccess
        _setMockReadFile = setMockReadFile

        const {setMockGetUser} = require('bitbucket')
        _setMockGetUser = setMockGetUser
    })

    describe('loginBitbucket', () => {

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


    });

})