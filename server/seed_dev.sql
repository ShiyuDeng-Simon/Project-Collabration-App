-- Seed data for local development (post-migration schema).
-- Usage:
--   psql -U $USER -d collabrationapp -v owner_email='you@example.com' -f server/seed_dev.sql
--
-- This script adds a few projects, tasks, members, comments, and invitations
-- tied to the user with email = :owner_email. If that user doesn't exist,
-- inserts will be no-ops.

\set ON_ERROR_STOP on
\if :{?owner_email}
\else
\set owner_email 'you@example.com'
\endif

-- Create a few additional users to act as teammates (passwords are placeholders).
INSERT INTO appUser (userID, password, firstName, lastName, email) VALUES
  ('9b6c7f0a-2f2a-4c51-9b62-2b2f1f2c3d01', '$2b$10$placeholderhashteammate1', 'Ava', 'Reed', 'ava.reed@example.com'),
  ('4d2d9b1e-3c6e-4e1c-8b0f-1a2b3c4d5e02', '$2b$10$placeholderhashteammate2', 'Liam', 'Patel', 'liam.patel@example.com'),
  ('c1f5a0a9-6a2a-4c9e-9f0b-7a8b9c0d1e03', '$2b$10$placeholderhashteammate3', 'Maya', 'Chen', 'maya.chen@example.com')
ON CONFLICT (email) DO NOTHING;

-- Resolve owner userId from email
WITH owner AS (
  SELECT userID FROM appUser WHERE email = :'owner_email'
)
INSERT INTO Project (ProjectID, title, Description, Status, Time, ownerId, startDate, endDate)
SELECT *
FROM (
  SELECT '11111111-1111-4111-8111-111111111111'::char(50),
         'Capstone Tracker'::varchar,
         'Track milestones, risks, and weekly updates for the capstone project.'::text,
         'Active'::varchar,
         NOW() - INTERVAL '12 days',
         owner.userID,
         NOW() - INTERVAL '20 days',
         NOW() + INTERVAL '40 days'
  FROM owner
  UNION ALL
  SELECT '22222222-2222-4222-8222-222222222222'::char(50),
         'Marketing Launch'::varchar,
         'Launch planning for the spring campaign with content and ad deliverables.'::text,
         'Planning'::varchar,
         NOW() - INTERVAL '6 days',
         owner.userID,
         NOW() - INTERVAL '5 days',
         NOW() + INTERVAL '25 days'
  FROM owner
  UNION ALL
  SELECT '33333333-3333-4333-8333-333333333333'::char(50),
         'Mobile App Refresh'::varchar,
         'UI refresh and performance improvements for the mobile app.'::text,
         'Active'::varchar,
         NOW() - INTERVAL '25 days',
         owner.userID,
         NOW() - INTERVAL '30 days',
         NOW() + INTERVAL '15 days'
  FROM owner
) AS seeded
ON CONFLICT (ProjectID) DO NOTHING;

-- Add members (including owner) to ProjectMember
WITH owner AS (
  SELECT userID FROM appUser WHERE email = :'owner_email'
)
INSERT INTO ProjectMember (projectId, userId, role, joinedAt)
SELECT * FROM (
  SELECT '11111111-1111-4111-8111-111111111111', owner.userID, 'Owner', NOW() - INTERVAL '12 days' FROM owner
  UNION ALL
  SELECT '11111111-1111-4111-8111-111111111111', '9b6c7f0a-2f2a-4c51-9b62-2b2f1f2c3d01', 'Member', NOW() - INTERVAL '10 days'
  UNION ALL
  SELECT '11111111-1111-4111-8111-111111111111', '4d2d9b1e-3c6e-4e1c-8b0f-1a2b3c4d5e02', 'Member', NOW() - INTERVAL '9 days'
  UNION ALL
  SELECT '22222222-2222-4222-8222-222222222222', owner.userID, 'Owner', NOW() - INTERVAL '6 days' FROM owner
  UNION ALL
  SELECT '22222222-2222-4222-8222-222222222222', 'c1f5a0a9-6a2a-4c9e-9f0b-7a8b9c0d1e03', 'Member', NOW() - INTERVAL '5 days'
  UNION ALL
  SELECT '33333333-3333-4333-8333-333333333333', owner.userID, 'Owner', NOW() - INTERVAL '25 days' FROM owner
) AS seeded
ON CONFLICT (projectId, userId) DO NOTHING;

