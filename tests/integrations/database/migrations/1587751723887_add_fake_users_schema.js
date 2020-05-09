'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database')

class UserRecordsSchema extends Schema {
  up () {
    this.schedule(async (trx) => {
      await Database
        .table('users')
        .transacting(trx)
        .insert([
          { email: 'user1@mail.com' },
          { email: 'user2@mail.com' },
          { email: 'user3@mail.com' }
        ])
    })
  }

  down () {
  }
}

module.exports = UserRecordsSchema
