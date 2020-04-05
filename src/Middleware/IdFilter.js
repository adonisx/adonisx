'use strict'

const RouteHelper = use('RouteHelper')
const pluralize = use('pluralize')
const { capitalCase } = use('change-case')
const HttpException = use('APIX/Exceptions/HttpException')

class IdFilter {
  async handle ({ request, params }, next) {
    // Calculating real url schema
    let url = request.url()
    for (const key in params) {
      url = url.replace(`/${params[key]}`, `/:${key}`)
    }
    url = url.replace('/:id', '')
    
    // We want to use this data in controller
    request.apix = {
      url,
      parent_id: null,
      layers: {}
    }

    // We should calculate parent id if there is not any idx on url.
    const sections = request.apix.url
      .replace('/api/', '')
      .split('/')
      .filter(item => item !== ':id' && item.indexOf(':') > -1)    
    if (sections.length > 0) {
      request.apix.parent_column = sections[sections.length - 1].replace(':', '')
    }

    // WE should check if there is any special idKey in url
    const parts = request.apix.url
      .split('/')
      .filter(item => item.indexOf(':') > -1)
      .filter(item => item !== ':id')

    // Fetching idKey data automatically
    for (const part of parts) {
      const Middleware = RouteHelper.getMiddlewareModel(part.replace(':', ''))
      const Model = use(`App/Models/${Middleware.model}`)

      try {
        request.apix.layers[pluralize.singular(Middleware.table)] = (await Model
          .query()
          .where('id', params[part.replace(':', '')])
          .firstOrFail())
          .toJSON()
      } catch (error) {
        throw new HttpException(404, `Record not found on ${capitalCase(Middleware.model)}.`)
      }
    }

    await next()
  }
}

module.exports = IdFilter