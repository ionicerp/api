import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config'
import { DatabaseTable } from './classes/database_table';
import { AccountTable } from './classes/account_table/account_table';
import { UserTable } from './classes/user_table/user_table';
import { PrismaClient } from '@prisma/client';
import { CustomerTable } from './classes/customer_table/customer_table';
import { ClaimTable } from './classes/claim_table/claim_table';
import { ServiceOrderTable } from './classes/service_order_table/service_order_table';
import { DeviceTable } from './classes/device_table/device_table';
import { BusinessUnitTable } from './classes/business_unit_table/business_unit_table';
import { OrganizationTable } from './classes/organization_table/organization_table';
import { authenticateToken } from './auth';
const prisma = new PrismaClient()

const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running...');
});
import { auth } from './auth';
auth(app);

const EntityMap = new Map<string, DatabaseTable>([
  ['account', new AccountTable(prisma)],
  ['user', new UserTable(prisma)],
  ['customer', new CustomerTable(prisma)],
  ['organization', new OrganizationTable(prisma)],
  ['business_unit', new BusinessUnitTable(prisma)],
  ['device', new DeviceTable(prisma)],
  ['service_order', new ServiceOrderTable(prisma)],
  ['claim', new ClaimTable(prisma)],
]);

const correspondingDatabaseTable = (tableName: string) => {
  return EntityMap.get(tableName)!;
};


/**
 * Applied SOLID principle: Open to scale this API, closed to modification this API.
 * Every new table should be added to the EntityMap, with the corresponding table class.
 * TODO: Add middleware to authorize
 */
app.put('/:entity', authenticateToken, async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const databaseTable: DatabaseTable = correspondingDatabaseTable(entity);
  if (!databaseTable) return res.status(400).send({ result: 'entity not found!' });
  databaseTable.create(req.body).then(result => {
    return res.status(200).send({ status: 'success', data: result, message: 'record created' });
  }).catch(error => {
    return res.status(400).send({ status: 'error', data: error, message: 'record not created' });
  });
});


app.get('/:entity', async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const page: number = parseInt(req.query.page as string) ?? 1;
  const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const condition = req.body.condition ?? {};

  const databaseTable: DatabaseTable = correspondingDatabaseTable(entity);
  if (!databaseTable) return res.status(400).send({ result: 'entity not found!' });
  const result = await databaseTable.list(condition, limit);

  res.status(200).send({ status: 'success', data: result, message: 'record created' });

});


// get single record
app.get('/:entity/:id', async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const databaseTable: DatabaseTable = correspondingDatabaseTable(entity);
  if (!databaseTable) return res.status(400).send({ result: 'entity not found!' });
  const id: number = parseInt(req.params.id);
  const result = await databaseTable.get(id);
  return res.status(200).send({ status: 'success', data: result, message: 'record found' });
})

// update single record
app.post('/:entity', async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const databaseTable: DatabaseTable = correspondingDatabaseTable(entity);
  if (!databaseTable) return res.status(400).send({ result: 'entity not found!' });

  res.status(200).send({ result: 'ok' });
})

// delete single record
app.delete('/:entity', async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const databaseTable: DatabaseTable = correspondingDatabaseTable(entity);
  if (!databaseTable) return res.status(400).send({ result: 'entity not found!' });

  res.status(200).send({ result: 'ok' });
})


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

