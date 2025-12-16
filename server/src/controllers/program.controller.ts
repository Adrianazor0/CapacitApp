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

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProgram = await Program.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProgram) return res.status(404).json({ message: "Programa no encontrado" });
    res.json(updatedProgram);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Eliminar (Soft Delete) - Cambiar estado a inactivo
export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const program = await Program.findById(id);
    if (!program) return res.status(404).json({ message: "Programa no encontrado" });

    // Invertimos el estado (si es true pasa a false, y viceversa)
    program.isActive = !program.isActive;
    await program.save();
    
    res.json({ message: `Programa ${program.isActive ? 'activado' : 'desactivado'} correctamente` });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};