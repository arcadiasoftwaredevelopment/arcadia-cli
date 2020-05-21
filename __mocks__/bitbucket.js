'use strict';

let _mockGetUser = null
let _mockGetRepositories = null

const setMockGetUser = (mockGetUser) => {
    _mockGetUser = mockGetUser
}

const Bitbucket = jest.fn().mockImplementation(() => {
    return {
        user: {
            get: _mockGetUser
        },
        repositories: {
            list: _mockGetRepositories
        }
    }
})

module.exports = {
    Bitbucket,
    setMockGetUser
}