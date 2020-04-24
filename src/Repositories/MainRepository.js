'use strict'

const { capitalCase, snakeCase } = require('change-case')
const HttpException = require('./../Exceptions/HttpException')

class MainRepository {
  constructor (validation, route, trigger, repositoryHelper, queryParser, event) {
    this.validation = validation
    this.route = route
    this.trigger = trigger
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

    // We should trigger onBeforePagination events
    const modelName = modelPath.replace('App/Models/', '')
    await this.trigger.fire(`onBeforePaginate${modelName}`, { query })
    this.event.fire(`onBeforePaginate${modelName}`, { query })

    // User should be able to select sorting fields and types
    this.queryParser.applySorting(query, conditions.sort)

    // Executing query
    const result = await query.paginate(
      conditions.page,
      conditions.per_page
    )

    // We should trigger onAfterPagination events
    await this.trigger.fire(`onAfterPaginate${modelName}`, { result })
    this.event.fire(`onAfterPaginate${modelName}`, { result })

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

    // We should trigger onBeforeFirstOrFail events
    const modelName = modelPath.replace('App/Models/', '')
    await this.trigger.fire(`onBeforeShow${modelName}`, { query })
    this.event.fire(`onBeforeShow${modelName}`, { query })

    const item = await this.safe(request, async () => {
      return await query.firstOrFail()
    })

    // We should trigger onAfterFirstOrFail events
    await this.trigger.fire(`onAfterShow${modelName}`, { item })
    this.event.fire(`onAfterShow${modelName}`, { item })

    return item
  }

  async store (request, params) {
    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.adonisx.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // We should validate the data
    await this.validation.validate(request.all(), Model.validations)
    // Preparing the data
    const data = request.only(Model.fillable)
    // Binding parent id if there is.
    if (request.adonisx.parent_column) {
      data[snakeCase(request.adonisx.parent_column)] = params[request.adonisx.parent_column]
    }

    // We should trigger onBeforeCreate events
    const modelName = modelPath.replace('App/Models/', '')
    await this.trigger.fire(`onBeforeCreate${modelName}`, { request, params, data })
    this.event.fire(`onBeforeCreate${modelName}`, { request, params, data })

    // Creating the item
    const item = await Model.create(data)

    // We should trigger onAfterCreate events
    await this.trigger.fire(`onAfterCreate${modelName}`, { request, params, data, item })
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

    // We should trigger onBeforeUpdateQuery events
    const modelName = modelPath.replace('App/Models/', '')
    await this.trigger.fire(`onBeforeUpdateQuery${modelName}`, { request, params, query })

    const item = await query.firstOrFail()

    // We should trigger onAfterUpdateQuery events
    await this.trigger.fire(`onAfterUpdateQuery${modelName}`, { request, params, item })

    // Preparing the data
    const data = request.only(Model.fillable)
    // Binding parent id if there is.
    if (request.adonisx.parent_column) {
      data[snakeCase(request.adonisx.parent_column)] = params[request.adonisx.parent_column]
    }

    // Updating the data
    item.merge(data)

    // We should validate the data
    await this.validation.validate(item.toJSON(), Model.validations)

    // We should trigger onBeforeUpdate events
    await this.trigger.fire(`onBeforeUpdate${modelName}`, { request, params, item })
    this.event.fire(`onBeforeUpdate${modelName}`, { request, params, item })

    await item.save()

    // We should trigger onAfterUpdate events
    await this.trigger.fire(`onAfterUpdate${modelName}`, { request, params, item })
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

    // We should trigger onBeforeDelete events
    const modelName = modelPath.replace('App/Models/', '')
    await this.trigger.fire(`onBeforeDelete${modelName}`, { request, params, query })
    this.event.fire(`onBeforeDelete${modelName}`, { request, params, query })

    const item = (await query.firstOrFail()).toJSON()

    // Deleting the item
    await query.delete()

    // We should trigger onAfterDelete events
    await this.trigger.fire(`onAfterDelete${modelName}`, { item })
    this.event.fire(`onAfterDelete${modelName}`, { item })
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
