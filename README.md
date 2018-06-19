# Custom Authorization Flow Functions

## DefineAuthChallenge

`src/lambda/DefineAuthChallenge/index.handler`

## CreateAuthChallenge

`src/lambda/CreateAuthChallenge/index.handler`

## VerifyAuthChallenge

`src/lambda/VerifyAuthChallenge/index.handler`

# Prerequisites
* NODE 6.10. ( Running on the Lambda Node.js 6.10 runtime )


#Setup
`npm install`

# Running the Lambda Functions

Please see [AWS SAM](https://aws.amazon.com/about-aws/whats-new/2017/08/introducing-aws-sam-local-a-cli-tool-to-test-aws-lambda-functions-locally/) for information on running the Lambda Functions locally.

#Unit Tests

`npm test`

#Building/Deployment

`npm run build`

This will add each function into `dist`.  You can then copy them into AWS Lambda.


