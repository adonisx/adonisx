const { ServiceProvider } = use('@adonisjs/fold')
const { hooks } = use('@adonisjs/ignitor')
const pluralize = use('pluralize')

class ApiXProvider extends ServiceProvider {
  register () {
    this._bindControllers()
    this._bindExceptions()
    this._bindHelpers()
    this._bindModels()
    this._bindRepositories()

    // this._bind('APIX/Middleware/IdFilter', '../src/Middleware/IdFilter')
    this.app.alias('APIX/Helpers/ValidationHelper', 'Validation')
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
        use('APIX/Repositories/RepositoryHelper')
      )
    })
  }

  _afterProvidersBooted () {
    const Route = use('Route')
    const RouteHelper = use('APIX/Helpers/RouteHelper')
    const ModelResolver = use('APIX/Helpers/ModelResolver')
    const Helpers = use('Helpers')
        
    const tree = ModelResolver.get()
    
    const createRoutes = (parentUrl, parentModel, model) => {
      // We are deciding the sub resource name
      let resource = pluralize
        .plural(pluralize.singular(model.model).replace(pluralize.singular(parentModel), ''))
        .toLowerCase()
    
      // We should carry the model for controller
      RouteHelper.set(`/api/${parentUrl}${resource}`, model)
    
      // Basic routes
      if (model.actions.some(action => action === 'GET')) {
        Route.get(`/api/${parentUrl}${resource}`, 'MainController.index').middleware('idFilter')
        Route.get(`/api/${parentUrl}${resource}/:id`, 'MainController.show').middleware('idFilter')
      }
    
      if (model.actions.some(action => action === 'POST')) {
        Route.post(`/api/${parentUrl}${resource}`, 'MainController.store').middleware('idFilter')
      }
    
      if (model.actions.some(action => action === 'PUT')) {
        Route.put(`/api/${parentUrl}${resource}/:id`, 'MainController.update').middleware('idFilter')
      }
    
      if (model.actions.some(action => action === 'DELETE')) {
        Route.delete(`/api/${parentUrl}${resource}/:id`, 'MainController.destroy').middleware('idFilter')
      }
    
      if (model.children.length > 0) {
        // We should different parameter name for child routes
        let idKey = pluralize.singular(resource) + 'Id'
    
        // We should add some dynamic middleware for this id key
        RouteHelper.setMiddleware(idKey, model)
    
        for (const child of model.children) {
          // It should be recursive
          createRoutes(`${parentUrl}${resource}/:${idKey}/`, model.model, child)
        }
      }
    }
    
    // Adding all routes
    for (const model of tree) {
      createRoutes('', '', model)
    }
    
    Route.get(`/dev/routes/list`, 'MainController.getBasicRoutes')
    Route.get(`/dev/routes/all`, 'MainController.getAllRoutes')

    require(`${Helpers.appRoot()}/start/triggers.js`)
  }

  _bind (name, path) {
    this.app.bind(name, () => {
      return require(path)
    })
  }
}

module.exports = ApiXProvider