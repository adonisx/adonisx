'use strict'

const ValidationException = require('./../Exceptions/ValidationException')

class ValidationHelper {
  constructor (validateAll) {
    this.validateAll = validateAll
  }

  async validate (inputs, rules) {
    const validation = await this.validateAll(inputs, rules)
    if (validation.fails()) {
      throw new ValidationException(validation)
    }
  }
}
module.exports = ValidationHelper
