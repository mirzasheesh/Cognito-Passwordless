require('dotenv').config();

const Sequelize = require('sequelize');

const connection = new Sequelize({
    dialect: "mysql",
    database: process.env.databaseNAME,
    host: process.env.databaseHOST,
    port: process.env.databasePORT,
    username: process.env.databaseUSER,
    password: process.env.databasePASS,
    logging: false,
});

const table = "users";

const schema = {
    userID: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phoneNumber: {
        type: Sequelize.DataTypes.STRING,
        unique: true,
    },
    verified: {
        type: Sequelize.DataTypes.BOOLEAN,
    },
    lastOTP: {
        type: Sequelize.DataTypes.INTEGER,
    },
    validOTP: {
        type: Sequelize.DataTypes.BOOLEAN,
    },
    attemptCounts: {
        type: Sequelize.DataTypes.INTEGER,
    }
};

const userModel = connection.define(table, schema, { timestamps: true });

userModel.sync({ force: false }).catch((e) => (`Error in sync() table: ${table}`));

module.exports = userModel;