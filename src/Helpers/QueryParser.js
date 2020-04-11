class QueryParser {
  constructor (options) {
    this.options = {
      min_per_page: 10,
      max_per_page: 100
    }
    Object.assign(this.options, options)

    this.options.min_per_page = parseInt(this.options.min_per_page)
    this.options.max_per_page = parseInt(this.options.max_per_page)

    if (isNaN(this.options.min_per_page) || this.options.min_per_page < 1) {
      throw new Error(`You set unacceptable query parse option (min_per_page): ${this.options.min_per_page}`)
    }

    if (isNaN(this.options.max_per_page) || this.options.max_per_page > 10000) {
      throw new Error(`You set unacceptable query parse option (max_per_page): ${this.options.max_per_page}`)
    }
  }

  applyFields (query, fields) {
    // Users should be able to select some fields to show.
    if (fields.length > 0 && fields !== '*') {
      query.select(fields)
    }
  }

  applySorting (query, sort) {
    if (sort.length === 0) {
      return
    }

    sort.forEach(item => {
      query.orderBy(item.field, item.type)
    })
  }

  get (query) {
    return this._parseSections(
      this._getSections(query)
    )
  }

  _getSections (query) {
    if (typeof query !== 'object') {
      throw new Error('You have to send an object to get sections.')
    }

    const sections = {
      q: null,
      page: null,
      per_page: null,
      sort: null,
      fields: null,
      with: null
    }

    for (const key of Object.keys(query)) {
      if (sections[key] === undefined) {
        continue;
      }

      sections[key] = query[key]
    }

    return sections
  }

  _parseSections (sections) {
    sections.page = this._parsePage(sections.page)
    sections.per_page = this._parsePerPage(sections.per_page)
    sections.fields = this._parseFields(sections.fields)
    sections.sort = this._parseSortingOptions(sections.sort)
    return sections
  }

  _parsePage (content) {
    const value = parseInt(content)

    if (isNaN(value)) {
      return 1
    }

    if (value <= 0) {
      return 1
    }

    return value
  }

  _parsePerPage (content) {
    const value = parseInt(content)

    if (isNaN(value)) {
      return this.options.min_per_page
    }

    if (value <= this.options.min_per_page) {
      return this.options.min_per_page
    }

    if (value > this.options.max_per_page) {
      return this.options.max_per_page
    }

    return value
  }

  _parseFields (content) {
    if (!content) {
      return []
    }

    // User should be able to select "all" fields.
    if (content.trim() === '*') {
      return '*'
    }

    const fields = content.split(',')
    const regex = /^[a-zA-Z_.]+$/
    fields.forEach(field => {
      this._shouldBeAcceptableColumn(field)
    })
    return fields
  }

  _parseSortingOptions (content) {
    // If there is not any sorting options, we don't have to return any value
    if (!content) {
      return []
    }

    const result = []
    for (let field of content.split(',')) {
      let type = 'ASC'
      if (field.indexOf('-') === 0) {
        type = 'DESC'
        field = field.substr(1)
      }

      if (field.indexOf('+') === 0) {
        field = field.substr(1)
      }

      this._shouldBeAcceptableColumn(field)
      result.push({
        field,
        type
      })
    }
    return result
  }

  _parseConditions (conditions) {
    if (!Array.isArray(conditions)) {
      throw new Error('An array should be sent to parseConditions() method.')
    }

    return conditions.map(condition => {
      return this._parseCondition(condition)
    })
  }

  _parseCondition (content) {
    if (Array.isArray(content)) {
      return this._parseConditions(content)
    }

    const where = {
      prefix: null,
      field: null,
      condition: '=',
      value: null
    }

    const key = Object.keys(content)[0]
    where.field = key
    where.value = content[key]

    // Sometimes we can have basic OR operations for queries
    if (where.field.indexOf('$or.') === 0) {
      where.prefix = 'or'
      where.field = where.field.replace('$or.', '')
    }

    this._applySpecialCondition(where, '$not', '<>')
    this._applySpecialCondition(where, '$gt', '>')
    this._applySpecialCondition(where, '$gte', '>=')
    this._applySpecialCondition(where, '$lt', '<')
    this._applySpecialCondition(where, '$lte', '<=')
    this._applySpecialCondition(where, '$like', 'LIKE')
    this._applySpecialCondition(where, '$notLike', 'NOT LIKE')
    this._applySpecialCondition(where, '$in', 'In')
    this._applySpecialCondition(where, '$notIn', 'NotIn')
    this._applySpecialCondition(where, '$between', 'Between')
    this._applySpecialCondition(where, '$notBetween', 'NotBetween')
    this._applySpecialCondition(where, '$null', 'Null')
    this._applySpecialCondition(where, '$notNull', 'NotNull')

    if (where.condition === 'In' || where.condition === 'NotIn') {
      where.value = where.value.split(',')
    }

    if (where.condition === 'Between' || where.condition === 'NotBetween') {
      where.value = where.value.split(':')
    }

    if (where.condition === 'Null' || where.condition === 'NotNull') {
      where.value = null
    }

    return where
  }

  _applySpecialCondition (where, structure, condition) {
    structure = `.${structure}`
    if (this._hasSpecialStructure(where.field, structure)) {
      where.field = where.field.replace(structure, '')
      where.condition = condition
    }
  }

  _hasSpecialStructure (field, structure) {
    if (field.indexOf(structure) === -1) {
      return false
    }
    
    if (field.indexOf(structure) === field.length - (structure.length)) {
      return true
    }

    return false
  }

  _shouldBeAcceptableColumn (field) {
    const regex = /^[a-zA-Z_.]+$/
    if (!field.match(regex)) {
      throw new Error(`Unacceptable field name: ${field}`)
    }
}
}

module.exports = QueryParser