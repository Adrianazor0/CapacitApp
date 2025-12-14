import { Request, Response } from "express";
import { Student, IStudent } from '../models/Student';

export const getStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const students: IStudent[] = await Student.find({ isActive: true });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentData: IStudent = req.body;
        const newStudent: IStudent = new Student(studentData);
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};