const gitResult = {}

const git = jest.fn().mockImplementation(() => {
    return gitResult
})

module.exports = git