const { ServiceProvider } = require('@adonisjs/fold')

class ApiXProvider extends ServiceProvider {
  register () {
    this._bind('APIX/Controllers/XController', '../src/Controllers/XController')

    this._bind('APIX/Exceptions/ApiException', '../src/Exceptions/ApiException')
    this._bind('APIX/Exceptions/HttpException', '../src/Exceptions/HttpException')
    this._bind('APIX/Exceptions/ValidationException', '../src/Exceptions/ValidationException')

    this._bind('APIX/Helpers/RouteHelper', '../src/Helpers/RouteHelper')
    this._bind('APIX/Helpers/ValidationHelper', '../src/Helpers/ValidationHelper')
  }

  _bind (name, path) {
    this.app.bind(name, () => {
      return require(path)
    })
  }
}

module.exports = ApiXProvider