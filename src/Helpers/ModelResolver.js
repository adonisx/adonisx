class ModelResolver {
  constructor (modelLoader, treeMapper, actionLoader) {
    this.modelLoader = modelLoader
    this.treeMapper = treeMapper
    this.actionLoader = actionLoader
  }

  get () {
    const map = []
    for (const file of this.modelLoader.getFiles()) {
      const Model = this.modelLoader.getModel(file)
      const instance = this.modelLoader.getInstance(Model)

      const key = file.replace('.js', '')
      const item = {
        model: key,
        table: Model.table,
        actions: Model.actions,
        middlewares: Model.middlewares,
        relations: [],
        action: this.actionLoader.actions.find(action => action.model === file.replace('.js', ''))
      }

      // We should load model actions in initialization process.
      if (item.action) {
        item.action = this.actionLoader.getInstance(item.action.file)
      }

      const methods = this.modelLoader.getModelRelationMethods(instance)
      for (const method of methods) {
        const result = instance[method]()
        const relation = JSON.parse(JSON.stringify(result.$relation))
        relation.model = result.RelatedModel.name
        item.relations.push(relation)
      }

      map.push(item)
    }

    return this.treeMapper.create(map)
  }
}

module.exports = ModelResolver
