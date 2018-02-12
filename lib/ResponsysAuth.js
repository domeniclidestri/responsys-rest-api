const request = require('request')
const moment = require('moment')
const fs = require('fs')

module.exports = class ResponsysAuth {

    /**
     * Init vars
     *
     * @param {string} username
     * @param {string} password
     * @param {string} authEndPoint
     * @param {int} tokenExpiryHours
     * @param {string} storagePath
     */
    constructor(
        username = process.env.RESPONSYS_API_USERNAME,
        password = process.env.RESPONSYS_API_PASSWORD,
        authEndPoint = process.env.RESPONSYS_API_AUTH_END_POINT,
        tokenExpiryHours = process.env.RESPONSYS_API_AUTH_TOKEN_EXPIRY_HOURS,
        storagePath = process.env.RESPONSYS_API_AUTH_STORAGE_FILE
    ) {
        this.username = username
        this.password = password
        this.authEndPoint = authEndPoint
        this.tokenExpiryHours = tokenExpiryHours
        this.storagePath = storagePath
    }

    /**
     * Authenticate with API
     *
     * @param {function} callback
     */
    authenticate(callback) {
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
     * Authorised API request
     *
     * @param {string} method
     * @param {string} href
     * @param {function} callback
     */
    authorisedRequest(method, href, callback) {
        this.authorise((auth) => {
            request({
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": auth.authToken
                },
                uri: auth.endPoint + href,
                method: method
            }, callback)
        })
    }

    /**
     * Execute callback with authorisation token
     *
     * @param {function} callback
     */
    authorise(callback) {
        if (!this.auth) {
            this.auth = this.readAuthStorage()
        }

        // Authenticate if required and pass the auth object to callback
        if (this.authenticateRequired(this.auth)) {
            this.authenticate((error, response, body) => {
                const auth = JSON.parse(body)
                this.writeAuthStorage(auth)
                callback(auth)
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
}