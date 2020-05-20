'use strict';

const fs = {
    promises: {},
    constants: {
        F_OK: ''
    }
}

fs.setMockWriteFile = (mockWriteFile) => fs.promises.writeFile = mockWriteFile
fs.setMockAccess = (mockAccess) => fs.promises.access = mockAccess
fs.setMockReadFile = (mockReadFile) => fs.promises.readFile = mockReadFile

module.exports = fs