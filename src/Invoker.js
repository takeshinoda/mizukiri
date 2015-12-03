import aws    from 'aws-sdk'

export default class Invoker {
  constructor(lambdaParams, payload) {
    this.lambdaParams = lambdaParams
    this.functionName = lambdaParams.lambdaName
    this.payload = payload
  }

  invoke() {
    return new Promise((done, reject) => {
      const lambda = new aws.Lambda({ region: this.lambdaParams.options.lambdaConfig.region })
      const params = { FunctionName: this.functionName,
                       InvocationType: 'Event',
                       Payload: JSON.stringify({ data: this.payload })
      }
                         
      lambda.invoke(params, (err, result) => {
        if (err) {
          console.log(`Failed invocation ${params.FunctionName}`)
          console.log(err, err.stack)
          reject(err)
        } else if (result.FunctionError) {
          console.log(`Function error: ${params.FunctionName}`) 
          console.log(result.FunctionError)
          reject(result.FunctionError)
          return
        }
        done(result)
      })
    })
  }
}

