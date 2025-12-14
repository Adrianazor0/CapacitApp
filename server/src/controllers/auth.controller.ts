import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("ERROR CRÍTICO: JWT_SECRET no está definido en las variables de entorno.");
  }
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    const userExists = await User.findOne({ username });
    
    if (userExists) {
      res.status(400).json({ message: 'El usuario ya existe' });
      return;
    }

    const user = new User({ username, password, role });
    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id as unknown as string)
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id as unknown as string)
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
