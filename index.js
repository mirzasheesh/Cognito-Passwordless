const userModel = require('./database/model');

const { snsSender } = require('./config/config');
const { registerUser, resendOTP, randomSixNums, verifyOTP, authenticateUser } = require('./modules/modules');

exports.loginUser = async (event, context, callback) => {

    const body = JSON.parse(event.body);

    const phoneNumber = body.phoneNumber;

    const user = await userModel.findOne({ where: { phoneNumber: phoneNumber } }).catch(() => { });

    if (!user || !user.verified) {

        let register;

        if (!user) register = await registerUser(phoneNumber).catch(() => { });

        if (user && !user.verified) register = await resendOTP(phoneNumber).catch(() => { });

        if (!user && register === 'OTP_SENT') await userModel.create({ phoneNumber: phoneNumber, verified: false, lastOTP: null, validOTP: false, attemptCounts: 0 }).catch(() => { });

        if (register === 'OTP_SENT') return callback(null, { statusCode: 200, body: JSON.stringify({ message: 'OTP_SENT' }) });

    } else {

        if (user.attemptCounts < 5) {

            const otp = randomSixNums();
            const sent = await snsSender(phoneNumber, otp).catch(() => { });

            if (sent) {

                user.lastOTP = otp;
                user.validOTP = true;
                user.attemptCounts = user.attemptCounts + 1;

                await user.save();

                return callback(null, { statusCode: 200, body: JSON.stringify({ message: 'OTP_SENT' }) });
            }

        } else {

            return callback(null, { statusCode: 400, body: JSON.stringify({ error: 'OTP SENDING LIMIT EXCEED' }) });
        }
    }

    return callback(null, { statusCode: 400, body: JSON.stringify({ error: 'LOGIN FAILED' }) });
}

exports.verifyUser = async (event, context, callback) => {

    const body = JSON.parse(event.body);

    const phoneNumber = body.phoneNumber;
    const otp = body.otp;

    const user = await userModel.findOne({ where: { phoneNumber: phoneNumber } }).catch(() => { });

    if (!user.verified) {

        const verified = await verifyOTP(phoneNumber, otp).catch(() => { });

        if (verified === 'OTP VERIFICATION SUCCESS') {

            const response = await authenticateUser(phoneNumber).catch(() => { });

            if (response === "AUTH FAILED") return callback(null, { statusCode: 400, body: JSON.stringify({ error: 'LOGIN FAILED' }) });

            user.verified = true;

            await user.save().catch(() => { });

            return callback(null, { statusCode: 200, body: JSON.stringify({ user: response }) });
        }

    } else {

        if (user.validOTP && user.lastOTP === Number(otp)) {

            user.validOTP = false;
            user.attemptCounts = 0;

            await user.save();

            const response = await authenticateUser(phoneNumber).catch(() => { });

            if (response === "AUTH FAILED") return callback(null, { statusCode: 400, body: JSON.stringify({ error: 'LOGIN FAILED' }) });

            return callback(null, { statusCode: 200, body: JSON.stringify({ user: response }) });
        }
    }

    return callback(null, { statusCode: 400, body: JSON.stringify({ error: 'INVALID OTP' }) });
}