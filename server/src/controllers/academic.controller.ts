import { Request, Response } from 'express';
import { Enrollment } from '../models/Enrollment';

export const takeAttendance = async (req: Request, res: Response) => {
  try {
    const { groupId, date, records } = req.body;
    
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    for (const record of records) {
        const enrollment = await Enrollment.findById(record.enrollmentId);
        
        if (enrollment) {
            const existingIndex = enrollment.attendance.findIndex(entry => {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === inputDate.getTime();
            });

            if (existingIndex >= 0) {
                enrollment.attendance[existingIndex].status = record.status;
            } else {
                enrollment.attendance.push({ 
                    date: new Date(date), 
                    status: record.status 
                });
            }
            
            await enrollment.save();
        }
    }
    res.json({ message: "Asistencia procesada correctamente" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    const { enrollmentId, status } = req.body;
    await Enrollment.findByIdAndUpdate(enrollmentId, { status });
    res.json({ message: "Estado actualizado" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};