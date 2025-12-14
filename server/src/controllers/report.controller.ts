import { Request, Response } from 'express';
import { Student } from '../models/Student';
import { Group } from '../models/Group';
import { Payment } from '../models/Payment';
import { Enrollment } from '../models/Enrollment';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const activeGroups = await Group.countDocuments({ status: 'Activo' });

    const revenueResult = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const debtResult = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'groups',
          localField: 'group',
          foreignField: '_id',
          as: 'groupInfo'
        }
      },
      { $unwind: '$groupInfo' },
      {
        $lookup: {
          from: 'programs',
          localField: 'groupInfo.program',
          foreignField: '_id',
          as: 'programInfo'
        }
      },
      { $unwind: '$programInfo' },
      {
        $project: {
          debt: { $max: [0, { $subtract: ['$programInfo.cost', '$totalPaid'] }] }
        }
      },
      {
        $group: {
          _id: null,
          totalDebt: { $sum: '$debt' }
        }
      }
    ]);
    const totalDebt = debtResult.length > 0 ? debtResult[0].totalDebt : 0;

    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'enrollment',
        populate: { path: 'student', select: 'name lastName' }
      });

    res.json({
      totalStudents,
      activeGroups,
      totalRevenue,
      totalDebt,
      recentPayments
    });

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};