require('dotenv').config();

/* AWS SNS */

const aws = require('aws-sdk');

const sns = new aws.SNS({ region: process.env.AWSregion, accessKeyId: process.env.AccessKey, secretAccessKey: process.env.SecretKey });

const snsSender = (phone, text) => sns.publish({ PhoneNumber: phone, Message: `login code is ${text}` }).promise();

/* AWS Cognito */

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = { UserPoolId: process.env.PoolID, ClientId: process.env.ClientID };

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const cognitoUser = (username) => new AmazonCognitoIdentity.CognitoUser({ Username: username, Pool: userPool });

const authUser = (username, password) => new AmazonCognitoIdentity.AuthenticationDetails({ Username: username, Password: password });

/* */

module.exports = { snsSender, cognitoUser, authUser, userPool };