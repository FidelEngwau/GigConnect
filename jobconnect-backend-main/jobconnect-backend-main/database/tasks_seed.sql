-- Optional sample data so you can test the "Submit work" screen right away.
-- Run after tasks_schema.sql. Assumes the default seed accounts from seed.sql exist
-- (employer1@jobconnect.com as the client, seeker1@jobconnect.com as the worker).
-- Usage: mysql -u root -p jobconnect < database/tasks_seed.sql

USE jobconnect;

INSERT INTO tasks (employer_id, worker_id, title, description, due_at, status)
SELECT employer.id, worker.id, 'NGO Social Graphics',
       'Design 4 social media graphics for the NGO campaign.',
       DATE_ADD(NOW(), INTERVAL 4 HOUR), 'open'
FROM
  (SELECT id FROM users WHERE email = 'employer1@jobconnect.com' LIMIT 1) AS employer,
  (SELECT id FROM users WHERE email = 'seeker1@jobconnect.com' LIMIT 1) AS worker;
