const default_packaeges = { 'node-serialize': '0.0.4',
                            'aws-sdk': '^2.2.23',
                            'bluebird': '^3.1.1' }

export default class PackagesJsonGenerator {
  constructor(lambdaName, packages, requires) {
    this.lambdaName = lambdaName
    this.packages = Object.assign(default_packaeges, packages)
  }

  template() {
    return { }
  }

  packagesObject() {
    const json = this.template()
    json.dependencies = this.packages
    json.name = this.lambdaName
    return json
  }

  serializePackages() {
    return JSON.stringify(this.packagesObject()) + "\n"
  }
}

