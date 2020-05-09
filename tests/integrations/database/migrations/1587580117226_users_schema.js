'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('email', 100).notNullable()
      table.string('name', 30).notNullable()
      table.string('surname', 30).notNullable()
      table.string('password_salt', 100).notNullable()
      table.string('password_hash', 100).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
