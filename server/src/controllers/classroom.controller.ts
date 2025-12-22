import { Request, Response } from 'express';
import { Classroom } from '../models/Classroom';

export const getClassrooms = async (req: Request, res: Response) => {
  try {
    const classrooms = await Classroom.find().sort({ name: 1 });
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createClassroom = async (req: Request, res: Response) => {
  try {
    const newClassroom = new Classroom(req.body);
    const saved = await newClassroom.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateClassroom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Classroom.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Aula no encontrada" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteClassroom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id);
    if (!classroom) return res.status(404).json({ message: "Aula no encontrada" });

    classroom.isActive = !classroom.isActive; // Toggle
    await classroom.save();
    
    res.json({ message: `Aula ${classroom.isActive ? 'activada' : 'desactivada'}` });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
