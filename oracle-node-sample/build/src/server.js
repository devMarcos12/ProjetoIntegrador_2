"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = __importDefault(require("./connection"));
const app = (0, express_1.default)();
const port = 3000;
const routes = (0, express_1.Router)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
routes.get('/', (req, res) => {
    res.status(200).send("Funcionando...");
});
routes.get('/test', async (req, res) => {
    let connection;
    try {
        // Get the connection from database class
        connection = await connection_1.default.connect();
        const result = await connection.execute(`SELECT name FROM alunos`);
        res.status(200).json(result.rows);
        console.log(result.rows);
    }
    catch (err) {
        console.error('Erro ao processar a consulta:', err);
        res.status(500).send('Erro ao conectar ao banco de dados.');
    }
    finally {
        if (connection) {
            await connection_1.default.close(connection);
        }
    }
});
routes.post('/register', async (req, res) => {
    console.log('Recebendo requisição no endpoint /register');
    const { name, email, telefone, cpf, data_nasc, endereco, peso, altura } = req.body;
    let connection;
    console.log('Dados recebidos(Json):', req.body);
    try {
        connection = await connection_1.default.connect();
        console.log('Conexão com o banco de dados estabelecida');
        const insertQuery = `
      INSERT INTO alunos (name, email, telefone, cpf, data_nasc, endereco, peso, altura)
      VALUES (:name, :email, :telefone, :cpf, TO_DATE(:data_nasc, 'YYYY-MM-DD'), :endereco, :peso, :altura)
    `;
        await connection.execute(insertQuery, [name, email, telefone, cpf, data_nasc, endereco, peso, altura]);
        await connection.commit();
        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    }
    catch (err) {
        console.error('Erro ao cadastrar o usuário:', err);
        res.status(500).json({ message: 'Erro ao cadastrar o usuário.' });
    }
    finally {
        if (connection) {
            await connection_1.default.close(connection);
            console.log('Conexão com o banco de dados fechada');
        }
    }
});
routes.post('/login', async (req, res) => {
    console.log('Recebendo requisição no endpoint /login');
    const { name } = req.body;
    let connection;
    console.log('Dados recebidos (JSON):', req.body);
    try {
        connection = await connection_1.default.connect();
        console.log('Conexão com o banco de dados estabelecida');
        const query = `SELECT name FROM alunos WHERE LOWER(name) = :name`;
        const result = await connection.execute(query, [name.toLowerCase()]);
        const rows = result.rows; // Faz o casting para any[][]
        if (rows && rows.length > 0) {
            console.log('Usuário encontrado:', rows[0][0]);
            res.status(200).json({ message: 'Login bem-sucedido', user: rows[0][0] });
        }
        else {
            console.log('Usuário não encontrado');
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    }
    catch (err) {
        console.error('Erro ao verificar o login:', err);
        res.status(500).send('Erro ao processar o login.');
    }
    finally {
        if (connection) {
            await connection_1.default.close(connection);
            console.log('Conexão com o banco de dados fechada');
        }
    }
});
app.use(routes);
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
