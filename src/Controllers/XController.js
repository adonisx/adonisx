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

    // We should trigger onAfterPagination events
    await Trigger.fire('onAfter', modelPath, 'paginate', { result })
    
    // And this is my function response
    return response.json(result)
  }

  async show ({ request, response, params }) {
    // Loading model
    const route = RouteHelper.get(request.apix.url)
    const modelPath = `App/Models/${route.model}`
    const Model = use(modelPath)

    // Fetching item
    const query = Model.query()
    this.appentParentIdCondition(request, params, query)

    // We should add this condition in here because of performance.
    query.where('id', params.id)

    // We should trigger onBeforeFirstOrFail events
    await Trigger.fire('onBefore', modelPath, 'firstOrFail', { query })

    const item = await this.safe(request, async () => {
      return await query.firstOrFail()
    })

    // We should trigger onAfterFirstOrFail events
    await Trigger.fire('onAfter', modelPath, 'firstOrFail', { item })

    return response.json(item)
  }

  async store ({ request, response, params }) {
    // Loading model
    const route = RouteHelper.get(request.apix.url)
    const modelPath = `App/Models/${route.model}`
    const Model = use(modelPath)

    // We should validate the data
    await Validation.validate(request.all(), Model.validations)
    // Preparing the data
    const data = request.only(Model.fillable)
    // Binding parent id if there is.
    if (request.apix.parent_column) {
      data[snakeCase(request.apix.parent_column)] = params[request.apix.parent_column]
    }

    // We should trigger onBeforeCreate events
    await Trigger.fire('onBefore', modelPath, 'create', { request, params, data })

    // Creating the item
    const item = await Model.create(data)

    // We should trigger onAfterCreate events
    await Trigger.fire('onAfter', modelPath, 'create', { request, params, data, item })

    // Returning response
    return response.json(item)
  }

  async update ({ request, response, params }) {
    // Loading model
    const route = RouteHelper.get(request.apix.url)
    const modelPath = `App/Models/${route.model}`
    const Model = use(modelPath)

    // Fetching item
    const query = Model.query().where('id', params.id)

    this.appentParentIdCondition(request, params, query)

    // We should trigger onBeforeUpdateQuery events
    await Trigger.fire('onBefore', modelPath, 'updateQuery', { request, params, query })

    const item = await query.firstOrFail()

    // We should trigger onAfterUpdateQuery events
    await Trigger.fire('onAfter', modelPath, 'updateQuery', { request, params, item })

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

    // We should trigger onBeforeUpdate events
    await Trigger.fire('onBefore', modelPath, 'update', { request, params, item })

    await item.save()

    // We should trigger onAfterUpdate events
    await Trigger.fire('onAfter', modelPath, 'update', { request, params, item })

    // Returning response
    return response.json(item)
  }

  async destroy ({ request, response, params }) {
    // Loading model
    const route = RouteHelper.get(request.apix.url)
    const modelPath = `App/Models/${route.model}`
    const Model = use(modelPath)

    // Fetching item
    const query = Model
      .query()
      .where('id', params.id)

    // Appending parent id condition
    this.appentParentIdCondition(request, params, query)

    // We should trigger onBeforeDelete events
    await Trigger.fire('onBefore', modelPath, 'delete', { request, params, query })

    const item = (await query.firstOrFail()).toJSON()

    // Deleting the item
    await query.delete()

    // We should trigger onAfterDelete events
    await Trigger.fire('onAfter', modelPath, 'delete', { item })

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
}

module.exports = XController