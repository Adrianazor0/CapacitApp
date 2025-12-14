import { Request, Response } from "express";
import { Program, IProgram } from '../models/Program';

export const getPrograms = async (req: Request, res: Response): Promise<void> => {
    try {
        const programs: IProgram[] = await Program.find({ isActive: true });
        res.status(200).json(programs);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createProgram = async (req: Request, res: Response): Promise<void> => {
    try {
        const programData: IProgram = req.body;
        const newProgram: IProgram = new Program(programData);
        await newProgram.save();
        res.status(201).json(newProgram);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};