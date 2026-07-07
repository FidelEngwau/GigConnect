import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';

const ProfessionalDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Employers see only their own jobs because the backend uses req.user.id.
    api
      .get('/jobs/employer/my-jobs')
      .then((res) => setJobs(res.data.jobs))
      .finally(() => setLoading(false));
  }, []);

  // Count open postings for the summary card.
  const open = jobs.filter((job) => job.status === 'open').length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Professional Dashboard</h1>
        <Link className="btn btn-primary" to="/professional/gigs/new">
          Post Gig
        </Link>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="stat-card"><span>Total gigs</span><strong>{jobs.length}</strong></div>
            </div>
            <div className="col-md-6">
              <div className="stat-card"><span>Open gigs</span><strong>{open}</strong></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header fw-semibold">Latest Gigs</div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <tbody>
                  {jobs.slice(0, 6).map((job) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.location}</td>
                      <td>{job.status}</td>
                    </tr>
                  ))}
                  {!jobs.length && <tr><td className="text-primary">No gigs posted yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfessionalDashboard;
