import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import express, { Express, NextFunction, Request, Response } from 'express';
import { verify, sign, Jwt, JwtPayload } from 'jsonwebtoken';
const prisma = new PrismaClient();

export const auth = (app: Express) => {
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
      // Create user in db
      await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword
        },
      });
      res.status(200).send({ status: 'success', message: 'User Created' });
    } catch (err: any) {
      res.status(500).send({ status: "error", data: err, message: err.message });
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
      const accessToken = createAccessToken({ username: username });
      const refreshToken = createRefreshToken({ username: username });
      // Store Refreshtoken with user
      await prisma.user.update({
        where: {
          username: username
        },
        data: {
          refresh_token: refreshToken
        }
      })
      // Send access token
      res.status(200).send({
        status: 'success',
        message: 'Login successfully',
        data: { access_token: accessToken, refresh_token: refreshToken },
      });
      // Refreshtoken as a cookie
      // res.cookie('refresh_token', refreshToken, {
      //   httpOnly: true,
      //   path: '/refresh_token',
      // });
    } catch (err: any) {
      res.status(500).send({ status: "error", data: err, message: err.message });
    }
  });

  app.post('/refresh_token', async (req, res) => {
    const refreshToken = req.body.refresh_token;
    // const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) return res.status(400).send({ status: 'error', message: 'No token provided' });
    try {
      const payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: {
          username: payload.username
        }
      });
      if (!user)
        return res.send({ status: 'error', message: 'User does not exist' });
      if (!user.refresh_token || user.refresh_token !== refreshToken)
        return res.send({ status: 'error', message: 'Invalid refresh token. Please login again.' });
      const accessToken = createAccessToken({ username: user.username });
      return res.status(200).send({ access_token: accessToken, refresh_token: refreshToken });
      // res.cookie('refresh_token', refreshToken, {
      //   httpOnly: true,
      //   path: '/refresh_token',
      // });
    } catch (err) {
      return res.status(401).send({ status: 'error', message: 'Invalid token' });
    }
  });

  app.post('/logout', async (req, res) => {
    const refreshToken = req.body.refresh_token;
    // If we don't have a token in our request
    if (!refreshToken) return res.send({ status: 'error', message: 'No refresh token' });
    // We have a token, let's verify it!
    const payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
    prisma.user.update({
      where: {
        username: payload.username
      },
      data: {
        refresh_token: null
      }
    });
    return res.send({ status: 'success', message: 'Logged out' });
  });
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers['authorization'];
  if (!authorization) throw new Error('You need to login.');
  // Based on 'Bearer ksfljrewori384328289398432'
  const token = authorization.split(' ')[1];
  verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
    if (err) return res.status(403).send({ status: 'error', data: err, message: 'Invalid token.' });
    const userPayload = user as JwtPayload;
    const username = userPayload.username;
    console.log(username);
  });
  next();
};

const createAccessToken = (data: any) => {
  return sign(data, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
};

const createRefreshToken = (data: any) => {
  return sign(data, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
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

