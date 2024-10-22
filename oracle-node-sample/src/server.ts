import express, { Request, Response, Router } from 'express';
import oracledb from 'oracledb';

const app = express();
const port = 3000;
const routes = Router();

routes.get('/', (req: Request, res: Response) => {
    res.status(200).send("Funcionando...");
});

routes.get('/getClientes', async (req: Request, res: Response) => {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: "admin",
            password: "OracleCloud!23",
            connectString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.sa-saopaulo-1.oraclecloud.com))(connect_data=(service_name=g920f13bf6b396e_txjczt529xfpir2e_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
        });

        await connection.execute(`BEGIN
            EXECUTE IMMEDIATE 'CREATE TABLE nodetab (id NUMBER, nome VARCHAR2(50))';
        END;`);

        const result = await connection.execute(`SELECT * FROM nodetab`);

        res.status(200).json(result.rows);
        console.dir(result.rows, { depth: null });

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao conectar ao banco de dados.");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Erro ao fechar a conexão:', err);
            }
        }
    }
});

app.use(routes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
