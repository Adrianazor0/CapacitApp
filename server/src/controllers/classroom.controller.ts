import { Request, Response } from "express";
import { Classroom, IClassroom } from "../models/Classroom";

export const getClassrooms = async (req: Request, res: Response): Promise<void> => {
    try {
        const classrooms: IClassroom[] = await Classroom.find({ isActive: true });
        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createClassroom = async (req: Request, res: Response): Promise<void> => {
    try {
        const classroomData: IClassroom = req.body;
        const newClassroom: IClassroom = new Classroom(classroomData);
        await newClassroom.save();
        res.status(201).json(newClassroom);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const updateClassroom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const classroomData: Partial<IClassroom> = req.body;
        const updatedClassroom: IClassroom | null = await Classroom.findByIdAndUpdate(id, classroomData, { new: true });
        if (!updatedClassroom) {
            res.status(404).json({ message: "Aula no encontrada" });
            return;
        }
        res.status(200).json(updatedClassroom);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};