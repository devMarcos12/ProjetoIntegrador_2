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
const oracledb_1 = __importDefault(require("oracledb"));
const app = (0, express_1.default)();
const port = 3000;
const routes = (0, express_1.Router)();
routes.get('/', (req, res) => {
    res.status(200).send("Funcionando...");
});
routes.get('/getClientes', async (req, res) => {
    let connection;
    try {
        connection = await oracledb_1.default.getConnection({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Erro ao conectar ao banco de dados.");
    }
    finally {
        if (connection) {
            try {
                await connection.close();
            }
            catch (err) {
                console.error('Erro ao fechar a conexão:', err);
            }
        }
    }
});
app.use(routes);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
