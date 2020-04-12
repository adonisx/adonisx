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
    for (const idKey of this._getSpecialIdKeys(ctx.request.apix.url)) {
      const Middleware = this.routeHelper.getMiddlewareModel(idKey)
      const Model = this._loadModel(Middleware.model)

      try {
        ctx.request.apix.layers[pluralize.singular(Middleware.table)] = await this._findOrFail(Model, ctx.params, idKey)
      } catch (error) {
        console.log(error)
        throw new HttpException(404, `Record not found on ${capitalCase(Middleware.model)}.`)
      }
    }

    await next()
  }

  async _callCustomMiddlewares (ctx) {
    return new Promise((resolve) => {
      const Model = this.routeHelper.get(ctx.request.apix.url)

      if (Model.middlewares.length === 0) {
        return resolve()
      }

      this.currentMiddlewareIndex = 0
      this._callNextMidleware(ctx, Model, () => {
        resolve()
      })
    })
  }

  _callNextMidleware (ctx, Model, next) {
    if (this.currentMiddlewareIndex >= Model.middlewares.length) {
      return next()
    }

    const item = Model.middlewares[this.currentMiddlewareIndex++]

    if (this._hasMiddleware(ctx, item)) {
      const MiddlewareClass = this._getMiddlewareInstance(item)
      const instance = new MiddlewareClass()
      instance.handle(ctx, () => {
        this._callNextMidleware(ctx, Model, next)
      })
    } else {
      next()
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
