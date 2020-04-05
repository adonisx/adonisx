const { ServiceProvider } = require('@adonisjs/fold')

class ApiXProvider extends ServiceProvider {
  register () {
    this.app.bind('APIX/Controllers/XController', () => {
      return require('../src/Controllers/XController')
    })
  }
}

module.exports = ApiXProvider