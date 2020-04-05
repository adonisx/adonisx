'use strict'

const RouteHelper = use('RouteHelper')
const { capitalCase, snakeCase } = use('change-case')
const Validation = use('Validation')
const HttpException = use('APIX/Exceptions/HttpException')
const Route = use('Route')
const Trigger = use('Trigger')

class XController {
  async index ({ request, response, params }) {
    // Loading model
    const route = RouteHelper.get(request.apix.url)
    const modelPath = `App/Models/${route.model}`
    const Model = use(modelPath)

    const query = Model.query()

    this.appentParentIdCondition(request, params, query)

    // We should trigger onBeforePagination events
    await Trigger.fire('onBefore', modelPath, 'paginate', { query })

    // Executing query
    const result = await query.paginate(1, 10)

    // We should trigger onBeforePagination events
    await Trigger.fire('onAfter', modelPath, 'paginate', { result })
    
    // And this is my function response
    return response.json(result)
  }

  async show ({ request, response, params }) {
    // Loading model
    const Model = this.getModel(request)

    // Fetching item
    const query = Model.query()
    this.appentParentIdCondition(request, params, query)

    const item = await this.safe(request, async () => {
      return await query
        .where('id', params.id)
        .firstOrFail()
    })

    return response.json(item)
  }

  async store ({ request, response, params }) {
    // Loading model
    const Model = this.getModel(request)
    // We should validate the data
    await Validation.validate(request.all(), Model.validations)
    // Preparing the data
    const data = request.only(Model.fillable)
    // Binding parent id if there is.
    if (request.apix.parent_column) {
      data[snakeCase(request.apix.parent_column)] = params[request.apix.parent_column]
    }
    // Creating the item
    const item = await Model.create(data)
    // Returning response
    return response.json(item)
  }

  async update ({ request, response, params }) {
    // Loading model
    const Model = this.getModel(request)
    // Fetching item
    const query = Model.query()
    this.appentParentIdCondition(request, params, query)
    const item = await query
      .where('id', params.id)
      .firstOrFail()

    // Preparing the data
    const data = request.only(Model.fillable)
    // Binding parent id if there is.
    if (request.apix.parent_column) {
      data[snakeCase(request.apix.parent_column)] = params[request.apix.parent_column]
    }

    // Updating the data
    item.merge(data)

    // We should validate the data
    await Validation.validate(item.toJSON(), Model.validations)

    await item.save()

    // Returning response
    return response.json(item)
  }

  async destroy ({ request, response, params }) {
    // Loading model
    const Model = this.getModel(request)

    // Fetching item
    const query = Model
      .query()
      .where('id', params.id)

    // Appending parent id condition
    this.appentParentIdCondition(request, params, query)

    // Deleting the item
    await query.delete()
    return response.ok()
  }

  async safe (request, callback) {
    try {
      return await callback()
    } catch (error) {
      const resource = RouteHelper.get(request.apix.url)
      throw new HttpException(404, `Record not found on ${capitalCase(resource.model)}.`)
    }
  }

  async getBasicRoutes ({ response }) {
    let list = Route.list().map((route) => {
      const item = route.toJSON()
      return `${item.route} [${item.verbs.join('|')}]`
    })
    return response.json(list)
  }

  async getAllRoutes ({ response }) {
    let list = Route.list().map((route) => {
      return route.toJSON()
    })
    return response.json(list)
  }

  appentParentIdCondition (request, params, query) {
    // If there is any parent column information, we should filter data like this.
    if (request.apix.parent_column) {
      query.where(snakeCase(request.apix.parent_column), params[request.apix.parent_column])
    }
  }

  getModel (request) {
    const route = RouteHelper.get(request.apix.url)
    return use(`App/Models/${route.model}`)
  }
}

module.exports = XController