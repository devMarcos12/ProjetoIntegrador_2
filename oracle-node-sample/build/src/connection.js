"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = require("dotenv");
// Export the env variables
(0, dotenv_1.config)();
class DataBase {
    #configs;
    constructor() {
        this.#configs = {
            user: process.env.USER,
            password: process.env.PASSWORD,
            connectString: process.env.CONNECTSTRING,
        };
    }
    async connect() {
        try {
            const connection = await oracledb_1.default.getConnection(this.#configs);
            console.log('Conexão estabelecida com sucesso.');
            return connection;
        }
        catch (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            throw err;
        }
    }
    async close(connection) {
        try {
            await connection.close();
            console.log('Conexão fechada com sucesso.');
        }
        catch (err) {
            console.error('Erro ao fechar a conexão:', err);
        }
    }
}
exports.default = new DataBase();
