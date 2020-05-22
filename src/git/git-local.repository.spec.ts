import Repository from '../bitbucket/repository.interface'

jest.mock('rimraf')
jest.mock('simple-git')
jest.mock('fs')
jest.spyOn(console, 'log').mockImplementation(() => {})

import GitLocalRepository from './git-local.repository'
import rimraf from 'rimraf'
const git = require('simple-git')
import fs from 'fs'

describe('GitLocalRepository', () => {

    describe('removeGitLocalDirectory', () => {

        it('should remove local repositories successfully',  async () => {

            await GitLocalRepository.removeGitLocalDirectory()
            expect(rimraf).toHaveBeenCalled()
        })

        it('should throw error if remove local repositories fail',  async () => {

            try {
                await GitLocalRepository.removeGitLocalDirectory()
                fail('The above function is expected to throw error')
            }
            catch (e) {
                expect(e).not.toBeNull()
            }
            expect(rimraf).toHaveBeenCalled()
        })
    })

    describe('cloneOrPullRepository', () => {

        it(`should create git-repositories directory if it doesn't exist`, async () => {
            const mockAccess = jest.fn().mockRejectedValue(new Error('Error from access'))
            fs.promises.access = mockAccess

            const mockMkdir = jest.fn().mockRejectedValue(new Error('Error from mkdir'))
            fs.promises.mkdir = mockMkdir

            try {
                const mockRepository: Repository = {
                    name: 'name',
                    gitUrl: 'git-url'
                }
                await GitLocalRepository.cloneOrPullRepository(mockRepository)
                fail('Expected method to throw error')
            }
            catch (e) {
            }

            expect(mockAccess).toHaveBeenCalled()
            expect(mockMkdir).toHaveBeenCalled()

        })

        it(`should clone repository when it doesn't exist`,  async () => {
            const mockAccess = jest.fn<Promise<void>, []>()
                                .mockImplementationOnce(async () => {})
                                .mockImplementationOnce(async () => { throw new Error('Error from access') })
            fs.promises.access = mockAccess

            const mockClone = jest.fn<Promise<void>, []>()
            const mockSilent = jest.fn().mockImplementation(() => ({clone: mockClone}))
            git().silent = mockSilent

            const mockRepository: Repository = {
                name: 'name',
                gitUrl: 'git-url'
            }
            const path = await GitLocalRepository.cloneOrPullRepository(mockRepository)
            expect(path).not.toBeNull()
            expect(mockAccess).toBeCalledTimes(2)
            expect(mockSilent).toHaveBeenCalled()
            expect(mockClone).toHaveBeenCalled()
        })

        it('should pull repository when it already exists',  async () => {
            const mockAccess = jest.fn<Promise<void>, []>()
                .mockImplementationOnce(async () => {})
                .mockImplementationOnce(async () => {})
            fs.promises.access = mockAccess

            const mockPull = jest.fn<Promise<void>, []>()
            const mockSilent = jest.fn().mockImplementation(() => ({pull: mockPull}))
            git().silent = mockSilent

            const mockRepository: Repository = {
                name: 'name',
                gitUrl: 'git-url'
            }
            const path = await GitLocalRepository.cloneOrPullRepository(mockRepository)
            expect(path).not.toBeNull()
            expect(mockAccess).toBeCalledTimes(2)
            expect(mockSilent).toHaveBeenCalled()
            expect(mockPull).toHaveBeenCalled()
        })

    })

})