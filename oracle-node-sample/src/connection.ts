import oracledb from 'oracledb';
import { config } from 'dotenv';

// Export the env variables
config();

class DataBase {
  #configs: object;

  constructor() {
    this.#configs = {
      user: process.env.DB_USER,
      password: process.env.PASSWORD,
      connectString: process.env.CONNECTSTRING,
    };
  }
  

  async connect() {
    try {
      const connection = await oracledb.getConnection(this.#configs);
      console.log('Conexão estabelecida com sucesso.');
      return connection;
    } catch (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      throw err;
    }
  }

  async close(connection: oracledb.Connection) {
    try {
      await connection.close();
      console.log('Conexão fechada com sucesso.');
    } catch (err) {
      console.error('Erro ao fechar a conexão:', err);
    }
  }
}

export default new DataBase();
