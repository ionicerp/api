import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
// import { Pool } from 'pg';
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const NODE_ENV = process.env.NODE_ENV || 'production';
// const pool = new Pool({
//   user: 'postgres',
//   host: NODE_ENV === 'production' ? 'host.docker.internal' : '192.168.0.8',
//   database: 'ionicerp',
//   password: 'helloworld',
//   port: 5432,
// });

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running...');
});

app.get('/:entity', async (req: Request, res: Response) => {
  // Creating a new record
  // const entity: string = req.params.entity
  const a = await prisma.accounts.findMany({
    select: {
      username: true,
    },
  });
  console.log(a);

  // const table = req.params.entity;

  res.status(200).json({})
});

// app.post('/users', (req: Request, res: Response) => {
//   const { name } = req.body;
//   const uuid = uuidv4();

//   pool.query('INSERT INTO users (uuid, name) VALUES ($1, $2)', [uuid, name], (error, results) => {
//     if (error) {
//       throw error
//     }
//     res.status(201).send({ result: 'User added!' })
//   });
// });

// app.delete('/users/:id', (req: Request, res: Response) => {
//   const id = req.params.id;
//   pool.query('DELETE FROM users WHERE uuid = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     res.status(200).send({ result: `User deleted with ID: ${id}` })
//   });
// });

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
