import { Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import BrowseJobs from './pages/BrowseJobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import GraduateDashboard from './pages/JobSeekerDashboard';
import GraduateProfile from './pages/JobSeekerProfile';
import MyApplications from './pages/MyApplications';
import ApplyGig from './pages/ApplyJob';
import ProfessionalDashboard from './pages/EmployerDashboard';
import ProfessionalProfile from './pages/EmployerProfile';
import JobForm from './pages/JobForm';
import MyGigs from './pages/MyJobs';
import ViewApplicants from './pages/ViewApplicants';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageJobs from './pages/ManageJobs';
import ManageApplications from './pages/ManageApplications';
import NotFound from './pages/NotFound';

// App declares every route in the frontend.
// Public routes are listed first; protected route groups are wrapped by role checks.
const App = () => (
  <>
    <AppNavbar />
    <Routes>
      {/* Public pages available to visitors and logged-in users. */}
      <Route path="/" element={<Home />} />
      <Route path="/gigs" element={<BrowseJobs />} />
      <Route path="/gigs/:id" element={<JobDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Graduate routes. ProtectedRoute blocks unauthenticated users and wrong roles. */}
      <Route element={<ProtectedRoute roles={['graduate']} />}>
        <Route path="/gigs/:id/apply" element={<ApplyGig />} />
        <Route element={<DashboardLayout />}>
          <Route path="/graduate" element={<GraduateDashboard />} />
          <Route path="/graduate/profile" element={<GraduateProfile />} />
          <Route path="/graduate/applications" element={<MyApplications />} />
        </Route>
      </Route>

      {/* Professional-only dashboard and gig management routes. */}
      <Route element={<ProtectedRoute roles={['professional']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/professional" element={<ProfessionalDashboard />} />
          <Route path="/professional/profile" element={<ProfessionalProfile />} />
          <Route path="/professional/gigs" element={<MyGigs />} />
          <Route path="/professional/gigs/new" element={<JobForm />} />
          <Route path="/professional/gigs/:id/edit" element={<JobForm mode="edit" />} />
          <Route path="/professional/gigs/:id/applicants" element={<ViewApplicants />} />
        </Route>
      </Route>

      {/* Admin-only management routes. */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/gigs" element={<ManageJobs />} />
          <Route path="/admin/applications" element={<ManageApplications />} />
        </Route>
      </Route>

      {/* Fallback route for unknown URLs. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
