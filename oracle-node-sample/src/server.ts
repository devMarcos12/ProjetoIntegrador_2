import express, { Request, Response, Router } from 'express';
import oracledb from 'oracledb';
import cors from 'cors';
import DataBase from './connection';

const app = express();
const port = 3000;
const routes = Router()

app.use(express.json());
app.use(cors());

routes.get('/', (req: Request, res: Response) => {
    res.status(200).send("Funcionando...");
});

routes.get('/test', async (req: Request, res: Response) => {
  let connection;

  try {
    // Get the connection from database class
    connection = await DataBase.connect();

    const result = await connection.execute(`SELECT name FROM alunos`);

    res.status(200).json(result.rows);
    console.log(result.rows);

  } catch (err) {
    console.error('Erro ao processar a consulta:', err);
    res.status(500).send('Erro ao conectar ao banco de dados.');
  } finally {
    if (connection) {
      await DataBase.close(connection);
    }
  }
});

routes.post('/register', async (req: Request, res: Response) => {
  console.log('Recebendo requisição no endpoint /register');

  const { name, email, telefone, cpf, data_nasc, endereco, peso, altura } = req.body;
  let connection;

  console.log('Dados recebidos(Json):', req.body);

  try {
    connection = await DataBase.connect();
    console.log('Conexão com o banco de dados estabelecida');

    const insertQuery = `
      INSERT INTO alunos (name, email, telefone, cpf, data_nasc, endereco, peso, altura)
      VALUES (:name, :email, :telefone, :cpf, TO_DATE(:data_nasc, 'YYYY-MM-DD'), :endereco, :peso, :altura)
    `;

    await connection.execute(insertQuery, [name, email, telefone, cpf, data_nasc, endereco, peso, altura]);
    await connection.commit();

    res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar o usuário:', err);
    res.status(500).json({ message: 'Erro ao cadastrar o usuário.' });
  } finally {
    if (connection) {
      await DataBase.close(connection);
      console.log('Conexão com o banco de dados fechada');
    }
  }
});

