const assert = require('assert')
const ResponsysAuth = require('../lib/ResponsysAuth')

describe('ResponsysAuth', function () {
    describe('#authenticate', function () {
        it('should authenticate without error, 200 success status code and provide an object with authToken, issuedAt and endPoint', function (done) {
            const ra = new ResponsysAuth
            ra.authenticate(function (error, response, body) {
                assert(!error)
                assert(response && response.statusCode === 200)
                const auth = JSON.parse(body)
                assert(auth.authToken)
                assert(auth.issuedAt)
                assert(auth.endPoint)
                done()
            })
        })
    })
});