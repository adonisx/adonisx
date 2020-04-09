class BaseHandlerMock {
  isExtended () {
    return true
  }
}
global.use = jest.fn(() => {
  return BaseHandlerMock
})

test('I should be create a Handler with basic extenion.', () => {
  const Handler = require(`${src}/Exceptions/Handler`)
  const instance = new Handler()
  expect(instance.isExtended()).toBe(true)
  expect(global.use.mock.calls.length).toBe(1)
  expect(global.use.mock.calls[0][0]).toBe('BaseExceptionHandler')
})

test('I should be able to handle model not found exception.', async () => {
  const response = {}
  response.status = jest.fn(() => {
    return response
  })
  response.json = jest.fn(() => {
    return 'JSONResponse'
  })

  const error = {
    name: 'ModelNotFoundException'
  }

  const Handler = require(`${src}/Exceptions/Handler`)
  const instance = new Handler()
  const result = await instance.handle(error, { response })

  expect(response.status.mock.calls.length).toBe(1)
  expect(response.status.mock.calls[0][0]).toBe(404)

  expect(response.json.mock.calls.length).toBe(1)
  expect(response.json.mock.calls[0][0].message).toBe('Record not found')
  expect(response.json.mock.calls[0][0].error).toBe(error)
  expect(result).toBe('JSONResponse')
})

test('I should be able to handle validation exception.', async () => {
  const response = {}
  response.status = jest.fn(() => {
    return response
  })
  response.json = jest.fn(() => {
    return 'JSONResponse'
  })

  const error = {
    name: 'ValidationException',
    validator: {
      messages: jest.fn(() => {
        return 'ValidationMessages'
      })
    }
  }

  const Handler = require(`${src}/Exceptions/Handler`)
  const instance = new Handler()
  const result = await instance.handle(error, { response })

  expect(response.status.mock.calls.length).toBe(1)
  expect(response.status.mock.calls[0][0]).toBe(400)

  expect(response.json.mock.calls.length).toBe(1)
  expect(response.json.mock.calls[0][0]).toBe('ValidationMessages')
  expect(result).toBe('JSONResponse')
})

test('I should be able to handle ApiException.', async () => {
  const response = {}
  response.status = jest.fn(() => {
    return response
  })
  response.json = jest.fn(() => {})

  const error = {
    name: 'ApiException',
    message: 'This is my special message'
  }

  const Handler = require(`${src}/Exceptions/Handler`)
  const instance = new Handler()
  await instance.handle(error, { response })

  expect(response.status.mock.calls.length).toBe(1)
  expect(response.status.mock.calls[0][0]).toBe(406)

  expect(response.json.mock.calls.length).toBe(1)
  expect(response.json.mock.calls[0][0].message).toBe(error.message)
})

test('I should be able to handle HttpException.', async () => {
  const response = {}
  response.status = jest.fn(() => {
    return response
  })
  response.json = jest.fn(() => {})

  const error = {
    name: 'HttpException',
    status: 403,
    message: 'This is an HTTP Exception message'
  }

  const Handler = require(`${src}/Exceptions/Handler`)
  const instance = new Handler()
  await instance.handle(error, { response })

  expect(response.status.mock.calls.length).toBe(1)
  expect(response.status.mock.calls[0][0]).toBe(error.status)

  expect(response.json.mock.calls.length).toBe(1)
  expect(response.json.mock.calls[0][0].message).toBe(error.message)
})
