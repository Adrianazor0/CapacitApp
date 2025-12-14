import { Request, Response } from "express";
import { Group } from '../models/Group';

export const getGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const groups = await Group.find()
            .populate('program', 'name type' )
            .populate('teacher', 'firstName lastName')
            .populate('classroom', 'name location')
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const newGroup = new Group(req.body);
        const saved = await newGroup.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};