-- Seed tasks
WITH owner AS (
  SELECT userID FROM appUser WHERE email = :'owner_email'
)
INSERT INTO Task (TaskID, title, ProjectID, deadline, Status, Description, createdAt, assigneeId, progress, priority)
SELECT * FROM (
  SELECT 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
         'Kickoff notes and scope',
         '11111111-1111-4111-8111-111111111111',
         NOW() + INTERVAL '5 days',
         'In Progress',
         'Compile meeting notes and finalize scope.',
         NOW() - INTERVAL '11 days',
         owner.userID,
         40,
         'High'
  FROM owner
  UNION ALL
  SELECT 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
         'Risk register draft',
         '11111111-1111-4111-8111-111111111111',
         NOW() + INTERVAL '8 days',
         'To Do',
         'Identify top 10 risks and mitigations.',
         NOW() - INTERVAL '10 days',
         '9b6c7f0a-2f2a-4c51-9b62-2b2f1f2c3d01',
         0,
         'Medium'
  UNION ALL
  SELECT 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
         'Campaign brief',
         '22222222-2222-4222-8222-222222222222',
         NOW() + INTERVAL '12 days',
         'In Progress',
         'Write the campaign brief and target personas.',
         NOW() - INTERVAL '4 days',
         owner.userID,
         60,
         'High'
  FROM owner
  UNION ALL
  SELECT 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
         'Landing page copy',
         '22222222-2222-4222-8222-222222222222',
         NOW() + INTERVAL '18 days',
         'To Do',
         'Draft landing page copy and CTA variants.',
         NOW() - INTERVAL '3 days',
         'c1f5a0a9-6a2a-4c9e-9f0b-7a8b9c0d1e03',
         0,
         'Medium'
  UNION ALL
  SELECT 'ccccccc1-cccc-4ccc-8ccc-ccccccccccc1',
         'App performance audit',
         '33333333-3333-4333-8333-333333333333',
         NOW() + INTERVAL '4 days',
         'Complete',
         'Profile cold start and list top 5 wins.',
         NOW() - INTERVAL '24 days',
         '4d2d9b1e-3c6e-4e1c-8b0f-1a2b3c4d5e02',
         100,
         'High'
) AS seeded
ON CONFLICT (TaskID) DO NOTHING;

-- Seed comments
INSERT INTO TaskComment (commentId, taskId, authorId, content, createdAt) VALUES
  ('cmt-1111-1111-1111-111111111111', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '9b6c7f0a-2f2a-4c51-9b62-2b2f1f2c3d01', 'Added initial notes and flagged open questions.', NOW() - INTERVAL '9 days'),
  ('cmt-2222-2222-2222-222222222222', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'c1f5a0a9-6a2a-4c9e-9f0b-7a8b9c0d1e03', 'Draft is ready for review; left comments in section 3.', NOW() - INTERVAL '2 days'),
  ('cmt-3333-3333-3333-333333333333', 'ccccccc1-cccc-4ccc-8ccc-ccccccccccc1', '4d2d9b1e-3c6e-4e1c-8b0f-1a2b3c4d5e02', 'Perf audit done. Biggest win is image caching.', NOW() - INTERVAL '20 days')
ON CONFLICT (commentId) DO NOTHING;

-- Seed invitations
INSERT INTO ProjectInvitation (invitationId, projectId, email, invitedBy, status, createdAt) VALUES
  ('inv-1111-1111-1111-111111111111', '11111111-1111-4111-8111-111111111111', 'new.teammate@example.com', '9b6c7f0a-2f2a-4c51-9b62-2b2f1f2c3d01', 'Pending', NOW() - INTERVAL '1 day'),
  ('inv-2222-2222-2222-222222222222', '22222222-2222-4222-8222-222222222222', 'designer@example.com', 'c1f5a0a9-6a2a-4c9e-9f0b-7a8b9c0d1e03', 'Accepted', NOW() - INTERVAL '7 days')
ON CONFLICT (invitationId) DO NOTHING;

