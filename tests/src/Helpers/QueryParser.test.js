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
  expect(() => { parser._getSections({}) }).toThrow(Error)
})

test('I should be able to split queries to different sections', () => {
  const parser = new QueryParser()
  const result = parser._getSections('q={"id": 10}&page=1&per_page=25&sort=-id&fields=id,name,surname&with=role')
  
  expect(result.q.length).toBe(1)
  expect(result.sort.length).toBe(1)
  expect(result.fields.length).toBe(1)
  expect(result.with.length).toBe(1)
  expect(result.page).not.toBe(null)
  expect(result.per_page).not.toBe(null)
})

test('I should be able to split queries when I don`t send full sections', () => {
  const parser = new QueryParser()
  const result = parser._getSections('')
  
  expect(result.q.length).toBe(0)
  expect(result.sort.length).toBe(0)
  expect(result.fields.length).toBe(0)
  expect(result.with.length).toBe(0)
  expect(result.page).toBe(null)
  expect(result.per_page).toBe(null)
})

test('I should be able to split queries when I don`t send partly sections', () => {
  const parser = new QueryParser()
  const result = parser._getSections('page=1&fields=id,name')
  
  expect(result.q.length).toBe(0)
  expect(result.sort.length).toBe(0)
  expect(result.fields.length).toBe(1)
  expect(result.with.length).toBe(0)
  expect(result.page).not.toBe(null)
  expect(result.per_page).toBe(null)
})

test('I should be able to parse the page parameter', () => {
  const parser = new QueryParser()
  expect(parser._parsePage('1')).toBe(1)
  expect(parser._parsePage('12')).toBe(12)
  expect(parser._parsePage('123')).toBe(123)
  expect(parser._parsePage('ass')).toBe(null)
  expect(parser._parsePage('-12')).toBe(null)
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

test('I should be able to parse all sections', () => {
  const parser = new QueryParser(options)
  const sections = {
    q: [ '{"id": 10}' ],
    page: '1',
    per_page: '25',
    sort: [ '-id' ],
    fields: [ 'id,name,surname' ],
    with: [ 'role' ]
  }
  const result = parser._parseSections(sections)
  expect(result.page).toBe(1)
  expect(result.per_page).toBe(25)
})