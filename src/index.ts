import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config'
import { DatabaseTable } from './classes/database_table';
import { AccountTable } from './classes/account_table/account_table';
import { UserTable } from './classes/user_table/user_table';

const NODE_ENV = process.env.NODE_ENV || 'production';
// const pool = new Pool({
//   user: 'postgres',
//   host: NODE_ENV === 'production' ? 'host.docker.internal' : '192.168.0.8',
//   database: 'ionicerp',
//   password: 'helloworld',
//   port: 5432,
// });

const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running...');
});


export const EntityMap = new Map<string, DatabaseTable>([
  ['account', new AccountTable()],
  ['user', new UserTable()],
]);

/**
 * Applied SOLID principle: Open Closed.
 * Every new table should be added to the EntityMap, with the corresponding table class.
 */
app.post('/:entity', async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const dbTable: DatabaseTable = EntityMap.get(entity)!;
  if (dbTable) {
    const createData = await dbTable.create(req.body);
    if (isNaN(parseInt(createData))) {
      res.status(500).send({ result: createData });
    } else {
      res.status(200).send({ result: createData });
    }
  } else {
    res.status(400).send({ result: 'entity not found!' });
  }
});

app.get('/:entity', async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
  // http://localhost:8888/account?limit=3

  const dbTable: DatabaseTable = EntityMap.get(entity)!;
  if (dbTable) {
    const createData = await dbTable.list(limit);
    if (!Array.isArray(createData)) {
      res.status(500).send({ result: createData });
    } else {
      res.status(200).send({ result: createData });
    }
  } else {
    res.status(400).send({ result: 'entity not found!' });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

