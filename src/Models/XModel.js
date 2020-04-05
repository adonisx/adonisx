const Model = use('Model')

class XModel extends Model {
  static get actions () {
    return ['GET', 'POST', 'PUT', 'DELETE']
  }
}

module.exports = XModel
