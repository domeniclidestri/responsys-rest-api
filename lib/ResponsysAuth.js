const request = require('request')

module.exports = class ResponsysAuth {

    /**
     * Init vars
     *
     * @param {string} username
     * @param {string} password
     * @param {string} authEndPoint
     */
    constructor(
        username = process.env.RESPONSYS_API_USERNAME,
        password = process.env.RESPONSYS_API_PASSWORD,
        authEndPoint = process.env.RESPONSYS_API_AUTH_END_POINT
    ) {
        this.username = username
        this.password = password
        this.authEndPoint = authEndPoint
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
}