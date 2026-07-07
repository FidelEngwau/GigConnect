import { useEffect, useState } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Stats come from count queries on the backend.
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const formatStatKey = (key) =>
    key
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3">
        <div>
          <h1 className="h3 mb-2">Admin Dashboard</h1>
          <p className="text-secondary mb-0">Quick summary of platform activity and user growth.</p>
        </div>
      </div>

      <div className="card admin-table-card">
        <div className="card-body p-0">
          <table className="table admin-stats-table mb-0">
            <tbody>
              {Object.entries(stats || {}).map(([key, value]) => (
                <tr key={key}>
                  <th>{formatStatKey(key)}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
