'use strict';

let _mockGetUser

const setMockGetUser = (mockGetUser) => {
    _mockGetUser = mockGetUser
}

const Bitbucket = jest.fn().mockImplementation(() => {
    return {
        user: {
            get: _mockGetUser
        }
    }
})

module.exports = {
    setMockGetUser,
    Bitbucket
}