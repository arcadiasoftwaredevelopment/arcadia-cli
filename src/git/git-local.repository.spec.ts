jest.mock('rimraf')

import GitLocalRepository from './git-local.repository'
import rimraf from 'rimraf'

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

    describe('cloneOrPullRepository', () => {})

})