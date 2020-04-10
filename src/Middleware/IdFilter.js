'use strict'

const pluralize = require('pluralize')
const { capitalCase } = require('change-case')
const HttpException = require('./../Exceptions/HttpException')

class IdFilter {
  constructor (routeHelper) {
    this.routeHelper = routeHelper
  }

  async handle ({ request, params }, next) {
    this._setMatchedUrl(request, params)
    this._setParentColumns(request)

    // Fetching idKey data automatically
    for (const idKey of this._getSpecialIdKeys(request.apix.url)) {
      const Middleware = this.routeHelper.getMiddlewareModel(idKey)
      const Model = this._loadModel(Middleware.model)

      try {
        request.apix.layers[pluralize.singular(Middleware.table)] = await this._findOrFail(Model, params, idKey)
      } catch (error) {
        console.log(error)
        throw new HttpException(404, `Record not found on ${capitalCase(Middleware.model)}.`)
      }
    }

    await next()
  }

  _setMatchedUrl (request, params) {
    let url = request.url()
    for (const key in params) {
      url = url.replace(`/${params[key]}`, `/:${key}`)
    }
    url = url.replace('/:id', '')
    
    // We want to use this data in controller
    request.apix = {
      url,
      layers: {}
    }
  }

  _setParentColumns (request) {
    const sections = request.apix.url
      .replace('/api/', '')
      .split('/')
      .filter(item => item !== ':id' && item.indexOf(':') > -1)    
    if (sections.length > 0) {
      request.apix.parent_column = sections[sections.length - 1].replace(':', '')
    }
  }

  _getSpecialIdKeys (url) {
    return url
      .split('/')
      .filter(item => item.indexOf(':') > -1)
      .filter(item => item !== ':id')
      .map(item => item.replace(':', ''))
  }

  _loadModel (model) {
    return use(`App/Models/${model}`)
  }

  async _findOrFail (Model, params, idKey) {
    return (await Model
      .query()
      .where('id', params[idKey])
      .firstOrFail())
      .toJSON()
  }
}

module.exports = IdFilter