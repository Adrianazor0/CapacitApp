import expres,  {Application, Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import programRoutes from './routes/program.routes';
import studentRoutes from './routes/student.routes';
import groupRoutes from './routes/group.routes';
import teacherRoutes from './routes/teacher.routes';
import classroomRoutes from './routes/classroom.routes';
import authRoutes from './routes/auth.routes';
import financeRoutes from './routes/finance.routes'; 
import reportRoutes from './routes/report.routes';
import academicRoutes from './routes/academic.routes';


dotenv.config();
const app: Application = expres();
const PORT = Number(process.env.PORT) || 4000;

connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(expres.json());

app.get('/', (req: Request, res: Response) => { 
    res.send('API TS running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/academic', academicRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
