import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import express, { Express, NextFunction, Request, Response } from 'express';
import { verify, sign, Jwt, JwtPayload } from 'jsonwebtoken';
const prisma = new PrismaClient();

export const auth = (app: Express) => {
  app.get('/login', function (req, res) {
    res.render('login', {
      title: 'Express Login'
    });
  });
  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
      // Check if the user exist
      const count = await prisma.user.count({
        where: {
          username: username
        }
      });
      if (count > 0) throw new Error('User already exist');
      const hashedPassword = await hash(password, 10);
      // Insert the user in database
      await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword
        },
      });
      res.send({ message: 'User Created' });
    } catch (err: any) {
      res.send({ error: err.message });
    }
  });

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: {
          username: username
        }
      });
      if (!user) throw new Error('User does not exist');
      // Compare crypted password and see if it checks out
      const valid = await compare(password, user.password);
      if (!valid) throw new Error('Password not correct');
      // Create Refresh- and Accesstoken
      const accesstoken = createAccessToken(Number(user.id));
      const refreshtoken = createRefreshToken(Number(user.id));
      // 4. Store Refreshtoken with user
      // Could also use different version numbers instead.
      // Then just increase the version number on the revoke endpoint
      user.refresh_token = refreshtoken;
      // Send token. Refreshtoken as a cookie and accesstoken as a regular response
      sendRefreshToken(res, refreshtoken);
      sendAccessToken(res, req, accesstoken);
    } catch (err: any) {
      res.send({
        error: `${err.message}`,
      });
    }
  });

  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.refreshtoken;
    // If we don't have a token in our request
    if (!token) return res.send({ accesstoken: '' });
    // We have a token, let's verify it!
    const payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
    // token is valid, check if user exist
    const user = await prisma.user.findUnique({
      where: {
        username: payload.userId
      }
    });
    if (!user) return res.send({ accesstoken: '' });
    // user exist, check if refreshtoken exist on user
    if (user.refresh_token !== token)
      return res.send({ accesstoken: '' });
    // token exist, create new Refresh- and accesstoken
    const accesstoken = createAccessToken(Number(user.id));
    const refreshtoken = createRefreshToken(Number(user.id));
    // update refreshtoken on user in db
    // Could have different versions instead!
    user.refresh_token = refreshtoken;
    // All good to go, send new refreshtoken and accesstoken
    sendRefreshToken(res, refreshtoken);
    return res.send({ accesstoken });
  });
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers['authorization'];
  if (!authorization) throw new Error('You need to login.');
  // Based on 'Bearer ksfljrewori384328289398432'
  const token = authorization.split(' ')[1];
  verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
    if (err) return res.status(403).send({ status: 'error', data: err, message: 'Invalid token.' });
    req.user = user;
    next();
  });

};

const createAccessToken = (userId: number) => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '8h',
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

