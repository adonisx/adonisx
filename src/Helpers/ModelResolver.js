class ModelResolver {

  constructor (modelLoader) {
    this.modelLoader = modelLoader
  }

  get () {
    this.files = this.modelLoader.get()
    this.loadMap()
    this.loadTree()
    return this.tree
  }

  loadTree () {
    this.tree = this.map
      .filter(model => 
        model.relations.length === 0 ||
        model.relations.filter(relation => relation.name !== 'HasOne').length > 0
      )
    for (const model of this.tree) {
      model.children = this.getChildrens(model)
    }
  }

  getChildrens (model) {
    const relationNames = model.relations
      .filter(item => item.name === 'HasMany')
      .map(item => item.model)

    const children = JSON.parse(JSON.stringify(this.map.filter(item => relationNames.indexOf(item.model) > -1)))
    for (const child of children) {
      child.children = this.getChildrens(child)
    }
    return children
  }

  loadMap () {
    this.map = []
    for (const file of this.files) {
      const Model = this.modelLoader.getInstance(file)
      const instance = new Model()
    
      const key = file.replace('.js', '')
      const item = {
        model: key,
        table: Model.table,
        actions: Model.actions,
        relations: []
      }
    
      const methods = this.modelLoader.getModelRelationMethods(instance)
      for (const method of methods) {
        const result = instance[method]()
        const relation = JSON.parse(JSON.stringify(result.$relation))
        relation.model = result.RelatedModel.name
        item.relations.push(relation)
      }
    
      this.map.push(item)
    }
  }
}

module.exports = ModelResolver