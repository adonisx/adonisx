'use strict'

const XModel = use('AdonisX/Models/XModel')

class User extends XModel {
  static boot () {
    super.boot()
  }

  static get table () {
    return 'users'
  }

  static get hidden () {
    return ['password']
  }

  static get fillable () {
    return ['email']
  }

  static get validations () {
    return {
      email: 'required|email|max:100'
    }
  }

  static get actions () {
    return ['GET', 'PUT', 'UPDATE', 'DELETE']
  }

  static get middlewares () {
    return [
      { method: 'DELETE', middleware: 'App/Middleware/AdminMiddleware' }
    ]
  }
}

module.exports = User
