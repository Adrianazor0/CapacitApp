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

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Teacher.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Profesor no encontrado" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Desactivar (Soft Delete)
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) return res.status(404).json({ message: "Profesor no encontrado" });

    teacher.isActive = !teacher.isActive;
    await teacher.save();
    
    res.json({ message: `Profesor ${teacher.isActive ? 'activado' : 'desactivado'} correctamente` });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};