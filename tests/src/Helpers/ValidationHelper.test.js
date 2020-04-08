const ValidationHelper = require(`${src}/Helpers/ValidationHelper`)

test('Validation helper should throw validation exception when it fails', async () => {
  const validation = {
    fails () {
      return true
    }
  }
  const validateAll = jest.fn(async () => {
    return validation
  })
  const helper = new ValidationHelper(validateAll, Error)  

  try {
    await helper.validate('inputs', 'rules')
  } catch (exception) {
    expect(exception.name).toBe('ValidationException')
  }
})

test('Validation helper shouldn\'t throw an exception when it is validated', async () => {
  const validation = {
    fails () {
      return false
    }
  }
  const validateAll = jest.fn(async () => {
    return validation
  })
  const helper = new ValidationHelper(validateAll, Error)  
  await helper.validate('inputs', 'rules')
})
