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
    const modelPath = this.repositoryHelper.getModelPath(request.apix.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // Creating a new database query
    const query = Model.query()

    // Users should be able to select some fields to show.
    this.queryParser.applyFields(query, conditions.fields)

    this.repositoryHelper.addParentIdCondition(query, params, request.apix.parent_column)

    // Users should be able to filter records
    this.queryParser.applyWheres(query, conditions.q)

    // Users should be able to add relationships to the query
    this.queryParser.applyRelations(query, conditions.with)

    // We should trigger onBeforePagination events
    await this.trigger.fire('onBefore', modelPath, 'paginate', { query })
    this.event.fire('onBeforePaginate' + modelPath.replace('App/Models/', ''), { query })

    // User should be able to select sorting fields and types
    this.queryParser.applySorting(query, conditions.sort)

    // Executing query
    const result = await query.paginate(
      conditions.page,
      conditions.per_page
    )

    // We should trigger onAfterPagination events
    await this.trigger.fire('onAfter', modelPath, 'paginate', { result })
    this.event.fire('onAfterPaginate' + modelPath.replace('App/Models/', ''), { result })

    // And this is my function response
    return result
  }

  async firstOrFail (request, params) {
    // We should parse URL query string to use as condition in Lucid query
    const conditions = this.queryParser.get(request.all())

    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.apix.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // Fetching item
    const query = Model.query()

    // Users should be able to select some fields to show.
    this.queryParser.applyFields(query, conditions.fields)

    this.repositoryHelper.addParentIdCondition(query, params, request.apix.parent_column)

    // Users should be able to filter records
    this.queryParser.applyWheres(query, conditions.q)

    // Users should be able to add relationships to the query
    this.queryParser.applyRelations(query, conditions.with)

    // We should add this condition in here because of performance.
    query.where('id', params.id)

    // We should trigger onBeforeFirstOrFail events
    await this.trigger.fire('onBefore', modelPath, 'firstOrFail', { query })
    this.event.fire('onBeforeShow' + modelPath.replace('App/Models/', ''), { query })

    const item = await this.safe(request, async () => {
      return await query.firstOrFail()
    })

    // We should trigger onAfterFirstOrFail events
    await this.trigger.fire('onAfter', modelPath, 'firstOrFail', { item })
    this.event.fire('onAfterShow' + modelPath.replace('App/Models/', ''), { item })

    return item
  }

  async store (request, params) {
    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.apix.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // We should validate the data
    await this.validation.validate(request.all(), Model.validations)
    // Preparing the data
    const data = request.only(Model.fillable)
    // Binding parent id if there is.
    if (request.apix.parent_column) {
      data[snakeCase(request.apix.parent_column)] = params[request.apix.parent_column]
    }

    // We should trigger onBeforeCreate events
    await this.trigger.fire('onBefore', modelPath, 'create', { request, params, data })
    this.event.fire('onBeforeCreate' + modelPath.replace('App/Models/', ''), { request, params, data })

    // Creating the item
    const item = await Model.create(data)

    // We should trigger onAfterCreate events
    await this.trigger.fire('onAfter', modelPath, 'create', { request, params, data, item })
    this.event.fire('onAfterCreate' + modelPath.replace('App/Models/', ''), { request, params, data, item })

    // Returning response
    return item
  }

  async update (request, params) {
    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.apix.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // Fetching item
    const query = Model.query().where('id', params.id)

    this.repositoryHelper.addParentIdCondition(query, params, request.apix.parent_column)

    // We should trigger onBeforeUpdateQuery events
    await this.trigger.fire('onBefore', modelPath, 'updateQuery', { request, params, query })

    const item = await query.firstOrFail()

    // We should trigger onAfterUpdateQuery events
    await this.trigger.fire('onAfter', modelPath, 'updateQuery', { request, params, item })

    // Preparing the data
    const data = request.only(Model.fillable)
    // Binding parent id if there is.
    if (request.apix.parent_column) {
      data[snakeCase(request.apix.parent_column)] = params[request.apix.parent_column]
    }

    // Updating the data
    item.merge(data)

    // We should validate the data
    await this.validation.validate(item.toJSON(), Model.validations)

    // We should trigger onBeforeUpdate events
    await this.trigger.fire('onBefore', modelPath, 'update', { request, params, item })
    this.event.fire('onBeforeUpdate' + modelPath.replace('App/Models/', ''), { request, params, item })

    await item.save()

    // We should trigger onAfterUpdate events
    await this.trigger.fire('onAfter', modelPath, 'update', { request, params, item })
    this.event.fire('onAfterUpdate' + modelPath.replace('App/Models/', ''), { request, params, item })

    // Returning response
    return item
  }

  async destroy (request, params) {
    // Loading model
    const modelPath = this.repositoryHelper.getModelPath(request.apix.url)
    const Model = this.repositoryHelper.getModel(modelPath)

    // Fetching item
    const query = Model
      .query()
      .where('id', params.id)

    // Appending parent id condition
    this.repositoryHelper.addParentIdCondition(query, params, request.apix.parent_column)

    // We should trigger onBeforeDelete events
    await this.trigger.fire('onBefore', modelPath, 'delete', { request, params, query })
    this.event.fire('onBeforeDelete' + modelPath.replace('App/Models/', ''), { request, params, query })

    const item = (await query.firstOrFail()).toJSON()

    // Deleting the item
    await query.delete()

    // We should trigger onAfterDelete events
    await this.trigger.fire('onAfter', modelPath, 'delete', { item })
    this.event.fire('onAfterDelete' + modelPath.replace('App/Models/', ''), { item })
  }

  async safe (request, callback) {
    try {
      return await callback()
    } catch (error) {
      const name = this.repositoryHelper.getModelName(request.apix.url)
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
