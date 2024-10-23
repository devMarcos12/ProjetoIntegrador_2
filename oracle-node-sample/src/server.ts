import express, { Request, Response, Router } from 'express';
import DataBase from './connection';  // Importando a classe DataBase

const app = express();
const port = 3000;
const routes = Router()

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

app.use(routes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
