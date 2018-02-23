const assert = require('assert')

describe('Environment', function () {
    describe('#variables', function () {
        it('should have environment variable RESPONSYS_API_USERNAME set', function () {
            assert(process.env.RESPONSYS_API_USERNAME)
        })
        it('should have environment variable RESPONSYS_API_PASSWORD set', function () {
            assert(process.env.RESPONSYS_API_PASSWORD)
        })
        it('should have environment variable RESPONSYS_API_AUTH_END_POINT set', function () {
            assert(process.env.RESPONSYS_API_AUTH_END_POINT)
        })
        it('should have environment variable RESPONSYS_API_AUTH_TOKEN_EXPIRY_HOURS set', function () {
            assert(process.env.RESPONSYS_API_AUTH_TOKEN_EXPIRY_HOURS)
        })
        it('should have environment variable RESPONSYS_API_AUTH_STORAGE_FILE set', function () {
            assert(process.env.RESPONSYS_API_AUTH_STORAGE_FILE)
        })
        it('should have environment variable RESPONSYS_API_THROTTLE_NUM_REQUESTS set', function () {
            assert(process.env.RESPONSYS_API_THROTTLE_NUM_REQUESTS)
        })
        it('should have environment variable RESPONSYS_API_THROTTLE_RATE set', function () {
            assert(process.env.RESPONSYS_API_THROTTLE_RATE)
        })
        it('should have environment variable RESPONSYS_API_CONTENT_LIBRARY_FILE_DIR set', function () {
            assert(process.env.RESPONSYS_API_CONTENT_LIBRARY_FILE_DIR)
        })
        it('should have environment variable RESPONSYS_API_CONTENT_LIBRARY_FILE_DIR set', function () {
            assert(process.env.RESPONSYS_API_CONTENT_LIBRARY_FILE_DIR)
        })
    })
})