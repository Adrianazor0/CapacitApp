import { Request, Response } from "express";
import { Teacher, ITeacher} from '../models/Teacher';

export const getTeachers = async (req: Request, res: Response): Promise<void> => {
    try {
        const teachers: ITeacher[] = await Teacher.find({ isActive: true });
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const teacherData: ITeacher = req.body;
        const newTeacher: ITeacher = new Teacher(teacherData);
        await newTeacher.save();
        res.status(201).json(newTeacher);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};