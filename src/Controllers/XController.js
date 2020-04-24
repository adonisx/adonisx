'use strict'

class XController {
  constructor () {
    this.repository = use('AdonisX/Repositories/MainRepository')
  }

  async index ({ request, response, params }) {
    return response.json(
      await this.repository.paginate(request, params)
    )
  }

  async show ({ request, response, params }) {
    return response.json(
      await this.repository.firstOrFail(request, params)
    )
  }

  async store ({ request, response, params }) {
    return response.json(
      await this.repository.store(request, params)
    )
  }

  async update ({ request, response, params }) {
    return response.json(
      await this.repository.update(request, params)
    )
  }

  async destroy ({ request, response, params }) {
    await this.repository.destroy(request, params)
    return response.ok()
  }

  async getBasicRoutes ({ response }) {
    return response.json(
      await this.repository.getBasicRoutes()
    )
  }

  async getAllRoutes ({ response }) {
    return response.json(
      await this.repository.getAllRoutes()
    )
  }
}

module.exports = XController
