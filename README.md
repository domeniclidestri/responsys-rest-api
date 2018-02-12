# Responsys REST API

Interface to Oracle Responsys REST API

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org) - v8.9.1+
* [npm](https://www.npmjs.com/) - v5.5.1+

#### Install dependencies

Install with npm

```
npm install
```

#### Setup environment

Set authentication credentials in environment (see .env.example).

[dotenv](https://www.npmjs.com/package/dotenv) package is used which will support reading environment variables from a .env file

```
cp .env.example .env
```

#### Testing

[mocha](https://www.npmjs.com/package/mocha) is used for automated testing

```
npm test
```