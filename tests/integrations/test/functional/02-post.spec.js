const { test, trait } = use('Test/Suite')('02-Post')
const assert = require('assert')

trait('Test/ApiClient')

test('I should not be able to list posts without token', async ({ client }) => {
  const response = await client
    .get('/api/users/1/posts')
    .end()
  response.assertStatus(401)
})

test('I should not be able to create a new post without token', async ({ client }) => {
  const response = await client
    .post('/api/users/1/posts')
    .end()
  response.assertStatus(401)
})

test('I should not be able to create a new post without data', async ({ client }) => {
  const response = await client
    .post('/api/users/1/posts')
    .header('Authorization', process.env.TOKEN)
    .end()
  response.assertStatus(400)
})

test('I should be able to create a new post', async ({ client }) => {
  const response = await client
    .post('/api/users/1/posts')
    .send({
      title: 'Why AdonisX Is Awesome?',
      content: 'This is the explanation why AdonisX is the best framework to write an API!'
    })
    .header('Authorization', process.env.TOKEN)
    .end()
  response.assertStatus(200)
  assert.equal(response.body.id, 1)
  assert.equal(parseInt(response.body.user_id), 1)
  assert.equal(response.body.title, 'Why AdonisX Is Awesome?')
  assert.equal(response.body.content, 'This is the explanation why AdonisX is the best framework to write an API!')
})

test('I should be able to list posts', async ({ client }) => {
  const response = await client
    .get('/api/users/1/posts')
    .header('Authorization', process.env.TOKEN)
    .end()
  response.assertStatus(200)
  assert.equal(response.body.total, 1)
  assert.equal(response.body.data[0].id, 1)
  assert.equal(response.body.data[0].user_id, 1)
})

test('I should not be able to list posts by undefined user', async ({ client }) => {
  const response = await client
    .get('/api/users/666/posts')
    .header('Authorization', process.env.TOKEN)
    .end()
  response.assertStatus(404)
  assert.equal(response.body.message, 'Record not found on User.')
})

test('I should be able to get the detail of the post', async ({ client }) => {
  const response = await client
    .get('/api/users/1/posts/1')
    .header('Authorization', process.env.TOKEN)
    .end()
  response.assertStatus(200)
  assert.equal(response.body.id, 1)
  assert.equal(response.body.user_id, 1)
  assert.equal(response.body.title, 'Why AdonisX Is Awesome?')
})

test('I should not be able to get the detail of an undefined post', async ({ client }) => {
  const response = await client
    .get('/api/users/1/posts/666')
    .header('Authorization', process.env.TOKEN)
    .end()
  response.assertStatus(404)
  assert.equal(response.body.message, 'Record not found on Post.')
})
