import { Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import TnaPage from './pages/TnaPage';
import BudgetPage from './pages/BudgetPage';
import TrainingPage from './pages/TrainingPage';
import CompetencyPage from './pages/CompetencyPage';
import AuditReadinessPage from './pages/AuditReadinessPage';
import DocumentCenterPage from './pages/DocumentCenterPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ImportDataPage from './pages/ImportDataPage';
import StaffRoute from './routes/StaffRoute';
import EmployeeTrainingHistoryPage from './pages/EmployeeTrainingHistoryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employee-training" element={<EmployeeTrainingHistoryPage />} />
          <Route path="/tna" element={<TnaPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/competency" element={<CompetencyPage />} />
          <Route path="/audit-readiness" element={<AuditReadinessPage />} />
          <Route path="/documents" element={<DocumentCenterPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/imports" element={<ImportDataPage />} />
          <Route element={<StaffRoute />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
