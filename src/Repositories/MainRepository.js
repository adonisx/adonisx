'use strict'

const { capitalCase, snakeCase } = require('change-case')
const HttpException = require('./../Exceptions/HttpException')

class MainRepository {
  constructor (validation, route, repositoryHelper, queryParser, event) {
    this.validation = validation
    this.route = route
    this.repositoryHelper = repositoryHelper
    this.queryParser = queryParser
    this.event = event
  }

  async paginate (request, params) {
    // We should parse URL query string to use as condition in Lucid query
    const conditions = this.queryParser.get(request.all())

    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.adonisx.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // Creating a new database query
    const query = Model.query()

    // Users should be able to select some fields to show.
    this.queryParser.applyFields(query, conditions.fields)

    this.repositoryHelper.addParentIdCondition(query, params, request.adonisx.parent_column)

    // Users should be able to filter records
    this.queryParser.applyWheres(query, conditions.q)

    // Users should be able to add relationships to the query
    this.queryParser.applyRelations(query, conditions.with)

    // We should call onBeforePagination action
    const modelName = modelPath.replace('App/Models/', '')

    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onBeforePaginate',
      { request, params, query }
    )

    this.event.fire(`onBeforePaginate${modelName}`, { request, params, query })

    // User should be able to select sorting fields and types
    this.queryParser.applySorting(query, conditions.sort)

    // Executing query
    const result = await query.paginate(
      conditions.page,
      conditions.per_page
    )

    // We should call onAfterPagination action
    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onAfterPaginate',
      { request, params, result }
    )

    this.event.fire(`onAfterPaginate${modelName}`, { request, params, result })

    // And this is my function response
    return result
  }

  async firstOrFail (request, params) {
    // We should parse URL query string to use as condition in Lucid query
    const conditions = this.queryParser.get(request.all())

    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.adonisx.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // Fetching item
    const query = Model.query()

    // Users should be able to select some fields to show.
    this.queryParser.applyFields(query, conditions.fields)

    this.repositoryHelper.addParentIdCondition(query, params, request.adonisx.parent_column)

    // Users should be able to filter records
    this.queryParser.applyWheres(query, conditions.q)

    // Users should be able to add relationships to the query
    this.queryParser.applyRelations(query, conditions.with)

    // We should add this condition in here because of performance.
    query.where('id', params.id)

    // We should call onBeforeShow action
    const modelName = modelPath.replace('App/Models/', '')

    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onBeforeShow',
      { request, params, query }
    )

    this.event.fire(`onBeforeShow${modelName}`, { request, params, query })

    const item = await this.safe(request, async () => {
      return await query.firstOrFail()
    })

    // We should call onAfterShow action
    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onAfterShow',
      { request, params, item }
    )

    this.event.fire(`onAfterShow${modelName}`, { request, params, item })

    return item
  }

  async store (request, params) {
    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.adonisx.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // We should validate the data
    await this.validation.validate(request.method(), request.all(), Model.validations)
    // Preparing the data
    const data = request.getFillableFields(Model)

    // Binding parent id if there is.
    if (request.adonisx.parent_column) {
      data[snakeCase(request.adonisx.parent_column)] = params[request.adonisx.parent_column]
    }

    // We should call onBeforeCreate action
    const modelName = modelPath.replace('App/Models/', '')

    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onBeforeCreate',
      { request, params, data }
    )

    this.event.fire(`onBeforeCreate${modelName}`, { request, params, data })

    // Creating the item
    const item = await Model.create(data)

    // We should call onAfterCreate action
    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onAfterCreate',
      { request, params, data, item }
    )

    this.event.fire(`onAfterCreate${modelName}`, { request, params, data, item })

    // Returning response
    return item
  }

  async update (request, params) {
    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.adonisx.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // Fetching item
    const query = Model.query().where('id', params.id)

    this.repositoryHelper.addParentIdCondition(query, params, request.adonisx.parent_column)

    // We should call onBeforeUpdateQuery action
    const modelName = modelPath.replace('App/Models/', '')

    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onBeforeUpdateQuery',
      { request, params, query }
    )

    const item = await query.firstOrFail()

    // We should call onAfterUpdateQuery action
    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onAfterUpdateQuery',
      { request, params, item }
    )

    // Preparing the data
    const data = request.getFillableFields(Model)

    // Binding parent id if there is.
    if (request.adonisx.parent_column) {
      data[snakeCase(request.adonisx.parent_column)] = params[request.adonisx.parent_column]
    }

    // Updating the data
    item.merge(data)

    // We should validate the data
    await this.validation.validate(request.method(), item.toJSON(), Model.validations)

    // We should call onBeforeUpdate action
    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onBeforeUpdate',
      { request, params, item }
    )
    this.event.fire(`onBeforeUpdate${modelName}`, { request, params, item })

    await item.save()

    // We should call onAfterUpdate action
    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onAfterUpdate',
      { request, params, item }
    )
    this.event.fire(`onAfterUpdate${modelName}`, { request, params, item })

    // Returning response
    return item
  }

  async destroy (request, params) {
    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.adonisx.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // Fetching item
    const query = Model
      .query()
      .where('id', params.id)

    // Appending parent id condition
    this.repositoryHelper.addParentIdCondition(query, params, request.adonisx.parent_column)

    // We should call onBeforeDelete action
    const modelName = modelPath.replace('App/Models/', '')

    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onBeforeDelete',
      { request, params, query }
    )
    this.event.fire(`onBeforeDelete${modelName}`, { request, params, query })

    const item = (await query.firstOrFail()).toJSON()

    // Deleting the item
    await query.delete()

    // We should call onAfterDelete action
    await this.repositoryHelper.callAction(
      request.adonisx.url,
      'onAfterDelete',
      { request, params, item }
    )

    this.event.fire(`onAfterDelete${modelName}`, { request, params, item })
  }

  async safe (request, callback) {
    try {
      return await callback()
    } catch (error) {
      const name = this.repositoryHelper.getModelName(request.adonisx.url)
      throw new HttpException(404, `Record not found on ${capitalCase(name)}.`)
    }
  }

  async getBasicRoutes () {
    return this.route.list().map((route) => {
      const item = route.toJSON()
      return `${item.route} [${item.verbs.join('|')}]`
    })
  }

  async getAllRoutes () {
    return this.route.list().map((route) => {
      return route.toJSON()
    })
  }
}

module.exports = MainRepository
