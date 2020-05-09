'use strict'

/*
|--------------------------------------------------------------------------
| Vow file
|--------------------------------------------------------------------------
|
| The vow file is loaded before running your tests. This is the best place
| to hook operations `before` and `after` running the tests.
|
*/

const ace = require('@adonisjs/ace')
const fs = require('fs')

module.exports = (cli, runner) => {
  runner.before(async () => {
    if (fs.existsSync('./database/adonisx.sqlite')) {
      fs.unlinkSync('./database/adonisx.sqlite')
    }

    // We should sort of the suites by its name. Because we should have
    // a strict ordered suite list. Otherwise, we are trying to logout before
    // logged in.
    runner._suites.sort(function (a, b) {
      if (a.group._title < b.group._title) { return -1 }
      if (a.group._title > b.group._title) { return 1 }
      return 0
    })

    /*
    |--------------------------------------------------------------------------
    | Start the server
    |--------------------------------------------------------------------------
    |
    | Starts the http server before running the tests. You can comment this
    | line, if http server is not required
    |
    */
    use('Adonis/Src/Server').listen(process.env.HOST, process.env.PORT)

    /*
    |--------------------------------------------------------------------------
    | Run migrations
    |--------------------------------------------------------------------------
    |
    | Migrate the database before starting the tests.
    |
    */
    await ace.call('migration:run')
  })

  runner.after(async () => {
    /*
    |--------------------------------------------------------------------------
    | Shutdown server
    |--------------------------------------------------------------------------
    |
    | Shutdown the HTTP server when all tests have been executed.
    |
    */
    use('Adonis/Src/Server').getInstance().close()

    /*
    |--------------------------------------------------------------------------
    | Rollback migrations
    |--------------------------------------------------------------------------
    |
    | Once all tests have been completed, we should reset the database to it's
    | original state
    |
    */
    // await ace.call('migration:reset', {}, { silent: true })
  })
}
