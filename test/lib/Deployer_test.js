import fs     from 'fs'
import del    from 'del'
import child_process from 'child_process'

import assert from 'power-assert'
import aws from 'aws-sdk'

import Mizukiri from '../../src/Mizukiri'
import Deployer from '../../src/Deployer'

if (!process.env.TEST_ROLE) {
  process.env.TEST_ROLE = 'arn:aws:iam::040621507411:role/lambda-test-1'
}

describe('Deployer', () => {
  const dep = () => {
    return new Deployer(
      './tmp/test-func-21', 
      { lambdaName: 'test-func-21',
        options: {
          lambdaConfig: {
            region: 'us-west-2',
            role: process.env.TEST_ROLE
          }
        }
      })
  }

  beforeEach((done) => {
    del.sync('./tmp/test-func*')
    new Promise((_done, _err) => {
      const lambda = new aws.Lambda({ region: 'us-west-20' })
      lambda.deleteFunction({ FunctionName: 'test-func-21' }, (e, data) => _done())
    })
    .then(() => {
      const m = new Mizukiri({ 'lodash': '3.10.1' })
      return m
        .entry(line => { console.log(line) },
               { name: 'test-func-20' })
        .chain(line => { console.log(line) },
               { name: 'test-func-21' })
        .buildChainApplications()
    })
    .then(v => done())
    .catch(e => done(e))
  })

  it('writeZipFile', (done) => {
    dep()
      .writeZipFile()
      .then(() => {
        assert(fs.existsSync('./tmp/test-func-21.zip'))
        done()
      })
      .catch(e => done(e))
  })

  it('deploy', (done) => {
    dep()
      .deploy()
      .then(() => { 
        assert(fs.existsSync('./tmp/test-func-21.zip'))
        const lambda = new aws.Lambda({ region: 'us-west-2' })
        lambda 
          .listFunctions({}, (err, data) => {
            if (err) { throw err }
            assert(data.Functions.find(f => f.FunctionName === 'test-func-21') !== undefined)
            done()
          })
      })
      .catch(e => done(e))
  })
})

