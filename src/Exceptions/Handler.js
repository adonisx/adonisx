'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

class ExceptionHandler extends BaseExceptionHandler {
  async handle (error, { response }) {
    if (error.name === 'ModelNotFoundException') {
      return response.status(404).json({
        message: 'Record not found',
        error
      })
    }

    if (error.name === 'ValidationException') {
      return response
        .status(400)
        .json(error.validator.messages())
    }

    if (error.name === 'ApiException') {
      response
        .status(406)
        .json({
          message: error.message
        })
      return
    }

    if (error.name === 'HttpException') {
      response
        .status(error.status)
        .json({
          message: error.message
        })
      return
    }

    return super.handle(...arguments)
  }
}

module.exports = ExceptionHandler
