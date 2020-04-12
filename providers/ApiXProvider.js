const { ServiceProvider } = use('@adonisjs/fold')
const { hooks } = use('@adonisjs/ignitor')
const pluralize = use('pluralize')

class ApiXProvider extends ServiceProvider {
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
    this._bind('APIX/Controllers/XController', '../src/Controllers/XController')
  }

  _bindExceptions () {
    this._bind('APIX/Exceptions/ApiException', '../src/Exceptions/ApiException')
    this._bind('APIX/Exceptions/Handler', '../src/Exceptions/Handler')
    this._bind('APIX/Exceptions/HttpException', '../src/Exceptions/HttpException')
    this._bind('APIX/Exceptions/ValidationException', '../src/Exceptions/ValidationException')
  }

  _bindHelpers () {
    this.app.bind('APIX/Helpers/ModelLoader', () => {
      const ModelLoader = require('./../src/Helpers/ModelLoader')
      const Helpers = use('Helpers')
      return new ModelLoader(
        use,
        use('fs'),
        `${Helpers.appRoot()}/app/Models/`
      )
    })

    this.app.bind('APIX/Helpers/ModelResolver', () => {
      const ModelResolver = require('./../src/Helpers/ModelResolver')
      return new ModelResolver(
        use('APIX/Helpers/ModelLoader'),
        use('APIX/Helpers/TreeMapper')
      )
    })

    this.app.bind('APIX/Helpers/QueryParser', () => {
      const QueryParser = require('./../src/Helpers/QueryParser')
      return new QueryParser()
    })

    this.app.singleton('APIX/Helpers/RouteHelper', () => {
      const RouteHelper = require('./../src/Helpers/RouteHelper')
      return new RouteHelper()
    })

    this.app.bind('APIX/Helpers/TreeMapper', () => {
      const TreeMapper = require('./../src/Helpers/TreeMapper')
      return new TreeMapper()
    })

    this.app.singleton('APIX/Helpers/TriggerHelper', () => {
      const TriggerHelper = require('./../src/Helpers/TriggerHelper')
      return new TriggerHelper(
        use('APIX/Helpers/ModelLoader')
      )
    })

    this.app.bind('APIX/Helpers/ValidationHelper', () => {
      const ValidationHelper = require('./../src/Helpers/ValidationHelper')
      const { validateAll } = use('Validator')
      return new ValidationHelper(
        validateAll
      )
    })
  }

  _bindModels () {
    this._bind('APIX/Models/XModel', '../src/Models/XModel')
  }

  _bindMiddlewares () {
    this.app.bind('APIX/Middleware/IdFilter', () => {
      const IdFilter = require('./../src/Middleware/IdFilter')
      return new IdFilter(
        use('APIX/Helpers/RouteHelper')
      )
    })
  }

  _bindRepositories () {
    this.app.bind('APIX/Repositories/RepositoryHelper', () => {
      const RepositoryHelper = require('./../src/Repositories/RepositoryHelper')
      return new RepositoryHelper(
        use('APIX/Helpers/RouteHelper')
      )
    })

    this.app.bind('APIX/Repositories/MainRepository', () => {
      const MainRepository = require('./../src/Repositories/MainRepository')
      return new MainRepository(
        use('APIX/Helpers/ValidationHelper'),
        use('Route'),
        use('APIX/Helpers/TriggerHelper'),
        use('APIX/Repositories/RepositoryHelper'),
        use('APIX/Helpers/QueryParser'),
        use('Event')
      )
    })
  }

  _bindAlias () {
    this.app.alias('APIX/Helpers/ValidationHelper', 'Validation')
  }

  _bind (name, path) {
    this.app.bind(name, () => {
      return require(path)
    })
  }

  _afterProvidersBooted () {
    const ModelResolver = use('APIX/Helpers/ModelResolver')
    const Helpers = use('Helpers')
  
    // We should create all routes by models
    const RouteCreator = require('./../src/Helpers/RouteCreator')
    const creator = new RouteCreator(
      use('Route'),
      use('APIX/Helpers/RouteHelper')
    )
    creator.create(ModelResolver.get())
    
    // Finally we should require the triggers if there is any.
    require(`${Helpers.appRoot()}/start/triggers.js`)
  }
}

module.exports = ApiXProvider