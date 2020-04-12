'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class ValidationException extends LogicalException {
  constructor (validator) {
    super('ERROR', 400)
    this.validator = validator
  }
}

module.exports = ValidationException
