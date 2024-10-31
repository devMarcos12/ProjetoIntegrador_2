import express, { Request, Response, Router } from 'express';
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

    const result = await connection.execute(`SELECT * FROM nodetab`);

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

  console.log('Dados recebidos:', req.body);

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
    res.status(500).json({ message: 'Erro ao cadastrar o usuário.' }); // Resposta em JSON
  } finally {
    if (connection) {
      await DataBase.close(connection);
      console.log('Conexão com o banco de dados fechada');
    }
  }
});


app.use(routes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
