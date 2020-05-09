'use strict'

const XModel = use('AdonisX/Models/XModel')

class User extends XModel {
  static get hidden () {
    return ['password_salt', 'password_hash']
  }

  static get fillable () {
    return {
      POST: ['email', 'name', 'surname'],
      PUT: ['email', 'name', 'surname']
    }
  }

  static get validations () {
    return {
      POST: {
        email: 'required|email|max:100',
        name: 'required|max:30',
        surname: 'required|max:30',
        password: 'required|min:6|max:20'
      },
      PUT: {
        name: 'required|max:30',
        surname: 'required|max:30'
      }
    }
  }

  static get actions () {
    return ['GET', 'POST', 'PUT']
  }

  static get middlewares () {
    return [
      { method: 'GET', middleware: 'App/Middleware/AuthMiddleware' }
    ]
  }

  posts () {
    return this.hasMany('App/Models/Post')
  }
}

module.exports = User
