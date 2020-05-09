'use strict'

const XModel = use('AdonisX/Models/XModel')

class Token extends XModel {
  static get actions () {
    return []
  }

  user () {
    return this.hasOne('App/Models/User', 'user_id', 'id')
  }
}

module.exports = Token
