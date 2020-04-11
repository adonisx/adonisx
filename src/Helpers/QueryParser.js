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

  _getSections (query) {
    if (typeof query !== 'string') {
      throw new Error('You have to send a string to get query sections')
    }

    const sections = {
      q: [],
      page: null,
      per_page: null,
      sort: [],
      fields: [],
      with: []
    }

    for (const row of query.split('&')) {
      const [ key, value ] = row.split('=')

      if (sections[key] === undefined) {
        continue;
      }

      if (Array.isArray(sections[key])) {
        sections[key].push(value)
      } else {
        sections[key] = value
      }
    }

    return sections
  }

  _parseSections (sections) {
    sections.page = this._parsePage(sections.page)
    sections.per_page = this._parsePerPage(sections.per_page)
    return sections
  }

  _parsePage (content) {
    const value = parseInt(content)

    if (isNaN(value)) {
      return null
    }

    if (value <= 0) {
      return null
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
}

module.exports = QueryParser