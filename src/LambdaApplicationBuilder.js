import fs  from 'fs'
import del from 'del'

import npm from 'npm'
import Promise   from 'bluebird'
import serialize from 'node-serialize'

import LambdaCodeGenerator   from './LambdaCodeGenerator'
import PackagesJsonGenerator from './PackagesJsonGenerator'

export default class LambdaApplicationBuilder {
  constructor(lambdaCodeGennerator, packagesJsonGenerator) {
    this.lambdaCodeGennerator = lambdaCodeGennerator
    this.packagesJsonGenerator = packagesJsonGenerator
  }

  static createBuilder(lambdaParams) {
    const lambdaCodeGen = new LambdaCodeGenerator(lambdaParams.options.binding,
                                                  lambdaParams.func,
                                                  lambdaParams.lambdaName,
                                                  lambdaParams.nextLambdaName,
                                                  lambdaParams.options)
    const packagesGen = new PackagesJsonGenerator(lambdaParams.lambdaName,
                                                  lambdaParams.packages)
    return new LambdaApplicationBuilder(lambdaCodeGen, packagesGen)
  }

  generateCodeFiles() {
    this.deleteApplicationDir()
    this.makeApplicationDir()
    this.writeFile(`${this.appPath()}/package.json`,
                    this.packagesJsonGenerator.serializePackages())
    this.writeFile(`${this.appPath()}/index.js`,
                    this.lambdaCodeGennerator.serializeLambda())
  }

  installPackages(done, error) {
    npm.load({ production: true, level: 'error' }, (err) => {
      if (err) { return error(err) }
      npm.commands.install(this.appPath(), [], (_err, data) => {
        if (_err) { error(_err) }
        else      { done(data) }
      })
    })
  }

  build() {
    return new Promise((done, err) => {
      this.generateCodeFiles()
      this.installPackages(done, err)
    })
  }

  writeFile(filename, code) {
    fs.writeFileSync(filename, code)
  }

  deleteApplicationDir() {
    del.sync(this.appPath())
  }

  makeApplicationDir() {
    fs.mkdirSync(this.appPath())
  }

  static genAppPath(lambdaName) {
    return `/tmp/${lambdaName}`
  }

  appPath() {
    return LambdaApplicationBuilder.genAppPath(this.packagesJsonGenerator.lambdaName)
  }
}

