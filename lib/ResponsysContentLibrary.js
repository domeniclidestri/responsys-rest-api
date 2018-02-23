const fs = require('fs')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const path = require('path')
const chalk = require('chalk')
const log = console.log
const ResponsysAuth = require('./ResponsysAuth')

module.exports = class ResponsysContentLibrary {

    /**
     * Init vars
     *
     * @param {ResponsysAuth} responsysAuth
     * @param {string} contentLibraryHref
     * @param {string} fileDir
     */
    constructor(
        responsysAuth = new ResponsysAuth,
        contentLibraryHref = process.env.RESPONSYS_API_CONTENT_LIBRARY_HREF,
        fileDir = process.env.RESPONSYS_API_CONTENT_LIBRARY_FILE_DIR
    ) {
        this.responsysAuth = responsysAuth
        this.contentLibraryHref = contentLibraryHref
        this.fileDir = fileDir
    }

    /**
     * Download all content library starting from root
     *
     * @param {function} resolve Resolve callback for fulfilled promise
     */
    fetchAll(resolve) {
        this.numOfRequestsRemaining = 0
        this.numOfWritesRemaining = 0
        this.resolve = resolve
        this.traverse(this.contentLibraryHref)
    }

    /**
     * Write content to file
     *
     * @param {string} filePath The path to write to
     * @param {string} content The content to be written
     */
    writeFile(filePath, content) {
        this.numOfWritesRemaining++
        var filename = this.fileDir + filePath

        // Create directory first if doesn't exist
        mkdirp(path.dirname(filename), (error) => {
            if (error) {
                log(chalk.keyword('red')(error))
            }
            var result = fs.writeFile(filename, content, (error) => {
                if (error) {
                    log(chalk.keyword('red')(error))
                }
                log(chalk.magenta('Write ' + filename))
                this.numOfWritesRemaining--

                // Done, no more operations remaining
                if (this.numOfRequestsRemaining === 0 && this.numOfWritesRemaining === 0) {
                    this.resolve(true)
                }
            })
        })
    }

    /**
     * Iterate through each child and call travers
     *
     * @param {object} node The data object
     * @param {string} rel The reference key
     */
    traverseChildren(node, rel) {
        _.forEach(node, (subNode) => {
            _.forEach(_.filter(subNode.links, { "rel": rel }), (subLink) => {
                this.traverse(subLink.href)
            })
        })
    }

    /**
     * Recursively perform request on child nodes
     * Write file if document or media type
     *
     * @param {string} link The endpoint link
     */
    traverse(link) {
        this.numOfRequestsRemaining++
        this.responsysAuth.authorisedRequest('GET', link, (error, response, body) => {
            this.numOfRequestsRemaining--
            if (response && response.statusCode === 200) {
                var node = JSON.parse(body)
                this.traverseChildren(node.folders, 'listContentLibraryFolders')
                this.traverseChildren(node.documents, 'getDocumentContent')
                this.traverseChildren(node.items, 'getContentLibraryItem')

                // Document file, (.txt, .html...)
                if (node.hasOwnProperty('documentPath') && node.hasOwnProperty('content')) {
                    this.writeFile(node.documentPath, node.content)
                }
                else
                // Media file, (.jpg, .png...) base64 encoded
                if (node.hasOwnProperty('itemPath') && node.hasOwnProperty('itemData')) {
                    this.writeFile(node.itemPath, Buffer.from(node.itemData, 'base64'))
                }
            }

            // Done, no more operations remaining
            if (this.numOfRequestsRemaining === 0 && this.numOfWritesRemaining === 0) {
                this.resolve(true)
            }
        })
    }
}