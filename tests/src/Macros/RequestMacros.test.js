const RequestMacros = require(`${src}/Macros/RequestMacros`)
RequestMacros.only = jest.fn((items) => {
  return items
})
RequestMacros.method = jest.fn(() => {
  return 'POST'
})

test('I should be able to define fillable fields for all method types', () => {
  const model = {
    fillable: ['email', 'name', 'surname']
  }
  const result = RequestMacros.getFillableFields(model)
  expect(result).toBe(model.fillable)
  expect(RequestMacros.only.mock.calls.length).toBe(1)
  expect(RequestMacros.only.mock.calls[0][0]).toBe(model.fillable)
})

test('I should be able to define fillable fields for only POST methods', () => {
  const model = {
    fillable: {
      POST: ['email', 'name', 'surname']
    }
  }
  const result = RequestMacros.getFillableFields(model)
  expect(result).toBe(model.fillable.POST)
  expect(RequestMacros.only.mock.calls.length).toBe(2)
  expect(RequestMacros.only.mock.calls[1][0]).toBe(model.fillable.POST)
})

test('I should be able to define fillable fields for only PUT methods', () => {
  const model = {
    fillable: {
      POST: ['email', 'name', 'surname'],
      PUT: ['name', 'surname']
    }
  }
  RequestMacros.method = jest.fn(() => {
    return 'PUT'
  })
  const result = RequestMacros.getFillableFields(model)
  expect(result).toBe(model.fillable.PUT)
  expect(RequestMacros.only.mock.calls.length).toBe(3)
  expect(RequestMacros.only.mock.calls[2][0]).toBe(model.fillable.PUT)
})

test('I should be able to see an error when I use wrong method names', () => {
  const model = {
    fillable: {
      post: ['email', 'name', 'surname']
    }
  }
  RequestMacros.method = jest.fn(() => {
    return 'POST'
  })
  expect(RequestMacros.getFillableFields(model).length).toBe(0)
})

test('I should be able to see an empty array if there is not any fillable method.', () => {
  expect(RequestMacros.getFillableFields({}).length).toBe(0)
  expect(RequestMacros.only.mock.calls.length).toBe(3)
})
