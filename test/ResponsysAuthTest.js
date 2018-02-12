const assert = require('assert')
const moment = require('moment')
const ResponsysAuth = require('../lib/ResponsysAuth')

describe('ResponsysAuth', function () {
    const ra = new ResponsysAuth

    let auth = {
        "authToken": "E3J8Kn2ybyjICQdrDiYDg3a4cjCPEhPjNUuXpzU4ZJp1F59izdk",
        "issuedAt": moment(),
        "endPoint": "localhost"
    }

    describe('#writeAuthStorage', function () {
        it('should write to storage file', function () {
            assert(ra.writeAuthStorage(auth))
        })
    })

    describe('#readAuthStorage', function () {
        it('should read preserved data from storage file', function () {
            assert(JSON.stringify(ra.readAuthStorage()) === JSON.stringify(auth))
        })
    })

    describe('#isTokenExpired', function () {
        it('should return false when token IS NOT expired', function () {
            assert(!ra.isTokenExpired(moment()))
        })
        it('should return true when token IS expired', function () {
            assert(ra.isTokenExpired(moment().subtract(ra.tokenExpiryHours, 'hours')))
        })
    })

    describe('#authenticateRequired', function () {
        it('should return true with no auth object', function () {
            assert(ra.authenticateRequired(null))
        })
        it('should return false when token IS NOT expired', function () {
            assert(!ra.authenticateRequired(auth))
        })
        it('should return true when token IS expired', function () {
            auth.issuedAt = moment().subtract(ra.tokenExpiryHours, 'hours')
            assert(ra.authenticateRequired(auth))
        })
    })

    describe('#authenticate', function () {
        it('should authenticate without error, 200 success status code and provide an object with authToken, issuedAt and endPoint', function (done) {
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