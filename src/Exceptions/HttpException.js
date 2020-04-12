'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class HttpException extends LogicalException {
  constructor (status, message) {
    super(message, status)
  }
}

module.exports = HttpException
