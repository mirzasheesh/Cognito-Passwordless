require('dotenv').config();

const { cognitoUser, authUser, userPool } = require('../config/config');

const registerUser = (phoneNumber) => {

    return new Promise((resolve, reject) => {

        let attributeList = [];
        let key = process.env.defaultKey;

        userPool.signUp(phoneNumber, key, attributeList, null, (error, result) => {

            if (error) return reject("ERROR IN REGISTERING USER");
            return resolve("OTP_SENT");
        });
    });
}

const resendOTP = (phoneNumber) => {

    const user = cognitoUser(phoneNumber);

    return new Promise((resolve, reject) => {

        user.resendConfirmationCode((error, result) => {

            if (error) return reject('ERROR IN SENDIND OTP');
            return resolve("OTP_SENT");
        });
    });
}

const verifyOTP = (phoneNumber, otp) => {

    const user = cognitoUser(phoneNumber);

    return new Promise((resolve, reject) => {

        user.confirmRegistration(otp, true, (error, result) => {

            if (error) return reject('OTP VERIFICATION FAILED');
            return resolve('OTP VERIFICATION SUCCESS');
        });
    });
}

const authenticateUser = (phoneNumber) => {

    let key = process.env.defaultKey;

    return new Promise((resolve, reject) => {

        const user = cognitoUser(phoneNumber);
        const auth = authUser(phoneNumber, key);

        user.authenticateUser(auth, {

            onSuccess: (result) => {

                return resolve(result);
            },

            onFailure: () => {

                return reject("AUTH FAILED");
            },
        });
    });
}

function randomSixNums() {

    return Math.floor((100000 + Math.random() * 900000));
}

module.exports = { registerUser, resendOTP, randomSixNums, verifyOTP, authenticateUser };