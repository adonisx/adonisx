const fs = use('fs')
const { ServiceProvider } = use('@adonisjs/fold')
const { hooks } = use('@adonisjs/ignitor')

class AdonisXProvider extends ServiceProvider {
  register () {
    this._bindControllers()
    this._bindExceptions()
    this._bindHelpers()
    this._bindModels()
    this._bindMiddlewares()
    this._bindRepositories()
    this._bindAlias()
    hooks.after.providersBooted(this._afterProvidersBooted)
  }

  _bindControllers () {
    this._bind('AdonisX/Controllers/XController', '../src/Controllers/XController')
  }

  _bindExceptions () {
    this._bind('AdonisX/Exceptions/ApiException', '../src/Exceptions/ApiException')
    this._bind('AdonisX/Exceptions/Handler', '../src/Exceptions/Handler')
    this._bind('AdonisX/Exceptions/HttpException', '../src/Exceptions/HttpException')
    this._bind('AdonisX/Exceptions/ValidationException', '../src/Exceptions/ValidationException')
  }

  _bindHelpers () {
    this.app.bind('AdonisX/Helpers/ModelLoader', () => {
      const ModelLoader = require('./../src/Helpers/ModelLoader')
      const Helpers = use('Helpers')
      return new ModelLoader(
        use,
        use('fs'),
        `${Helpers.appRoot()}/app/Models/`
      )
    })

    this.app.bind('AdonisX/Helpers/ActionLoader', () => {
      const ActionLoader = require('./../src/Helpers/ActionLoader')
      const Helpers = use('Helpers')
      return new ActionLoader(
        use,
        use('fs'),
        `${Helpers.appRoot()}/app/Actions/`
      )
    })

    this.app.bind('AdonisX/Helpers/ModelResolver', () => {
      const ModelResolver = require('./../src/Helpers/ModelResolver')
      return new ModelResolver(
        use('AdonisX/Helpers/ModelLoader'),
        use('AdonisX/Helpers/TreeMapper'),
        use('AdonisX/Helpers/ActionLoader')
      )
    })

    this.app.bind('AdonisX/Helpers/QueryParser', () => {
      const QueryParser = require('./../src/Helpers/QueryParser')
      return new QueryParser()
    })

    this.app.singleton('AdonisX/Helpers/RouteHelper', () => {
      const RouteHelper = require('./../src/Helpers/RouteHelper')
      return new RouteHelper()
    })

    this.app.bind('AdonisX/Helpers/TreeMapper', () => {
      const TreeMapper = require('./../src/Helpers/TreeMapper')
      return new TreeMapper()
    })

    this.app.bind('AdonisX/Helpers/ValidationHelper', () => {
      const ValidationHelper = require('./../src/Helpers/ValidationHelper')
      const { validateAll } = use('Validator')
      return new ValidationHelper(
        validateAll
      )
    })
  }

  _bindModels () {
    this._bind('AdonisX/Models/XModel', '../src/Models/XModel')
  }

  _bindMiddlewares () {
    this.app.bind('AdonisX/Middleware/IdFilter', () => {
      const IdFilter = require('./../src/Middleware/IdFilter')
      return new IdFilter(
        use('AdonisX/Helpers/RouteHelper')
      )
    })
  }

  _bindRepositories () {
    this.app.bind('AdonisX/Repositories/RepositoryHelper', () => {
      const RepositoryHelper = require('./../src/Repositories/RepositoryHelper')
      return new RepositoryHelper(
        use('AdonisX/Helpers/RouteHelper')
      )
    })

    this.app.bind('AdonisX/Repositories/MainRepository', () => {
      const MainRepository = require('./../src/Repositories/MainRepository')
      return new MainRepository(
        use('AdonisX/Helpers/ValidationHelper'),
        use('Route'),
        use('AdonisX/Repositories/RepositoryHelper'),
        use('AdonisX/Helpers/QueryParser'),
        use('Event')
      )
    })
  }

  _bindAlias () {
    this.app.alias('AdonisX/Helpers/ValidationHelper', 'Validation')
  }

  _bind (name, path) {
    this.app.bind(name, () => {
      return require(path)
    })
  }

  _afterProvidersBooted () {
    const ModelResolver = use('AdonisX/Helpers/ModelResolver')

    // We should create all routes by models
    const RouteCreator = require('./../src/Helpers/RouteCreator')
    const creator = new RouteCreator(
      use('Route'),
      use('AdonisX/Helpers/RouteHelper')
    )
    creator.create(ModelResolver.get())

    // I should be able to get fillable data from request.
    const RequestMacros = require('./../src/Macros/RequestMacros')
    const Request = use('Adonis/Src/Request')
    Request.macro('getFillableFields', RequestMacros.getFillableFields)
  }
}

module.exports = AdonisXProvider
