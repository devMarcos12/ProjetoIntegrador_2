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
    const { cpf } = req.body;
    let connection;
    console.debug("CPF recebido: ", cpf);
    try {
        connection = await connection_1.default.connect();
        const query = `SELECT cpf FROM alunos WHERE cpf = :cpf`;
        const result = await connection.execute(query, [cpf]);
        const rows = result.rows;
        if (rows && rows.length > 0) {
            res.status(200).json({ message: 'Login bem-sucedido', user: rows[0][0] });
        }
        else {
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
        }
    }
});
routes.post('/getStudentInfo', async (req, res) => {
    const { cpf } = req.body;
    let connection;
    try {
        connection = await connection_1.default.connect();
        const query = `
      SELECT 
          a.id AS aluno_id,
          a.name AS aluno_nome,
          a.cpf AS aluno_cpf,
          NVL(SUM(r.duracao), 0) AS horas_treinadas,
          CASE
              WHEN NVL(SUM(r.duracao), 0) <= 5 THEN 'Iniciante'
              WHEN NVL(SUM(r.duracao), 0) BETWEEN 6 AND 10 THEN 'Intermediário'
              WHEN NVL(SUM(r.duracao), 0) BETWEEN 11 AND 20 THEN 'Avançado'
              WHEN NVL(SUM(r.duracao), 0) > 20 THEN 'Extremamente Avançado'
              ELSE 'Sem classificação'
          END AS classificacao
      FROM 
          alunos a
      LEFT JOIN 
          registro_treino r ON a.cpf = r.fk_aluno_cpf
          AND r.horario_entrada >= TRUNC(SYSDATE) - 7
      WHERE 
          a.cpf = :cpf
      GROUP BY 
          a.id, a.name, a.cpf
    `;
        const result = await connection.execute(query, [cpf]);
        const rows = result.rows;
        if (rows && rows.length > 0) {
            const [aluno_id, aluno_nome, aluno_cpf, horas_treinadas, classificacao] = rows[0];
            res.status(200).json({
                aluno_id,
                aluno_nome,
                aluno_cpf,
                horas_treinadas,
                classificacao
            });
        }
        else {
            res.status(404).json({ message: 'Aluno não encontrado' });
        }
    }
    catch (err) {
        console.error('Erro ao buscar informações do aluno:', err);
        res.status(500).send('Erro ao processar a solicitação.');
    }
    finally {
        if (connection) {
            await connection_1.default.close(connection);
        }
    }
});
routes.get('/last7days/:cpf', async (req, res) => {
    const { cpf } = req.params;
    let connection;
    try {
        connection = await connection_1.default.connect();
        // Consulta para buscar as datas de treino dos últimos 7 dias
        const query = `
      SELECT TO_CHAR(horario_entrada, 'YYYY-MM-DD') AS data_treino
      FROM registro_treino
      WHERE fk_aluno_cpf = :cpf
      AND horario_entrada >= TRUNC(SYSDATE) - 7
      ORDER BY horario_entrada DESC
    `;
        const result = await connection.execute(query, [cpf]);
        const rows = result.rows;
        // Verifica se encontrou resultados
        if (rows && rows.length > 0) {
            // Mapeia as datas em um array simples
            const datasDeTreino = rows.map(row => row[0]);
            console.debug('Datas de treino encontradas:', datasDeTreino);
            res.status(200).json(datasDeTreino);
        }
        else {
            console.log('Nenhuma data de treino encontrada');
            res.status(404).json({ message: 'Nenhuma data de treino encontrada nos últimos 7 dias' });
        }
    }
    catch (err) {
        console.error('Erro ao buscar as datas de treino:', err);
        res.status(500).send('Erro ao processar a solicitação.');
    }
    finally {
        if (connection) {
            await connection_1.default.close(connection);
            console.log('Conexão com o banco de dados fechada');
        }
    }
});
routes.post('/registerEntry', async (req, res) => {
    const { cpf } = req.body;
    // Setting the correctly timeZonw to ensure get the America/SaoPaulo
    const horarioEntrada = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace('T', ' ');
    let connection;
    console.log(`[Entrada] Recebida requisição para registrar entrada. CPF: ${cpf}`);
    console.log(`[Entrada] Horário local registrado: ${horarioEntrada}`);
    try {
        connection = await connection_1.default.connect();
        console.log('[Entrada] Conexão com o banco de dados estabelecida.');
        const Query = `
      INSERT INTO registro_treino (fk_aluno_cpf, horario_entrada)
      VALUES (:cpf, TO_TIMESTAMP(:horarioEntrada, 'YYYY-MM-DD HH24:MI:SS'))
    `;
        await connection.execute(Query, {
            cpf,
            horarioEntrada,
        });
        await connection.commit();
        console.log('[Entrada] Registro de entrada inserido com sucesso no banco de dados.');
        res.status(201).json({ message: 'Entrada registrada com sucesso!' });
    }
    catch (err) {
        console.error('[Entrada] Erro ao registrar entrada:', err);
        res.status(500).json({ message: 'Erro ao registrar entrada.' });
    }
    finally {
        if (connection) {
            await connection_1.default.close(connection);
            console.log('[Entrada] Conexão com o banco de dados fechada.');
        }
    }
});
routes.post('/registerExit', async (req, res) => {
    const { cpf } = req.body;
    const horarioSaida = new Date(); // Momento atual
    let connection;
    console.log(`[Saída] Recebida requisição para registrar saída. CPF: ${cpf}`);
    try {
        connection = await connection_1.default.connect();
        console.log('[Saída] Conexão com o banco de dados estabelecida.');
        // Buscar o horário de entrada mais recente sem saída
        const Query = `
      SELECT CAST(horario_entrada AS TIMESTAMP WITH TIME ZONE) AT TIME ZONE 'America/Sao_Paulo' AS horario_entrada
      FROM registro_treino
      WHERE fk_aluno_cpf = :cpf AND horario_saida IS NULL
      ORDER BY horario_entrada DESC
      FETCH FIRST 1 ROWS ONLY
    `;
        const result = await connection.execute(Query, { cpf });
        const rows = result.rows;
        if (rows && rows.length > 0) {
            const horarioEntrada = new Date(rows[0][0]); // Converte o horário de entrada para um objeto Date
            // Calcular a diferença em milissegundos
            const diferencaMillis = horarioSaida.getTime() - horarioEntrada.getTime();
            // Converter para minutos
            const duracaoEmMinutos = Math.ceil(diferencaMillis / (1000 * 60));
            console.log('[Saída] Registro de entrada encontrado.');
            console.log(`[Saída] Horário de entrada ajustado: ${horarioEntrada}`);
            console.log(`[Saída] Horário de saída: ${horarioSaida}`);
            console.log(`[Saída] Duração calculada: ${duracaoEmMinutos} minutos`);
            // Atualizar o registro no banco
            const updateQuery = `
        UPDATE registro_treino
        SET horario_saida = TO_TIMESTAMP(:horarioSaida, 'YYYY-MM-DD HH24:MI:SS'),
            duracao = :duracao
        WHERE fk_aluno_cpf = :cpf AND horario_saida IS NULL
      `;
            await connection.execute(updateQuery, {
                horarioSaida: horarioSaida.toISOString().replace('T', ' ').slice(0, 19),
                duracao: duracaoEmMinutos,
                cpf,
            });
            await connection.commit();
            console.log('[Saída] Registro atualizado com sucesso no banco de dados.');
            res.status(200).json({ message: 'Saída registrada com sucesso!', duracao: duracaoEmMinutos });
        }
        else {
            console.warn('[Saída] Nenhum registro de entrada encontrado para este CPF.');
            res.status(404).json({ message: 'Nenhum registro de entrada encontrado para este CPF.' });
        }
    }
    catch (err) {
        console.error('[Saída] Erro ao registrar saída:', err);
        res.status(500).json({ message: 'Erro ao registrar saída.' });
    }
    finally {
        if (connection) {
            await connection_1.default.close(connection);
            console.log('[Saída] Conexão com o banco de dados fechada.');
        }
    }
});
app.use(routes);
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
