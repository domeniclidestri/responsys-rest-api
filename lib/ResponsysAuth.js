const request = require('request')
const moment = require('moment')
const fs = require('fs')
const chalk = require('chalk')
const RateLimiter = require('limiter').RateLimiter
const log = console.log

module.exports = class ResponsysAuth {

    /**
     * Init vars
     *
     * @param {string} username
     * @param {string} password
     * @param {string} authEndPoint
     * @param {int} tokenExpiryHours
     * @param {string} storagePath
     * @param {int} throttleNumRequests
     * @param {int} throttleRate
     */
    constructor(
        username = process.env.RESPONSYS_API_USERNAME,
        password = process.env.RESPONSYS_API_PASSWORD,
        authEndPoint = process.env.RESPONSYS_API_AUTH_END_POINT,
        tokenExpiryHours = process.env.RESPONSYS_API_AUTH_TOKEN_EXPIRY_HOURS,
        storagePath = process.env.RESPONSYS_API_AUTH_STORAGE_FILE,
        throttleNumRequests = process.env.RESPONSYS_API_THROTTLE_NUM_REQUESTS,
        throttleRate = process.env.RESPONSYS_API_THROTTLE_RATE,
    ) {
        this.username = username
        this.password = password
        this.authEndPoint = authEndPoint
        this.tokenExpiryHours = tokenExpiryHours
        this.storagePath = storagePath

        // Throttle all requests to avoid api throttle limitations/connection issues
        // e.g. Error: read ECONNRESET
        this.limiter = new RateLimiter(throttleNumRequests, throttleRate)
        // this.throttledRequest = function() {
        //     var requestArgs = arguments
        //     limiter.removeTokens(1, function() {
        //         request.apply(this, requestArgs)
        //     })
        // }
    }

    /**
     * Authenticate with API
     *
     * @param {function} callback
     */
    authenticate(callback) {
        log(chalk.yellow('Authenticating...'))
        const authForm = {
            "auth_type": "password",
            "user_name": this.username,
            "password": this.password
        }

        request({
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            uri: this.authEndPoint,
            form: authForm,
            method: "POST"
        }, callback)
    }

    /**
     * Request to API with authorisation token
     *
     * @param {string} method
     * @param {string} href
     * @param {function} callback
     */
    authorisedRequest(method, href, callback) {
        this.authorise((auth) => {
            // this.throttledRequest({
            this.limiter.removeTokens(1, function(err, remainingRequests) {

                request({
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": auth.authToken
                    },
                    uri: auth.endPoint + href,
                    method: method
                }, (error, response, body) => {
                    if (error) {
                        log(chalk.keyword('red')(method + ' ' + href + ' ' + error))
                    }
                    else {
                        let colour = response && response.statusCode === 200 ? 'green' : 'red'
                        let statusMsg = response.statusCode + ' ' + response.statusMessage
                        log(chalk.keyword(colour)(method + ' ' + href + ' ' + statusMsg))
                    }
                    callback(error, response, body)
                })

            })
        })
    }

    /**
     * Retrieve authorisation token
     * Authenticate first if required
     *
     * @param {function} callback
     */
    authorise(callback) {
        if (!this.auth) {
            this.auth = this.readAuthStorage()
        }

        if (this.authenticateRequired(this.auth)) {
            this.authenticate((error, response, body) => {
                this.auth = JSON.parse(body)
                this.writeAuthStorage(this.auth)
                callback(this.auth)
            })
        }
        else {
            callback(this.auth)
        }
    }

    /**
     * Check for a valid unexpired token
     *
     * @param {object} auth
     *
     * @return boolean True if authentication required otherwise false
     */
    authenticateRequired(auth) {
        var authenticate = true
        if (auth && auth.hasOwnProperty('issuedAt')) {
            authenticate = this.isTokenExpired(auth.issuedAt)
        }
        return authenticate
    }

    /**
     * Diff against now and timestamp of token
     *
     * @param {int} issuedAt
     *
     * @return boolean True if token is expired otherwise false
     */
    isTokenExpired(issuedAt) {
        var diff = moment().diff(issuedAt, 'hours')
        return diff >= this.tokenExpiryHours
    }

    /**
     * Read auth object from file storage if exists
     *
     * @return {object}
     */
    readAuthStorage() {
        if (fs.existsSync(this.storagePath)) {
            var result = fs.readFileSync(this.storagePath, "utf8")
            return JSON.parse(result)
        }
    }

    /**
     * Write auth object to file storage
     *
     * @param {object} auth
     */
    writeAuthStorage(auth) {
        var result = fs.writeFileSync(this.storagePath, JSON.stringify(auth))
        return typeof result === 'undefined'
    }

    /**
     * Remove file
     */
    clearAuthStorage() {
        fs.unlinkSync(this.storagePath)
    }
}