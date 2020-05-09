'use strict'

const XModel = use('AdonisX/Models/XModel')

class Post extends XModel {
  static get fillable () {
    return ['title', 'content']
  }

  static get validations () {
    return {
      title: 'required|max:100',
      content: 'required'
    }
  }
}

module.exports = Post
