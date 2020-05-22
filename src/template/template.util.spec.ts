jest.mock('fs')
jest.spyOn(console, 'log').mockImplementation(() => {})

import TemplateUtil from './template.util'
import fs from 'fs'
import isbinaryfile from 'isbinaryfile'
import path from 'path'

describe('TemplateUtil', () => {

    describe('copyFilesInDirectoryRecursively', () => {

        it('should never copy .git directories', async () => {
            fs.promises.readdir = jest.fn().mockImplementation(async () => {
                const resources: string[] = ['.git']
                return resources
            })
            fs.promises.lstat = jest.fn().mockImplementation(async() => {})
            await TemplateUtil.copyFilesInDirectoryRecursively('fromPath', 'toPath', 'projectName', 'databaseName')
            expect(fs.promises.readdir).toHaveBeenCalled()
            expect(fs.promises.lstat).not.toHaveBeenCalled()
        })

        it('should copy all directories and files', async () => {
            const mockFromPath = 'fromPath'
            const mockToPath = 'toPath'
            const mockProjectName = 'MyFirstProject'
            const mockDatabaseName = 'MyFirstDatabase'
            const mockResourceNamePattern = '_ProjectName_ _DatabaseName_'
            const mockRenamedResource = mockProjectName + ' ' + mockDatabaseName
            fs.promises.readdir = jest.fn().mockImplementation(async() => {
                const resources: string[] = [mockResourceNamePattern, mockResourceNamePattern]
                return resources
            })

            const mockIsDirectoryTrue = jest.fn().mockReturnValue(true)
            const mockIsDirectoryFalse = jest.fn().mockReturnValue(false)
            fs.promises.lstat = jest.fn()
                                .mockImplementationOnce(async () => {
                                    return { isDirectory: mockIsDirectoryTrue }
                                })
                                .mockImplementation(async () => {
                                    return { isDirectory: mockIsDirectoryFalse }
                                })

            const mockMkdir = jest.fn().mockImplementation(async (path) => {
                expect(path).toEqual(`${mockToPath}/${mockRenamedResource}`)
            })
            fs.promises.mkdir = mockMkdir

            const mockIsBinaryFile = jest.fn()
                                        .mockImplementationOnce(async () => false)
                                        .mockImplementation(async () => true)
            isbinaryfile.isBinaryFile = mockIsBinaryFile

            const mockCopyFile = jest.fn().mockImplementation(async (srcPath, destPath) => {
                const name = path.parse(destPath).base
                expect(name).toEqual(mockRenamedResource)
            })
            fs.promises.copyFile = mockCopyFile

            const mockReadFile = jest.fn().mockImplementation(async () => mockResourceNamePattern)
            fs.promises.readFile = mockReadFile

            const mockWriteFile = jest.fn().mockImplementation(async (destPath, content) => {
                const name = path.parse(destPath).base
                expect(name).toEqual(mockRenamedResource)
                expect(content).toEqual(mockRenamedResource)
            })
            fs.promises.writeFile = mockWriteFile

            await TemplateUtil.copyFilesInDirectoryRecursively(mockFromPath, mockToPath, mockProjectName, mockDatabaseName)
            expect(fs.promises.readdir).toBeCalledTimes(2)
            expect(fs.promises.lstat).toBeCalledTimes(4)
            expect(mockIsDirectoryTrue).toBeCalledTimes(1)
            expect(mockIsDirectoryFalse).toBeCalledTimes(3)
            expect(fs.promises.mkdir).toBeCalledTimes(1)
            expect(isbinaryfile.isBinaryFile).toBeCalledTimes(3)
            expect(fs.promises.copyFile).toBeCalledTimes(2)
            expect(fs.promises.readFile).toBeCalledTimes(1)
            expect(fs.promises.writeFile).toBeCalledTimes(1)
        })

    })

})