'use strict'

const pluralize = require('pluralize')
const { capitalCase } = require('change-case')
const HttpException = require('./../Exceptions/HttpException')

class IdFilter {
  constructor (routeHelper) {
    this.routeHelper = routeHelper
  }

  async handle (ctx, next) {
    this._setMatchedUrl(ctx.request, ctx.params)
    this._setParentColumns(ctx.request)

    // We should call custom middlewares in here if there is any
    await this._callCustomMiddlewares(ctx)

    // Fetching idKey data automatically
    for (const idKey of this._getSpecialIdKeys(ctx.request.adonisx.url)) {
      const Middleware = this.routeHelper.getMiddlewareModel(idKey)
      const Model = this._loadModel(Middleware.model)

      try {
        ctx.request.adonisx.layers[pluralize.singular(Middleware.table)] = await this._findOrFail(Model, ctx.params, idKey)
      } catch (error) {
        throw new HttpException(404, `Record not found on ${capitalCase(Middleware.model)}.`)
      }
    }

    await next()
  }

  async _callCustomMiddlewares (ctx) {
    const Model = this.routeHelper.get(ctx.request.adonisx.url)
    for (const middleware of Model.middlewares) {
      if (this._hasMiddleware(ctx, middleware)) {
        const MiddlewareClass = this._getMiddlewareInstance(middleware)
        const instance = new MiddlewareClass()
        await instance.handle(ctx)
      }
    }
  }

  _getMiddlewareInstance (item) {
    if (typeof item === 'string') {
      return use(item)
    }
    return use(item.middleware)
  }

  _hasMiddleware (ctx, item) {
    if (typeof item === 'string') {
      return true
    }

    return item.method === ctx.request.method()
  }

  _setMatchedUrl (request, params) {
    let url = request.url()
    for (const key in params) {
      url = url.replace(`/${params[key]}`, `/:${key}`)
    }
    url = url.replace('/:id', '')

    // We want to use this data in controller
    request.adonisx = {
      url,
      layers: {}
    }
  }

  _setParentColumns (request) {
    const sections = request.adonisx.url
      .replace('/api/', '')
      .split('/')
      .filter(item => item !== ':id' && item.indexOf(':') > -1)
    if (sections.length > 0) {
      request.adonisx.parent_column = sections[sections.length - 1].replace(':', '')
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
