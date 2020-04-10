const pluralize = require('pluralize')

class RouteCreator {
  constructor (route, routeHelper) {
    this.route = route
    this.routeHelper = routeHelper
  }

  create (tree) {
    for (const model of tree) {
      this._createRoutes('', '', model)
    }
    
    this.route.get(`/dev/routes/list`, 'MainController.getBasicRoutes')
    this.route.get(`/dev/routes/all`, 'MainController.getAllRoutes')
  }

  _createRoutes (parentUrl, parentModel, model) {
    // We are deciding the sub resource name
    let resource = pluralize
      .plural(pluralize.singular(model.model).replace(pluralize.singular(parentModel), ''))
      .toLowerCase()
  
    // We should carry the model for controller
    this.routeHelper.set(`/api/${parentUrl}${resource}`, model)
  
    // Basic routes
    if (model.actions.some(action => action === 'GET')) {
      this.route.get(`/api/${parentUrl}${resource}`, 'MainController.index').middleware('idFilter')
      this.route.get(`/api/${parentUrl}${resource}/:id`, 'MainController.show').middleware('idFilter')
    }
  
    if (model.actions.some(action => action === 'POST')) {
      this.route.post(`/api/${parentUrl}${resource}`, 'MainController.store').middleware('idFilter')
    }
  
    if (model.actions.some(action => action === 'PUT')) {
      this.route.put(`/api/${parentUrl}${resource}/:id`, 'MainController.update').middleware('idFilter')
    }
  
    if (model.actions.some(action => action === 'DELETE')) {
      this.route.delete(`/api/${parentUrl}${resource}/:id`, 'MainController.destroy').middleware('idFilter')
    }
  
    if (model.children.length > 0) {
      // We should different parameter name for child routes
      let idKey = pluralize.singular(resource) + 'Id'
  
      // We should add some dynamic middleware for this id key
      this.routeHelper.setMiddleware(idKey, model)
  
      for (const child of model.children) {
        // It should be recursive
        this._createRoutes(`${parentUrl}${resource}/:${idKey}/`, model.model, child)
      }
    }
  }
}

module.exports = RouteCreator
