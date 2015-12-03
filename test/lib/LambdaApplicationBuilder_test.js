import assert from 'power-assert'
import fs     from 'fs'
import del    from 'del'
import LambdaApplicationBuilder from '../../src/LambdaApplicationBuilder'

describe('LambdaApplicationBuilder', () => {
  const builder = () => {
    return new LambdaApplicationBuilder
      .createBuilder({ func: () => { 'hoge' },
                     options: {
                       lambdaConfig: { region: 'ap-northeast-1' },
                       packages: { 'lodash': '3.10.1' },
                       requires: { _: 'lodash' },
                       binding: { bbb: 1, ccc: (ddd) => alert(ddd) } },
                     lambdaName: 'test-func-0' })
  }

  it('constructor', () => assert(builder() !== null))

  it('generateCodeFiles', () => {
    del.sync('./tmp/test-func*')
    builder().generateCodeFiles()
    assert(fs.existsSync('./tmp/test-func-0/package.json'))
    assert(fs.existsSync('./tmp/test-func-0/index.js'))
  })
})