routes.post('/login', async (req: Request, res: Response) => {
  const { cpf } = req.body;
  let connection;

  console.debug("CPF recebido: ", cpf)

  try {
    connection = await DataBase.connect();

    const query = `SELECT cpf FROM alunos WHERE cpf = :cpf`;
    const result = await connection.execute(query, [cpf]);

    const rows = result.rows as any[][];

    if (rows && rows.length > 0) {
      res.status(200).json({ message: 'Login bem-sucedido', user: rows[0][0] });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao verificar o login:', err);
    res.status(500).send('Erro ao processar o login.');
  } finally {
    if (connection) {
      await DataBase.close(connection);
    }
  }
});

routes.post('/getStudentInfo', async (req: Request, res: Response) => {
  const { cpf } = req.body;
  let connection;

  try {
    connection = await DataBase.connect();

    const query = `
      SELECT 
          a.id AS aluno_id,
          a.name AS aluno_nome,
          a.cpf AS aluno_cpf,
          NVL(SUM(r.duracao), 0) AS total_minutos, -- Total em minutos
          CASE
              WHEN NVL(SUM(r.duracao), 0) / 60 <= 5 THEN 'Iniciante'
              WHEN NVL(SUM(r.duracao), 0) / 60 BETWEEN 6 AND 10 THEN 'Intermediário'
              WHEN NVL(SUM(r.duracao), 0) / 60 BETWEEN 11 AND 20 THEN 'Avançado'
              WHEN NVL(SUM(r.duracao), 0) / 60 > 20 THEN 'Extremamente Avançado'
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
    const rows = result.rows as any[][];

    if (rows && rows.length > 0) {
      const [aluno_id, aluno_nome, aluno_cpf, total_minutos, classificacao] = rows[0];

      // Converte minutos para horas completas (arredondadas para baixo)
      const horas_treinadas = Math.floor(total_minutos / 60);

      res.status(200).json({
        aluno_id,
        aluno_nome,
        aluno_cpf,
        horas_treinadas,
        classificacao
      });
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar informações do aluno:', err);
    res.status(500).send('Erro ao processar a solicitação.');
  } finally {
    if (connection) {
      await DataBase.close(connection);
    }
  }
});



routes.get('/last7days/:cpf', async (req: Request, res: Response) => {
  const { cpf } = req.params;
  let connection;

  try {
    connection = await DataBase.connect();

    // Consulta para buscar as datas de treino dos últimos 7 dias
    const query = `
      SELECT 
        TO_CHAR(horario_entrada, 'YYYY-MM-DD') AS data_treino
      FROM registro_treino
      WHERE fk_aluno_cpf = :cpf
      AND horario_entrada >= TRUNC(SYSDATE) - 7
      ORDER BY horario_entrada DESC
    `;

    const result = await connection.execute(query, [cpf]);
    const rows = result.rows as any[][];

    // Verifica se encontrou resultados
    if (rows && rows.length > 0) {
      const datasDeTreino = rows.map(row => row[0]); // Extraí as datas
      console.debug('Datas de treino encontradas:', datasDeTreino);
      res.status(200).json(datasDeTreino); // Retorna as datas como um array
    } else {
      console.log('Nenhuma data de treino encontrada');
      res.status(404).json({ message: 'Nenhuma atividade registrada nos últimos 7 dias' });
    }
  } catch (err) {
    console.error('Erro ao buscar os registros de treino:', err);
    res.status(500).send('Erro ao processar a solicitação.');
  } finally {
    if (connection) {
      await DataBase.close(connection);
      console.log('Conexão com o banco de dados fechada');
    }
  }
});


routes.post('/registerEntry', async (req: Request, res: Response) => {
  const { cpf } = req.body;

  // Setting the correct timezone
  const horarioEntrada = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace('T', ' ');

  let connection;

  console.log(`[Entrada] Recebida requisição para registrar entrada. CPF: ${cpf}`);
  console.log(`[Entrada] Horário local registrado: ${horarioEntrada}`);

  try {
    connection = await DataBase.connect();
    console.log('[Entrada] Conexão com o banco de dados estabelecida.');

    // Configura o formato de saída para objetos
    const checkQuery = `
      SELECT COUNT(*) AS registros_abertos
      FROM registro_treino
      WHERE fk_aluno_cpf = :cpf AND horario_saida IS NULL
    `;
    const checkResult = await connection.execute<{ REGISTROS_ABERTOS: number }>(
      checkQuery,
      { cpf },
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // Configura o retorno para objetos nomeados
    );

    // Ajuste no acesso ao resultado
    const registrosAbertos = checkResult.rows?.[0]?.REGISTROS_ABERTOS || 0;

    if (registrosAbertos > 0) {
      console.warn(`[Entrada] Aluno com CPF ${cpf} já possui uma entrada sem saída registrada.`);
      res.status(400).json({ message: 'Você ainda não registrou sua saída.' });
      return;
    }

    // Insere o novo registro de entrada
    const insertQuery = `
      INSERT INTO registro_treino (fk_aluno_cpf, horario_entrada)
      VALUES (:cpf, TO_TIMESTAMP(:horarioEntrada, 'YYYY-MM-DD HH24:MI:SS'))
    `;
    await connection.execute(insertQuery, {
      cpf,
      horarioEntrada,
    });

    await connection.commit();
    console.log('[Entrada] Registro de entrada inserido com sucesso no banco de dados.');
    res.status(201).json({ message: 'Entrada registrada com sucesso!' });
  } catch (err) {
    console.error('[Entrada] Erro ao registrar entrada:', err);
    res.status(500).json({ message: 'Erro ao registrar entrada.' });
  } finally {
    if (connection) {
      await DataBase.close(connection);
      console.log('[Entrada] Conexão com o banco de dados fechada.');
    }
  }
});


routes.post('/registerExit', async (req: Request, res: Response) => {
  const { cpf } = req.body;
  const horarioSaida = new Date(); // Momento atual
  let connection;

  console.log(`[Saída] Recebida requisição para registrar saída. CPF: ${cpf}`);

  try {
    connection = await DataBase.connect();
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
    const rows = result.rows as any[][];

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
    } else {
      console.warn('[Saída] Nenhum registro de entrada encontrado para este CPF.');
      res.status(404).json({ message: 'Nenhum registro de entrada encontrado para este CPF.' });
    }
  } catch (err) {
    console.error('[Saída] Erro ao registrar saída:', err);
    res.status(500).json({ message: 'Erro ao registrar saída.' });
  } finally {
    if (connection) {
      await DataBase.close(connection);
      console.log('[Saída] Conexão com o banco de dados fechada.');
    }
  }
});

routes.get('/ranking-semanal', async (_req: Request, res: Response) => {
  let connection;

  try {
      connection = await DataBase.connect();

      const query = `
          WITH TreinosRecentes AS (
              SELECT 
                  r.fk_aluno_cpf,
                  SUM(NVL(r.duracao, 0)) AS duracao_treino
              FROM registro_treino r
              WHERE TRUNC(r.horario_entrada) >= TRUNC(SYSDATE) - 7
              GROUP BY r.fk_aluno_cpf
          )
          SELECT 
              CASE
                  WHEN FLOOR(NVL(t.duracao_treino, 0) / 60) <= 5 THEN 'Iniciante'
                  WHEN FLOOR(NVL(t.duracao_treino, 0) / 60) BETWEEN 6 AND 10 THEN 'Intermediário'
                  WHEN FLOOR(NVL(t.duracao_treino, 0) / 60) BETWEEN 11 AND 20 THEN 'Avançado'
                  WHEN FLOOR(NVL(t.duracao_treino, 0) / 60) > 20 THEN 'Extremamente Avançado'
              END AS CLASSIFICACAO,
              a.cpf AS ALUNO_CPF,
              a.name AS ALUNO_NOME,
              FLOOR(NVL(t.duracao_treino, 0) / 60) AS TOTAL_HORAS_TREINADAS
          FROM alunos a
          LEFT JOIN TreinosRecentes t ON a.cpf = t.fk_aluno_cpf
          ORDER BY CLASSIFICACAO
      `;
  

      const result = await connection.execute(query);

      // Mapeando as linhas corretamente. `result.rows` é um array de arrays.
      const rows = result.rows?.map((row: any) => ({
          CLASSIFICACAO: row[0],
          ALUNO_CPF: row[1],
          ALUNO_NOME: row[2],
          TOTAL_HORAS_TREINADAS: row[3]
      }));

      res.status(200).json(rows);
  } catch (err) {
      console.error('Erro ao buscar ranking semanal:', err);
      res.status(500).send('Erro ao processar a solicitação.');
  } finally {
      if (connection) {
          await DataBase.close(connection); // Fecha a conexão com o banco de dados
      }
  }
});

routes.get('/ranking-geral', async (_req: Request, res: Response) => {
  let connection;

  try {
    connection = await DataBase.connect();

    const query = `
      SELECT 
          a.name AS nome_completo,
          a.cpf,
          FLOOR(NVL(SUM(r.duracao), 0) / 60) AS horas_treinadas -- Converte minutos para horas
      FROM 
          alunos a
      LEFT JOIN 
          registro_treino r ON a.cpf = r.fk_aluno_cpf
      GROUP BY 
          a.name, a.cpf
      ORDER BY 
          horas_treinadas DESC
    `;

    const result = await connection.execute(query);
    const rows = result.rows;

    res.status(200).json(rows);
  } catch (err) {
    console.error('Erro ao buscar ranking geral:', err);
    res.status(500).send('Erro ao processar a solicitação.');
  } finally {
    if (connection) {
      await DataBase.close(connection);
    }
  }
});

app.use(routes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
