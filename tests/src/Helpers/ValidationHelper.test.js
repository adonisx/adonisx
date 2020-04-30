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
    await helper.validate('POST', 'inputs', 'rules')
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
  await helper.validate('POST', 'inputs', 'rules')
})

test('Validation helper should be able to define if there is any sub rule by HTTP method type', async () => {
  const simpleRules = {
    email: 'required'
  }
  const withSubPostRules = {
    POST: {
      email: 'required'
    }
  }
  const withSubPutRules = {
    PUT: {
      email: 'required'
    }
  }
  const withSubRules = {
    POST: {
      email: 'required'
    },
    PUT: {
      email: 'required'
    }
  }
  const withSubRulesWithWrongKeys = {
    post: {
      email: 'required'
    },
    get: {
      email: 'required'
    }
  }
  const helper = new ValidationHelper({}, null)
  expect(helper.hasSubRules(simpleRules)).toBe(false)
  expect(helper.hasSubRules(withSubPostRules)).toBe(true)
  expect(helper.hasSubRules(withSubPutRules)).toBe(true)
  expect(helper.hasSubRules(withSubRules)).toBe(true)
  expect(helper.hasSubRules(withSubRulesWithWrongKeys)).toBe(false)
})

test('Validation helper should be able to return sub routes if there is any', async () => {
  const helper = new ValidationHelper({}, null)
  const simpleRules = {
    email: 'required'
  }
  const withSubPostRules = {
    POST: {
      email: 'required'
    }
  }
  const withSubWrongRules = {
    post: {
      email: 'required'
    }
  }

  expect(helper.getValidationRules('POST', simpleRules)).toBe(simpleRules)
  expect(helper.getValidationRules('POST', withSubPostRules)).toBe(withSubPostRules.POST)
  expect(helper.getValidationRules('PUT', withSubPostRules)).toBe(undefined)
  expect(helper.getValidationRules('POST', withSubWrongRules)).toBe(withSubWrongRules)
})
