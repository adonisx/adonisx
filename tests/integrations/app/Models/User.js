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
        surname: 'required|max:30'
      },
      PUT: {
        name: 'required|max:30',
        surname: 'required|max:30'
      }
    }
  }

  static get actions () {
    return ['GET', 'POST', 'PUT', 'DELETE']
  }
}

module.exports = User
