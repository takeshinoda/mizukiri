import assert from 'power-assert'
import fs     from 'fs'
import del    from 'del'
import Mizukiri from '../../src/Mizukiri'

if (!process.env.TEST_ROLE) {
  process.env.TEST_ROLE = 'arn:aws:iam::040621507411:role/lambda-test-1'
}

describe('Mizukiri', () => {
  beforeEach(() => del.sync('./tmp/test-func*'))

  const mizukiri = () => {
    return new Mizukiri({ 'lodash': '3.10.1' }, 
                        { lambdaConfig: 
                          { 
                            region: 'us-west-2', 
                            role: process.env.TEST_ROLE
                          } 
                        })
  }

  it('constructor', () => assert(mizukiri() !== null))

  it('entry', () => {
    const m = mizukiri()
      .entry((line) => console.log(line),
             { name: 'test-func', requires: { lodash: 'lodash' } }) 
    assert(m !== null)
    assert(m.entryPoint !== null)
  })

  it('chain', () => {
    const m = mizukiri()
      .entry(line => console.log(line),
             { name: 'test-func-1', requires: { lodash: 'lodash' } }) 
      .chain(line => console.log(line),
             { name: 'test-func-2', requires: { lodash: 'lodash' } }) 
    assert(m !== null)
    assert(m.entryPoint !== null)
    assert(m.chains.length === 1)
  })

  it('defaultOptions', () => {
    const m = new Mizukiri({ 'lodash': '3.10.1', async: '1.5.0' }, 
                           { requires: { _: 'lodash' } })
      .entry(line => console.log(line),
             { name: 'test-func-3' }) 
      .chain(line => console.log(line),
             { name: 'test-func-4' })
      .chain(line => console.log(line),
             { name: 'test-func-5', requires: { async: 'async' } })
    assert(m.chains[1].options.name       === 'test-func-4')
    assert(m.chains[1].options.requires._ === 'lodash')
    assert(m.chains[0].options.requires._ === undefined)
    assert(m.chains[0].options.requires.async === 'async')
  })

  it('buildChainApplications', (done) => {
    mizukiri()
      .entry(line => console.log(line),
             { name: 'test-func-6', requires: { lodash: 'lodash' } }) 
      .chain(line => console.log(line),
             { name: 'test-func-7', requires: { lodash: 'lodash' } }) 
      .chain(line => console.log(line),
             { name: 'test-func-8', requires: { lodash: 'lodash' } })
      .buildChainApplications()
      .then(() => {
        assert(fs.existsSync('./tmp/test-func-6/package.json'))
        assert(fs.existsSync('./tmp/test-func-6/index.js'))
        assert(fs.existsSync('./tmp/test-func-6/node_modules'))
        assert(fs.existsSync('./tmp/test-func-7/package.json'))
        assert(fs.existsSync('./tmp/test-func-7/index.js'))
        assert(fs.existsSync('./tmp/test-func-7/node_modules'))
        assert(fs.existsSync('./tmp/test-func-8/package.json'))
        assert(fs.existsSync('./tmp/test-func-8/index.js'))
        assert(fs.existsSync('./tmp/test-func-8/node_modules'))
        done()
      })
      .catch(done)
  })

  it('invoke exec through promise', (done) => {
    mizukiri()
      .entry(line => 'hoge',
             { name: 'test-func-9', requires: { hoge: 'lodash' } }) 
      .chain(line => 'exec',
             { name: 'test-func-10', requires: { _: 'lodash' } }) 
      .deployApplications()
      .exec(['aaa'])
      .then((value) => {
        assert(value.StatusCode === 202)
        done()
      })
      .catch(e => { done(e) })
  })

  it('invoke exec', (done) => {
    mizukiri()
      .entry(line => 'hoge',
             { name: 'test-func-11', requires: { hoge: 'lodash' } }) 
      .deployApplications()
      .then(() => {
        mizukiri()
          .entry(line => 'execcc',
                 { name: 'test-func-11', requires: { hoge: 'lodash' } }) 
          .exec(['bbb'])
          .then((value) => {
            assert(value.StatusCode === 202)
            done()
          })
          .catch(e => done(e))
      })
      .catch(e => done(e))
  })

  it('invoke exec with chain', (done) => {
    mizukiri()
      .entry((line) => {
               console.log(line)
               return line + 1
             },
             { name: 'test-func-12' }) 
      .chain((line) => {
               console.log(line)
               return line + 1
             },
             { name: 'test-func-13' }) 
      .chain(line => console.log(line) ,
             { name: 'test-func-14' }) 
      .deployApplications()
      .exec([1, 2, 3, 4, 5, 6, 7])
      .then((value) => {
        assert(value.StatusCode === 202)
        done()
      })
      .catch(e => done(e))
  })
})

