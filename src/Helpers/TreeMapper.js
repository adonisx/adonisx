class TreeMapper {
  create (map) {
    const tree = map
      .filter(model => 
        model.relations.length === 0 ||
        model.relations.filter(relation => relation.name !== 'HasOne').length > 0
      )
    for (const model of tree) {
      model.children = this._getChildrens(model, map)
    }
    return tree
  }

  _getChildrens (model, map) {
    const relationNames = model.relations
      .filter(item => item.name === 'HasMany')
      .map(item => item.model)

    const children = JSON.parse(JSON.stringify(map.filter(item => relationNames.indexOf(item.model) > -1)))
    for (const child of children) {
      child.children = this._getChildrens(child, map)
    }
    return children
  }
}

module.exports = TreeMapper