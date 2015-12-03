import util from 'util'
import Promise from 'bluebird'

import LambdaApplicationBuilder from './LambdaApplicationBuilder'
import Deployer from './Deployer'
import Invoker  from './Invoker'

const defaultOptions = { lambdaConfig: { region: 'ap-northeast-1' } }

export default class Mizukiri {
  constructor(packages = {}, options = {}) {
    this.entryPoint = null
    this.chains = []
    this.defaultPackages = packages
    this.defaultOptions = Object.assign(defaultOptions, options || {})
  }

  createLambdaParams(lambdaEntry, overrideOptions) {
    const options = this.mergeOptions(overrideOptions)
    const lambdaParams = { func: lambdaEntry, options, packages: this.defaultPackages }
    lambdaParams.lambdaName = Mizukiri.lambdaName(lambdaParams)
    return lambdaParams
  }

  entry(lambdaEntry, overrideOptions = null) {
    this.entryPoint = this.createLambdaParams(lambdaEntry, overrideOptions)
    return this
  }

  chain(lambdaEntry, overrideOptions = null) {
    this.chains.unshift(this.createLambdaParams(lambdaEntry, overrideOptions))
    return this
  }

  mergeOptions(overrideOptions) {
    const extend = util._extend
    const defaultOptions = extend({}, this.defaultOptions) // clone
    return Object.assign(defaultOptions, overrideOptions || {})
  }

  static lambdaName(lambdaParams) {
    if (lambdaParams.options.name) {
      return lambdaParams.options.name
    }
    throw 'Nothing Lambda name'
  }

  static builder(lambdaParams) {
    const params = lambdaParams
    return new LambdaApplicationBuilder.createBuilder(params)
  }

  static build(lambdaParams) {
    return Mizukiri.builder(lambdaParams).build()
  }

  resolvCallChainName() {
    let beforeLambdaName = null
    this.chains.forEach((lambdaParams) => {
      lambdaParams.nextLambdaName = beforeLambdaName
      beforeLambdaName = Mizukiri.lambdaName(lambdaParams)
    })
    this.entryPoint.nextLambdaName = beforeLambdaName
    return this
  }

  buildChainApplications() {
    this.resolvCallChainName()
    const apps = this
                   .chains
                   .map(lambdaParams => Mizukiri.build(lambdaParams))
    apps.unshift(Mizukiri.build(this.entryPoint))
    return Promise.all(apps)
  }

  deployChainApplications() {
    const deployers = this
      .chains
      .map((lambdaParams) => {
        return new Deployer(LambdaApplicationBuilder.genAppPath(lambdaParams.lambdaName),
                            lambdaParams).deploy()
      })
    deployers.unshift(
      new Deployer(LambdaApplicationBuilder.genAppPath(this.entryPoint.lambdaName),
                   this.entryPoint).deploy()
    )
    return Promise.all(deployers)
  }

  deployApplications() {
    const result = this.buildChainApplications()
      .catch((reson) => {
          console.log(`Deploy faild: ${reson}`)
          throw reson
       })
       .then(() => this.deployChainApplications())
    result.exec = (payload) => result.then(() => this.exec(payload))
    return result
  }

  exec(payload) {
    this.resolvCallChainName()
    const invoker = new Invoker(this.entryPoint, payload)
    return invoker.invoke()
  }
}

