import { Request, Response } from "express";
import { Enrollment } from "../models/Enrollment";
import { Payment } from "../models/Payment";

export const enrollStudent = async (req: Request, res: Response) => {
    try {
        const { studentId, groupId } = req.body;
        const enrollment = new Enrollment( {student: studentId, group: groupId} )

        await enrollment.save()
        res.status(201).json(enrollment);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const addPayment = async (req: Request, res: Response) => {
    try {
        const { enrollmentId, amount, method} = req.body;
        const payment = new Payment( {enrollment: enrollmentId, amount, method});
        await payment.save();

        const enrollment = await Enrollment.findOne(payment.enrollment);
        if(enrollment) {
            enrollment.totalPaid += Number(amount);
            await enrollment.save()
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getGroupFinantials = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params
        const enrollments = await Enrollment.find({ group: groupId })
            .populate("student", "name lastname email");
        
        res.json(enrollments)
    } catch (error) {
        res.status(500).json({ message: (error as Error).message})
    }
}

export const addGrade = async (req: Request, res: Response) => {
  try {
    const { enrollmentId, note, value } = req.body;
    
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      res.status(404).json({ message: 'Inscripción no encontrada' });
      return;
    }

    enrollment.grades.push({ note, value: Number(value) });
    
    
    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getRecentTransactions = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find()
      .sort({ date: -1 })
      .limit(10)
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'student', select: 'name lastName' },
          { path: 'group', select: 'code', populate: { path: 'program', select: 'name' } }
        ]
      });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
