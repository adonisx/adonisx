'use strict'

const { snakeCase } = require('change-case')

class RepositoryHelper {
  constructor (routeHelper) {
    this.routeHelper = routeHelper
  }

  getModelPath (url) {
    const route = this.routeHelper.get(url)
    return `App/Models/${route.model}`
  }

  getModelName (url) {
    const route = this.routeHelper.get(url)
    return route.model
  }

  getModel (path) {
    return use(path)
  }

  getAction (url) {
    const route = this.routeHelper.get(url)
    return route.action
  }

  async callAction (url, method, params) {
    const action = this.getAction(url)
    if (!action || typeof action[method] !== 'function') {
      return
    }
    await action[method](params)
  }

  addParentIdCondition (query, params, parentColumn) {
    // If there is not any parentColumn data, we don't have anything to do.
    if (!parentColumn) {
      return
    }

    // If there is any parent column information, we should filter data like this.
    query.where(snakeCase(parentColumn), params[parentColumn])
  }
}

module.exports = RepositoryHelper
