const { test, trait } = use('Test/Suite')('01-User')
const assert = require('assert')

trait('Test/ApiClient')

test('I should not be able to create a new user with empty data', async ({ client }) => {
  const response = await client
    .post('/api/users')
    .end()
  response.assertStatus(400)
})

test('I should be able to create a new user', async ({ client }) => {
  const response = await client
    .post('/api/users')
    .send({
      email: 'admin@adonisx.com',
      name: 'Admin',
      surname: 'AdonisX',
      password: '123456'
    })
    .end()
  response.assertStatus(200)
  assert.equal(response.body.id, 1)
  assert.equal(response.body.email, 'admin@adonisx.com')
  assert.equal(response.body.name, 'Admin')
  assert.equal(response.body.surname, 'AdonisX')
  assert.equal(typeof response.body.password_salt, 'undefined')
  assert.equal(typeof response.body.password_hash, 'undefined')
})

test('I should not be able to list all users without token', async ({ client }) => {
  const response = await client
    .get('/api/users')
    .end()
  response.assertStatus(401)
})

test('I should be able to login', async ({ client }) => {
  const response = await client
    .post('/api/users/login')
    .send({
      email: 'admin@adonisx.com',
      password: '123456'
    })
    .end()
  response.assertStatus(200)
  assert.equal(response.body.id, 1)
  assert.equal(response.body.name, 'Admin')
  assert.equal(response.body.surname, 'AdonisX')
  process.env.TOKEN = `Bearer ${response.body.token}`
})

test('I should be able to list all users after login', async ({ client }) => {
  const response = await client
    .get('/api/users')
    .header('Authorization', process.env.TOKEN)
    .end()
  response.assertStatus(200)
  assert.equal(response.body.total, 1)
  assert.equal(response.body.page, 1)
  assert.equal(response.body.perPage, 10)
  assert.equal(response.body.data[0].id, 1)
  assert.equal(response.body.data[0].name, 'Admin')
  assert.equal(response.body.data[0].surname, 'AdonisX')
  assert.equal(typeof response.body.data[0].email, 'undefined')
})
