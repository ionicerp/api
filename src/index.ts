import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config'
import { DatabaseTable } from './classes/database_table';
import { AccountTable } from './classes/account_table/account_table';
import { UserTable } from './classes/user_table/user_table';

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

export const correspondingDatabaseTable = (tableName: string) => {
  return EntityMap.get(tableName)!;
};

/**
 * Applied SOLID principle: Open to scale this API, closed to modification this API.
 * Every new table should be added to the EntityMap, with the corresponding table class.
 * TODO: Add middleware to authorize
 */
app.post('/:entity', async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const databaseTable: DatabaseTable = correspondingDatabaseTable(entity);

  if (!databaseTable)
    return res.status(400).send({ result: 'entity not found!' });

  // assuming record created always return the newly created record id as number
  // if return is not typed number, then something wrong
  const result = await databaseTable.create(req.body);
  if (isNaN(parseInt(result)))
    return res.status(500).send({ result: result });

  res.status(200).send({ result: result });
});


// not yet refactored
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


// get single record

// update single record

// delete single record


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

