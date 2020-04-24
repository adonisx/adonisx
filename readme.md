<h1 align="center">
  <br>
  <a href="https://adonisx.github.io">
    <img src="https://adonisx.github.io/logo.png" alt="Markdownify" width="200">
  </a>
  <br>
  AdonisX
  <br>
  <a href="https://travis-ci.org/adonisx/adonisx" target="_blank">
    <img src="https://travis-ci.org/adonisx/adonisx.svg?branch=master">
  </a>
  <a href="https://sonarcloud.io/dashboard?id=ozziest_apix" target="_blank">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=ozziest_apix&metric=alert_status">
  </a>
  <a href="https://github.com/adonisx/adonisx/issues" target="_blank">
    <img src="https://img.shields.io/github/issues/adonisx/adonisx.svg">
  </a>
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg">
  </a>
</h1>

<h4 align="center" style="color: #444">
  Fastest way to create Rest API by defining database models and their relations.
</h4>

# Overview

**AdonisX** is a *fastest* way to create **Rest API** by defining only database models and their relationships between them. It is built on [AdonisJs](https://adonisjs.com), and it's awesome ORM library, [Lucid](https://adonisjs.com/docs/4.1/lucid). AdonisX takes AdonisJs' power and speed it up! It analyzes models and their relationships and creates all Rest API routes automatically.

You are going to be able to develop an API **10 times faster!**

[Full Documentation](https://adonisx.github.io)

## How It Works?

Let's assume that you have a very simple table model like this;

```js
const XModel = use('APIX/Models/XModel')

class User extends XModel {
  static get table () {
    return 'users'
  }
}

module.exports = User
```

When you up your application, all of resource routes will be ready to use!

## Key Features

- Automatic route creating
- Automatic route handling
- Form validation support
- Middlewares
- Strong query features
- Recursive resources
- Extentable business logic structure
- Multiple database support (Postgres, MSSQL, MySQL, MariaDB, SQLite3, Oracle, and Amazon Redshift)
- Well documented

## Getting Started

To clone and run this application, you'll need [Git](https://git-scm.com/), [Node.js](https://nodejs.org) and [nodemon](https://www.npmjs.com/package/nodemon) installed on your computer. From your command line:

```bash
$ npm install -g adonisx-cli
$ adonisx new
$ cd adonisx-example
$ yarn
$ yarn serve

nodemon server.js
[nodemon] 2.0.2
[nodemon] to restart at any time, enter `rs`
[nodemon] watching dir(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
info: serving app on http://127.0.0.1:3333
```

That's all! Your API is ready to develop!

## Documentation

Do you need more? Check the awesome [documentation](https://adonisx.github.io).

## Contributing

Please take a look at our [contributing](https://adonisx.github.io/01-introduction/#contribution-guide) guidelines if you're interested in helping!


## License

[MIT License](LICENSE)

