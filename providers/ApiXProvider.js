const { ServiceProvider } = require('@adonisjs/fold')

class ApiXProvider extends ServiceProvider {
  register () {
    this._bind('APIX/Controllers/XController', '../src/Controllers/XController')

    this._bind('APIX/Exceptions/ApiException', '../src/Exceptions/ApiException')
    this._bind('APIX/Exceptions/Handler', '../src/Exceptions/Handler')
    this._bind('APIX/Exceptions/HttpException', '../src/Exceptions/HttpException')
    this._bind('APIX/Exceptions/ValidationException', '../src/Exceptions/ValidationException')

    this._bind('APIX/Helpers/RouteHelper', '../src/Helpers/RouteHelper')
    this._bind('APIX/Helpers/ValidationHelper', '../src/Helpers/ValidationHelper')

    this._bind('APIX/Models/XModel', '../src/Models/XModel')

    this.app.bind('APIX/Middleware/IdFilter', (app) => {
      const MiddlewareValidator = require('../src/Middleware/IdFilter')
      return new MiddlewareValidator()
    })

    // Singleton instances
    this.app.singleton('RouteHelper', function () {
      const RouteHelper = use('APIX/Helpers/RouteHelper')
      return new RouteHelper()
    })
  }

  _bind (name, path) {
    this.app.bind(name, () => {
      return require(path)
    })
  }
}

module.exports = ApiXProvider