import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AlertMessage from '../components/AlertMessage';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadJobs = () => {
    // Fetch jobs owned by the logged-in employer.
    setLoading(true);
    api
      .get('/jobs/employer/my-jobs')
      .then((res) => setJobs(res.data.jobs))
      .catch((err) => setError(err.response?.data?.message || 'Could not load jobs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const deleteJob = async (id) => {
    // Browser confirmation prevents accidental deletion.
    if (!window.confirm('Delete this gig post?')) return;
    setMessage('');
    setError('');
    try {
      await api.delete(`/jobs/${id}`);
      setMessage('Gig deleted');
      loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete job');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">My Gigs</h1>
        <Link className="btn btn-primary" to="/professional/gigs/new">Post Gig</Link>
      </div>
      <AlertMessage type="success" message={message} />
      <AlertMessage message={error} />
      <div className="row g-3">
        {jobs.map((job) => (
          <div className="col-xl-6" key={job.id}>
            <JobCard
              job={job}
              actions={
                <>
                  <Link className="btn btn-outline-primary btn-sm" to={`/professional/gigs/${job.id}/edit`}>Edit</Link>
                  <Link className="btn btn-outline-secondary btn-sm" to={`/professional/gigs/${job.id}/applicants`}>Applicants</Link>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteJob(job.id)}>Delete</button>
                </>
              }
            />
          </div>
        ))}
        {!jobs.length && <p className="text-secondary">No jobs posted yet.</p>}
      </div>
    </div>
  );
};

export default MyJobs;
