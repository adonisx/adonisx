'use strict'

const { validateAll } = use('Validator')
const ValidationException = use('APIX/Exceptions/ValidationException')

class ValidationHelper {
  static async validate (inputs, rules) {
    let validation = await validateAll(inputs, rules)
    if (validation.fails()) {
      throw new ValidationException(validation)
    }
  }

}
module.exports = ValidationHelper