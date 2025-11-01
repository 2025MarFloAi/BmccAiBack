require("dotenv").config();
const { Sequelize } = require("sequelize");
const pg = require("pg");

const dbName = "bmccAI";

const db = new Sequelize(
  process.env.DATABASE_URL,
  {
    logging: false,
  }
);

module.exports = db;
