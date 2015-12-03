import assert from 'power-assert'
import PackagesJsonGenerator from '../../src/PackagesJsonGenerator'

describe('PackagesJsonGenerator', () => {
  const gen = () => {
    return new PackagesJsonGenerator('test', 
                                     { "aws-sdk": "^2.2.22", "node-serialize": "0.0.4" })
  }

  it('constructor', () => assert(gen() !== null))

  it('packagesObject', () => {
    assert(gen().packagesObject().name === 'test')
    assert(gen().packagesObject().dependencies !== null)
  })

  it('packagesObject', () => assert(typeof gen().serializePackages() === 'string'))
})

