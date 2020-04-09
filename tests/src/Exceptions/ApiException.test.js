const { LogicalException } = require('@adonisjs/generic-exceptions')

test('I should be create a ApiException with status code.', () => {
  const ApiException = require(`${src}/Exceptions/ApiException`)

  expect(() => {
    throw new ApiException('My customer message')
  }).toThrow(LogicalException)

  try {
    throw new ApiException('My customer message')
  } catch (error) {
    expect(error.message).toBe('My customer message')
    expect(error.status).toBe(406)
  }
})

