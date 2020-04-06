const Helpers = use('Helpers')
const fs = use('fs')

class ModelResolver {

  constructor () {
    this.modelDirectory = `${Helpers.appRoot()}/app/Models`
  }

  get () {
    this.loadFiles()
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
      const Model = use(`App/Models/${file.replace('.js', '')}`)
      const instance = new Model()
    
      const key = file.replace('.js', '')
      const item = {
        model: key,
        table: Model.table,
        actions: Model.actions,
        relations: []
      }
    
      const methods = this.getMethods(instance)
      for (const method of methods) {
        const result = instance[method]()
        const relation = JSON.clone(result.$relation)
        relation.model = result.RelatedModel.name
        item.relations.push(relation)
      }
    
      this.map.push(item)
    }
  }

  loadFiles () {
    this.files = fs.readdirSync(this.modelDirectory)
    this.files = this.files.filter(file => file !== 'XModel.js')
  }

  getMethods (obj) {
    let properties = new Set()
    let currentObj = obj
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
  
    const defaultMethods = [
      'constructor',
      '_formatDateFields',
      '_getSetterValue',
      '_getGetterValue',
      '_setCreatedAt',
      '_setUpdatedAt',
      '_syncOriginals',
      '_insert',
      '_update',
      '_convertDatesToMomentInstances',
      'set',
      'toObject',
      'save',
      'delete',
      'newUp',
      'setRelated',
      'getRelated',
      'load',
      'loadMany',
      'hasOne',
      'hasMany',
      'belongsTo',
      'belongsToMany',
      'manyThrough',
      'reload',
      '_instantiate',
      'fill',
      'merge',
      'freeze',
      'unfreeze',
      'toJSON',
      '__defineGetter__',
      '__defineSetter__',
      'hasOwnProperty',
      '__lookupGetter__',
      '__lookupSetter__',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toString',
      'valueOf',
      'toLocaleString'
    ]
  
    return [...properties.keys()]
      .filter(item => typeof obj[item] === 'function')
      .filter(item => defaultMethods.indexOf(item) === -1)
  }

}

module.exports = ModelResolver