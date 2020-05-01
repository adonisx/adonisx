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
  The fastest way to create Rest API by defining database models and their relations.
</h4>

# Overview

> This project is under development and not ready for production.

**AdonisX** is the *fastest* way to create **Rest API** by defining only database models and their relationships between them. It is built on [AdonisJs](https://adonisjs.com), and it's an awesome ORM library, [Lucid](https://adonisjs.com/docs/4.1/lucid). AdonisX takes AdonisJs' power and speeds it up! It analyzes models and their relationships and creates all Rest API routes automatically.

You are going to be able to develop an API **10 times faster!**

[Full Documentation](https://adonisx.github.io)

## How It Works?

**AdonisX** uses the basic structure of *AdonisJs*. It is a [Service Provider](https://adonisjs.com/docs/4.1/service-providers) which works in the initialization process of an AdonisJs application. It performs two basic functions;

- **Analyzes** your models and their relationships to create routes (*Initialization*)
- **Handles** all HTTP requests with a shared Controller (*Processing*)

Let's assume that you have a model like this;

```js
const XModel = use('AdonisX/Models/XModel')

class User extends XModel {

}
```

With this model, you will have all of the endpoints for **users** resource. **AdonisX** will create **CRUD** routes for you in the *initialization* and routes will be completely ready to be handled and processed by the shared controller.

If you execute **adonis route:list** command in your terminal, you can see all routes which have been created by **AdonisX**. 

![Adonis Routes](https://adonisx.github.io/images/03-routes.jpg)

All these requests will be handled by **MainController**. **MainController** is a controller which is controlled by **AdonisX**. It *handles* requests for all models. It is responsible to prepare a *response* for the user by model definitions. In model definitions, you can decide many things such as *form validation*, *custom middlewares* and *, etc*.

When you visit `/api/users` URL in your browser, you can see **AdonisX** is responding your request;

![Adonis Routes](https://adonisx.github.io/images/01-paginate.jpg)

With AdonisX, you **don't** have to code for all CRUD actions. You **don't** have to implement advanced query features. The only thing to do is **defining models** and **their relations** between each other. That's all! <Emoji code="1f389"></Emoji>

[Full Documentation](https://adonisx.github.io)

## Key Features

- Automatic route creating
- Automatic route handling
- Form validation support
- Middlewares
- Strong query features
- Recursive resources
- The extendable business logic structure
- Multiple database support (Postgres, MSSQL, MySQL, MariaDB, SQLite3, Oracle, and Amazon Redshift)
- Well documented

## Getting Started

To clone and run this application, you'll need [Git](https://git-scm.com/), [Node.js](https://nodejs.org) and [nodemon](https://www.npmjs.com/package/nodemon) installed on your computer. From your command line:

```bash
$ npm install -g @adonisjs/cli adonisx-cli
$ adonisx new
$ cd adonisx-example
$ yarn
$ adonis migration:run
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

