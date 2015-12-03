import fs       from 'fs'

import archiver  from 'archiver'
import Promise   from 'bluebird'
import awsLambda from 'node-aws-lambda'

import Mizukiri from './Mizukiri'

export default class Deployer {
  constructor(appPath, lambdaParams) {
    this.appPath = appPath
    this.lambdaParams = lambdaParams
  }

  get zipPath() {
    return `./tmp/${this.lambdaParams.lambdaName}.zip`
  }

  lambdaConfig(override = {}) {
    const defaultConfig =  {
      // accessKeyId: null,      // optional
      // secretAccessKey: null,  // optional
      // profile: null,          // optional for loading AWS credientail from custom profile
      region: 'ap-northeast-1',
      handler: 'index.handler',
      role: null, 
      functionName: this.lambdaParams.lambdaName,
      timeout: 60,
      memorySize: 256,
      runtime: 'nodejs'
    }
    return Object.assign(defaultConfig, override)
  }

  writeZipFile() {
    if (!fs.existsSync('./tmp')) { fs.mkdirSync('./tmp') }
    return new Promise((done, err) => {
      const archive = archiver('zip', {})
      const fd = fs.createWriteStream(this.zipPath)

      fd.on('close', () => done())
        .on('error', (e) => err(e))

      archive.directory(this.appPath, '.')
      archive.pipe(fd)
      archive.finalize()
    })
  }

  uploadApplication() {
    return new Promise((done, err) => {
      awsLambda.deploy(this.zipPath, 
                       this.lambdaConfig(this.lambdaParams.options.lambdaConfig), 
                       (e) => { 
                         if (e) { err(e) }
                         else { done() }
                       })
    })
  }

  deploy() {
    return this.writeZipFile().then(() => this.uploadApplication())
  }
}

