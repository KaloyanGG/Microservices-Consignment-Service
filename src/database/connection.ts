import mysql, { ConnectionOptions, Connection } from 'mysql2';
import c from '../config/config';

// let i = 1;
// console.log(' 📚 DatabaseConnection.ts is being executed:', i++);

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private connection: Connection;

    private constructor() {
        const access: ConnectionOptions = {
            user: c.db.USER,
            database: c.db.DATABASE,
            host: c.db.HOST,
            password: c.db.PASSWORD,
            port: c.db.PORT,
        };
        console.log('access: ', access);
        this.connection = mysql.createConnection(access);

    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public getConnection(): Connection {
        return this.connection;
    }
    public endConnection() {
        this.connection.end();
    }

    public async checkConnection() {
        // console.log(this.connection);
        const [rows] = await this.connection.promise().query('SELECT 1');
        console.log(' ✅ Connection is established:', (rows as any)[0]['1'] === 1);
    }
}

export default DatabaseConnection.getInstance();
