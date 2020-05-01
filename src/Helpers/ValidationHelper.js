'use strict'

const ValidationException = require('./../Exceptions/ValidationException')

class ValidationHelper {
  constructor (validateAll) {
    this.validateAll = validateAll
  }

  async validate (method, inputs, rules) {
    if (!rules) {
      return
    }

    const activeRules = this.getValidationRules(method, rules)
    if (!activeRules) {
      return
    }

    const validation = await this.validateAll(inputs, activeRules)
    if (validation.fails()) {
      throw new ValidationException(validation)
    }
  }

  getValidationRules (method, rules) {
    if (this.hasSubRules(rules)) {
      return rules[method]
    }
    return rules
  }

  hasSubRules (rules) {
    return Object.keys(rules).some(key => key === 'POST' || key === 'PUT')
  }
}
module.exports = ValidationHelper
