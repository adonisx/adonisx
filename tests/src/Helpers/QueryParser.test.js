const QueryParser = require(`${src}/Helpers/QueryParser`)
const options = {
  min_per_page: 10,
  max_per_page: 100
}

test('I should be able to override basic options', () => {
  expect(new QueryParser().options.max_per_page).toBe(100)
  expect(new QueryParser({ max_per_page: 25 }).options.max_per_page).toBe(25)
})

test('I should be able to see an error when I try to set unacceptable options', () => {
  expect(() => { new QueryParser({ min_per_page: -10 }) }).toThrow(Error)
  expect(() => { new QueryParser({ max_per_page: 100000 }) }).toThrow(Error)
  expect(() => { new QueryParser({ min_per_page: 'xxx' }) }).toThrow(Error)
  expect(() => { new QueryParser({ max_per_page: 'xxx' }) }).toThrow(Error)
})

test('I should be able to get an error when I send unacceptable query string', () => {
  const parser = new QueryParser()
  expect(() => { parser._getSections(null) }).toThrow(Error)
  expect(() => { parser._getSections(1231) }).toThrow(Error)
  expect(() => { parser._getSections(1231.12) }).toThrow(Error)
  expect(() => { parser._getSections('asdad') }).toThrow(Error)
})

test('I should be able to split queries to different sections', () => {
  const parser = new QueryParser()
  const query = {
    q: '{"salary": {"$gt": 10000}}',
    page: '1',
    per_page: '25',
    sort: '-id',
    fields: 'id,name,surname',
    with: 'posts'
  }
  const result = parser._getSections(query)
  expect(result.q).not.toBe(null)
  expect(result.sort).not.toBe(null)
  expect(result.fields).not.toBe(null)
  expect(result.with).not.toBe(null)
  expect(result.page).not.toBe(null)
  expect(result.per_page).not.toBe(null)
})

test('I should be able to split queries when I don`t send full sections', () => {
  const parser = new QueryParser()
  const result = parser._getSections({})
  
  expect(result.q).toBe(null)
  expect(result.sort).toBe(null)
  expect(result.fields).toBe(null)
  expect(result.with).toBe(null)
  expect(result.page).toBe(null)
  expect(result.per_page).toBe(null)
})

test('I should be able to split queries when I don`t send partly sections', () => {
  const parser = new QueryParser()
  const query = {
    page: '1',
    fields: 'id,name,surname'
  }
  const result = parser._getSections(query)
  
  expect(result.q).toBe(null)
  expect(result.sort).toBe(null)
  expect(result.fields).not.toBe(null)
  expect(result.with).toBe(null)
  expect(result.page).not.toBe(null)
  expect(result.per_page).toBe(null)
})

test('I should be able to parse the page parameter', () => {
  const parser = new QueryParser()
  expect(parser._parsePage('1')).toBe(1)
  expect(parser._parsePage('12')).toBe(12)
  expect(parser._parsePage('123')).toBe(123)
  expect(parser._parsePage('ass')).toBe(1)
  expect(parser._parsePage('-12')).toBe(1)
  expect(parser._parsePage(16)).toBe(16)
  expect(parser._parsePage(16.21)).toBe(16)
  expect(parser._parsePage('16.99')).toBe(16)
})

test('I should be able to parse the per_page parameter', () => {
  const parser = new QueryParser(options)
  expect(parser._parsePerPage('10')).toBe(10)
  expect(parser._parsePerPage('12')).toBe(12)
  expect(parser._parsePerPage('as')).toBe(10)
  expect(parser._parsePerPage('5')).toBe(10)
  expect(parser._parsePerPage(100)).toBe(100)
  expect(parser._parsePerPage(110)).toBe(100)
})

test('I should be able to parse the fields', () => {
  const parser = new QueryParser()
  let result =  parser._parseFields('id,email')
  expect(result.length).toBe(2)
  expect(result[0]).toBe('id')
  expect(result[1]).toBe('email')

  result =  parser._parseFields('id')
  expect(result.length).toBe(1)
  expect(result[0]).toBe('id')
})

test('I should be able to get an error while parsing unacceptable column name', () => {
  const parser = new QueryParser()
  // Acceptable exceptions
  expect(parser._parseFields('full_name').length).toBe(1)
  expect(parser._parseFields('id,users.name').length).toBe(2)
  expect(parser._parseFields('*')).toBe('*')
  // Unacceptable error testing
  expect(() => { parser._parseFields('id,email|sample') }).toThrow(Error)
  expect(() => { parser._parseFields('id,email?sample') }).toThrow(Error)
  expect(() => { parser._parseFields('id,full-name') }).toThrow(Error)
})

test('I should be able to parsing sorting options', () => {
  const parser = new QueryParser()
  let result = parser._parseSortingOptions('id,-name,+surname')
  expect(result.length).toBe(3)
  expect(result[0].field).toBe('id')
  expect(result[0].type).toBe('ASC')
  expect(result[1].field).toBe('name')
  expect(result[1].type).toBe('DESC')
  expect(result[2].field).toBe('surname')
  expect(result[2].type).toBe('ASC')
})

test('I should be able to get an error while parsing unacceptable column in sorting', () => {
  const parser = new QueryParser()
  expect(parser._parseSortingOptions('id,full_name')[1].field).toBe('full_name')
  expect(() => { parser._parseSortingOptions('id,full-name') }).toThrow(Error)
  expect(() => { parser._parseSortingOptions('id,full+name') }).toThrow(Error)
  expect(() => { parser._parseSortingOptions('id,fullname12') }).toThrow(Error) 
})

test('I should be able to parse all sections', () => {
  const parser = new QueryParser(options)
  const sections = {
    q: '{"id": 10}',
    page: '1',
    per_page: '25',
    sort: 'id,-name',
    fields: 'id,name,surname',
    with: 'role'
  }
  const result = parser._parseSections(sections)

  // Pagination options
  expect(result.page).toBe(1)
  expect(result.per_page).toBe(25)

  // Field selections
  expect(result.fields.length).toBe(3)
  expect(result.fields[0]).toBe('id')
  expect(result.fields[1]).toBe('name')
  expect(result.fields[2]).toBe('surname')

  // Sorting selections
  expect(result.sort.length).toBe(2)
  expect(result.sort[0].field).toBe('id')
  expect(result.sort[0].type).toBe('ASC')
  expect(result.sort[1].field).toBe('name')
  expect(result.sort[1].type).toBe('DESC')
})

test('I should be able to get query parsing result', () => {
  const parser = new QueryParser()
  const result = parser.get({})
  expect(result.page).toBe(1)
  expect(result.per_page).toBe(10)
})