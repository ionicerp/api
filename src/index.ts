import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const Pool = require('pg').Pool
const NODE_ENV = process.env.NODE_ENV || 'production';
const pool = new Pool({
  user: 'postgres',
  host: NODE_ENV === 'production' ? 'host.docker.internal' : 'localhost',
  database: 'autolive',
  password: 'helloworld',
  port: 5432,
});

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running...');
});

app.get('/users', (req: Request, res: Response) => {
  pool.query('SELECT * FROM users ORDER BY name ASC', (error: any, results: { rows: any; }) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  });
});

app.post('/users', (req: Request, res: Response) => {
  const { name } = req.body;
  const uuid = uuidv4();

  pool.query('INSERT INTO users (uuid, name) VALUES ($1, $2)', [uuid, name], (error: any, results: any) => {
    if (error) {
      throw error
    }
    res.status(201).send({ result: 'User added!' })
  });
});

app.delete('/users/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  pool.query('DELETE FROM users WHERE uuid = $1', [id], (error: any, results: any) => {
    if (error) {
      throw error
    }
    res.status(200).send({ result: `User deleted with ID: ${id}` })
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
