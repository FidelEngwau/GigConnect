import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Each role gets a different sidebar menu.
const navItems = {
  graduate: [
    ['Dashboard', '/graduate'],
    ['Profile', '/graduate/profile'],
    ['Applications', '/graduate/applications'],
    ['Browse Gigs', '/gigs']
  ],
  professional: [
    ['Dashboard', '/professional'],
    ['Company Profile', '/professional/profile'],
    ['Post Gig', '/professional/gigs/new'],
    ['My Gigs', '/professional/gigs']
  ],
  admin: [
    ['Overview', '/admin'],
    ['Users', '/admin/users'],
    ['Gigs', '/admin/gigs'],
    ['Applications', '/admin/applications']
  ]
};

const DashboardLayout = () => {
  const { user } = useAuth();
  // ProtectedRoute guarantees a user exists before this layout renders.
  const items = navItems[user.role] || [];

  return (
    <main className="dashboard-shell">
      <div className="container py-4">
        <div className="row g-4">
          <aside className="col-lg-3">
            <div className="list-group dashboard-nav">
              {items.map(([label, to]) => (
                // NavLink automatically adds an active class when the URL matches.
                <NavLink key={to} className="list-group-item list-group-item-action" to={to} end>
                  {label}
                </NavLink>
              ))}
            </div>
          </aside>
          <section className="col-lg-9">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;
