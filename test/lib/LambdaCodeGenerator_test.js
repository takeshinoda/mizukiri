import assert from 'power-assert'
import LambdaCodeGenerator from '../../src/LambdaCodeGenerator'

describe('LambdaCodeGenerator', () => {
  const gen = () => {
    return new LambdaCodeGenerator(
      { aa: 'bb' }, 
      (event, context) => {
        console.log(`value1 =${event.key1}`) 
        context.succeed(event.key1);
      }, 
      'lambda-name',
      'next-lambda',
      { lambdaConfig: { region: 'ap-northeast-1' } })
  }

  it('constructor', () => assert(gen() !== null))
  it('loadTtemplate', () => assert(typeof gen().loadTemplate() === 'string'))
  it('serializeLambda', () => assert(typeof gen().serializeLambda() === 'string'))
})

