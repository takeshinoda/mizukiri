import util from 'util'
import serialize from 'node-serialize'
import ejs from 'ejs'
import fs  from 'fs'

const defaultRequires = { 'aws': 'aws-sdk', 'Promise': 'bluebird' }

export default class LambdaCodeGenerator {
  constructor(lambdaEnvironment, lambdaEntry, lambdaName, nextLambdaName, options) {
    this.lambdaEnvironment = lambdaEnvironment
    this.lambdaEntry = lambdaEntry
    this.lambdaName = lambdaName
    this.nextLambdaName = nextLambdaName
    this.options = options
  }

  get requires() {
    const requires = this.options.requires || {}
    const baseRequires = util._extend({}, defaultRequires) // clone
    return Object.assign(baseRequires, requires)
  }

  loadTemplate() {
    return fs.readFileSync(`${__dirname}/../lib/lambda_template/index.js.ejs`).toString()
  }

  serializeLambda() {
     const serializedEnvironment = serialize.serialize(this.lambdaEnvironment)
     const serializedLambdaEntry = this.lambdaEntry.toString()
     const options = Object.assign({
               serializedEnvironment,
               serializedLambdaEntry,
               requireVars: this.requires,
               lambdaName: this.lambdaName,
               nextLambdaName: this.nextLambdaName,
               region: this.options.lambdaConfig.region
             }, this.options)
     return ejs.render(this.loadTemplate(), options)
  }
}

