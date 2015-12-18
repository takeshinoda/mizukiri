# README

Mizukiri is a library that chain calls the AWS Lambda.
This is a alpha code.

## requiment
AWS credential file or addtion to config.js.

## Sample code
This code is a AWS Lambda application.
When called, three of the AWS Lambda application is deployed. Tyey are named 'demo-func-1', 'demo-func-2', and 'demo-func-3'.


```es2015
import Mizukiri from 'mizukiri'

exports.handler = (event, context) => {
  new Mizukiri({ 'lodash': '3.10.1' },
               { lambdaConfig:
                 {
                   region: 'us-west-2',
                   role: 'arn:aws:iam::111111111111:role/lambda-test-1',
                   timeout: 300
                 }
               })
    .entry((line) => {
             console.log(line)
             return line + 1
           },
           { name: 'demo-func-1', require: { '_': 'lodash' } })
    .chain((line) => {
             console.log(line)
             return line + 1
           },
           { name: 'demo-func-2' })
    .chain(line => console.log(line) ,
           { name: 'demo-func-3' })
    .deployApplications()
    .exec([1, 2, 3, 4, 5, 6, 7])
    .then((value) => {
      context.succeed()
    })
    .catch(e => context.fail(e))
}
```

## Sample Application
https://github.com/takeshinoda/mizukiri-demo

