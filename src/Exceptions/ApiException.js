'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class ApiException extends LogicalException {

  constructor (message) {
    super(message, 406)
  }

}

module.exports = ApiException
