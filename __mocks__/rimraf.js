module.exports = jest.fn()
    .mockImplementationOnce((path, options, cb) => {
        // Call first time will be okay
        cb()
    })
    .mockImplementationOnce((path, options, cb) => {
        // Call second time will be fail
        const error = {}
        cb(error)
    })