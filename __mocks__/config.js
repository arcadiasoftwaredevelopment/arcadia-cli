const get = jest.fn().mockImplementation((key) => {
    return key
})

module.exports = {
    get
}