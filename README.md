# Custom Authorization Flow Functions

## DefineAuthChallenge

`src/lambda/DefineAuthChallenge/index.handler`

## CreateAuthChallenge

`src/lambda/CreateAuthChallenge/index.handler`

## VerifyAuthChallenge

`src/lambda/VerifyAuthChallenge/index.handler`

# Prerequisites
* NODE 8.10. ( Running on the Lambda Node.js 8.10 runtime )
* [Serverless Framework](https://serverless.com/)


# Setup
`yarn install`

# Unit Tests

`yarn test`

# Configuration
The lambda functions are built per environment.  Environment variables are used to ensure proper configuration.  A single configuration file is used to define values for each environment:  *config/serverless.config.yml*

Please see *config/example.config.yml*.

#Building/Deployment

`serverless --env=ENV_EXAMPLE deploy`

Where *ENV_EXAMPLE* is found in config/serverless.config.yml

# Questions

If you have any questions regarding the contents of this repository, please email the Office of Systems Integration at FOSS@osi.ca.gov.
