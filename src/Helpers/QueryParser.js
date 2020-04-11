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

  _shouldBeAcceptableColumn (field) {
    const regex = /^[a-zA-Z_.]+$/
    if (!field.match(regex)) {
      throw new Error(`Unacceptable field name: ${field}`)
    }
}
}

module.exports = QueryParser