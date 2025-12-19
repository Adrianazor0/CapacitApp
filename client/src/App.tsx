import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { TeachersPage } from './pages/TeachersPage';
import { GroupsPage } from "./pages/GroupsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { ClassroomsPage } from "./pages/ClassroomsPage";
import { GroupDetailsPage } from './pages/GroupDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { FinancePage } from './pages/FinancePage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/classrooms" element={<ClassroomsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailsPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/finances" element={<FinancePage />} />
          </Route>
        </Route>

      </Routes>
    </AuthProvider>
  );
}

export default App;