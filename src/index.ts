import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt, { sign } from 'jsonwebtoken';
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
import { hash, compare } from 'bcryptjs';
const prisma = new PrismaClient()

const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running...');
});

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


app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log(req.body);

    // 1. Check if the user exist
    const count = await prisma.user.count({
      where: {
        username: username
      }
    });
    console.log(count);

    if (count > 0) {
      throw new Error('User already exist');
    }
    // 2. If not user exist already, hash the password
    const hashedPassword = await hash(password, 10);
    // 3. Insert the user in "database"
    await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword
      },
    });
    res.send({ message: 'User Created' });
  } catch (err: any) {
    res.send({
      error: `${err.message}`,
    });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Find user in array. If not exist send error
    const user = await prisma.user.findUnique({
      where: {
        username: username
      }
    });
    if (!user) throw new Error('User does not exist');
    // 2. Compare crypted password and see if it checks out. Send error if not
    const valid = await compare(password, user.password);
    if (!valid) throw new Error('Password not correct');
    // 3. Create Refresh- and Accesstoken
    const accesstoken = createAccessToken(Number(user.id));
    const refreshtoken = createRefreshToken(Number(user.id));
    // 4. Store Refreshtoken with user in "db"
    // Could also use different version numbers instead.
    // Then just increase the version number on the revoke endpoint
    user.refresh_token = refreshtoken;
    // 5. Send token. Refreshtoken as a cookie and accesstoken as a regular response
    sendRefreshToken(res, refreshtoken);
    sendAccessToken(res, req, accesstoken);
  } catch (err: any) {
    res.send({
      error: `${err.message}`,
    });
  }
});

const createAccessToken = (userId: number) => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15m',
  });
};

const createRefreshToken = (userId: number) => {
  return sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: '7d',
  });
};

const sendAccessToken = (res: Response, req: Request, accesstoken: string) => {
  res.send({
    accesstoken,
    email: req.body.email,
  });
};

const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('refreshtoken', token, {
    httpOnly: true,
    path: '/refresh_token',
  });
};

// app.post('/login', (req, res) => {
//   // Authenticate User

//   const username = req.body.username
//   const user = { name: username }

//   const accessToken = generateAccessToken(user)
//   const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!)
//   // refreshTokens.push(refreshToken)
//   res.json({ accessToken: accessToken, refreshToken: refreshToken })
// })

// function generateAccessToken(user: any) {
//   return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '10m' })
// }

// function authenticateToken(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (token == null) return res.sendStatus(401)

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
//     console.log(err)
//     if (err) return res.sendStatus(403)
//     req.user = user;
//     next()
//   })
// }

/**
 * Applied SOLID principle: Open to scale this API, closed to modification this API.
 * Every new table should be added to the EntityMap, with the corresponding table class.
 * TODO: Add middleware to authorize
 */
app.put('/:entity', async (req: Request, res: Response) => {
  const entity: string = req.params.entity;
  const databaseTable: DatabaseTable = correspondingDatabaseTable(entity);
  if (!databaseTable) return res.status(400).send({ result: 'entity not found!' });
  console.log(req.body);

  const result = await databaseTable.create(req.body);
  return res.status(200).send({ status: 'success', data: result, message: 'record created' });
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

