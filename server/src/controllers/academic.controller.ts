import { Request, Response } from 'express';
import { Enrollment } from '../models/Enrollment';

export const takeAttendance = async (req: Request, res: Response) => {
  try {
    const { groupId, date, records } = req.body; // records: [{ enrollmentId, status }]
    
    // Normalizamos la fecha de entrada (para comparar solo día, mes y año)
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    for (const record of records) {
        const enrollment = await Enrollment.findById(record.enrollmentId);
        
        if (enrollment) {
            // Buscamos si ya existe un registro para HOY
            const existingIndex = enrollment.attendance.findIndex(entry => {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === inputDate.getTime();
            });

            if (existingIndex >= 0) {
                // CASO EDITAR: Si el maestro se equivocó, actualizamos el estado existente
                enrollment.attendance[existingIndex].status = record.status;
            } else {
                // CASO CREAR: No hay registro hoy, agregamos uno nuevo
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

// Cambiar Estado (Retirar Estudiante)
export const updateEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    const { enrollmentId, status } = req.body;
    await Enrollment.findByIdAndUpdate(enrollmentId, { status });
    res.json({ message: "Estado actualizado" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};