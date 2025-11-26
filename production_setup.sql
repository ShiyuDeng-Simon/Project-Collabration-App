-- 1. Base Schema (from data.sql)
-- Removed CREATE DATABASE to avoid errors in Cloud SQL

CREATE TABLE IF NOT EXISTS notification (
    notificationID char(50),
    text char(255),
    dateGenerated TIMESTAMP not null,
    primary key (notificationID)
);

CREATE TABLE IF NOT EXISTS appUser (
    userID char(50) primary key,
    password char(50) not null,
    firstName CHAR(50) NOT NULL,
    lastName CHAR(50) NOT NULL,
    email char(50) not null unique
);

CREATE TABLE IF NOT EXISTS ProjectManager (
    UserID CHAR(50),
    PermissionID CHAR(50) NOT NULL,
    PRIMARY KEY (UserID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Member (
    UserID CHAR(50),
    Role CHAR(50),
    PRIMARY KEY (UserID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Project (
	ProjectID CHAR(50),
    ProjectName CHAR(50) NOT NULL,
    Description CHAR(255),
    Status CHAR(1),
    Time TIMESTAMP,
    PRIMARY KEY (ProjectID),
    UNIQUE (ProjectName)
);


CREATE TABLE IF NOT EXISTS CollaborationRequest (
    RequestID CHAR(50),
    UserID CHAR(50) NOT NULL,
    ProjectID CHAR(50) NOT NULL,
    Status CHAR(1),
    PRIMARY KEY (RequestID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Task (
    TaskID CHAR(50),
    TaskName CHAR(50) NOT NULL,
    ProjectID CHAR(50) NOT NULL,
    DueDate TIMESTAMP,
    Status CHAR(1),
    Description CHAR(255),
    CreateTime TIMESTAMP,
    PRIMARY KEY (TaskID),
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MeetupEvent (
    MeetupEventID CHAR(50),
    ProjectID CHAR(50) NOT NULL,
    Location CHAR(50),
    Time TIMESTAMP,
    UserID CHAR(50) NOT NULL,
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Poll (
    PollID CHAR(50),
    ProjectID CHAR(50) NOT NULL,
    Topic CHAR(255) NOT NULL,
    OptionA CHAR(50),
    OptionB CHAR(50),
    OptionC CHAR(50),
    OptionD CHAR(50),
    PRIMARY KEY (PollID),
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS VoteHas (
    VoteID CHAR(50),
    PollID CHAR(50),
    selection CHAR(50) NOT NULL,
    PRIMARY KEY (VoteID, PollID),
    FOREIGN KEY (PollID) REFERENCES Poll(PollID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS TaskComment_Contains (
    CommentID CHAR(50),
    TaskID CHAR(50),
    dateGenerated TIMESTAMP,
    Text CHAR(255),
    UserID CHAR(50) NOT NULL,
    PRIMARY KEY (CommentID, TaskID),
    FOREIGN KEY (TaskID) REFERENCES Task(TaskID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Receives (
    NotificationID CHAR(50),
    UserID CHAR(50),
    PRIMARY KEY (NotificationID, UserID),
    FOREIGN KEY (NotificationID) REFERENCES notification(notificationID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Acquires (
    UserID CHAR(50),
    RequestID CHAR(50),
    PRIMARY KEY (UserID, RequestID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RequestID) REFERENCES CollaborationRequest(RequestID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS WorksOn (
    ProjectID CHAR(50),
    UserID CHAR(50),
    PRIMARY KEY (ProjectID, UserID),
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Makes (
    UserID CHAR(50),
    VoteID CHAR(50),
    PollID CHAR(50),
    PRIMARY KEY (UserID, VoteID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID) ON DELETE CASCADE,
    FOREIGN KEY (VoteID, PollID) REFERENCES VoteHas(VoteID, PollID)
    ON DELETE CASCADE
);

-- 2. Migrations (from 001_unicolab_schema.sql)

-- Update Project table to match new requirements
ALTER TABLE Project 
  ADD COLUMN IF NOT EXISTS ownerId VARCHAR(50),
  ADD COLUMN IF NOT EXISTS startDate TIMESTAMP,
  ADD COLUMN IF NOT EXISTS endDate TIMESTAMP;

-- Rename ProjectName to title for consistency
ALTER TABLE Project RENAME COLUMN ProjectName TO title;
ALTER TABLE Project ALTER COLUMN title TYPE VARCHAR(255);
ALTER TABLE Project ALTER COLUMN Description TYPE TEXT;

-- Update Status to use Planning, Active, Completed instead of T/F
ALTER TABLE Project ALTER COLUMN Status TYPE VARCHAR(20);
UPDATE Project SET Status = 'Active' WHERE Status = 'T';
UPDATE Project SET Status = 'Completed' WHERE Status = 'F';
UPDATE Project SET Status = 'Planning' WHERE Status IS NULL OR Status = '';

-- Update Task table to match new requirements
ALTER TABLE Task 
  ADD COLUMN IF NOT EXISTS assigneeId VARCHAR(50),
  ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium';

-- Rename TaskName to title
ALTER TABLE Task RENAME COLUMN TaskName TO title;
ALTER TABLE Task ALTER COLUMN title TYPE VARCHAR(255);
ALTER TABLE Task ALTER COLUMN Description TYPE TEXT;
ALTER TABLE Task RENAME COLUMN DueDate TO deadline;
ALTER TABLE Task RENAME COLUMN CreateTime TO createdAt;

-- Update Task Status to use To Do, In Progress, Complete
ALTER TABLE Task ALTER COLUMN Status TYPE VARCHAR(20);
UPDATE Task SET Status = 'To Do' WHERE Status = 'F' OR Status IS NULL;
UPDATE Task SET Status = 'Complete' WHERE Status = 'T';
UPDATE Task SET Status = 'In Progress' WHERE Status NOT IN ('To Do', 'Complete', 'In Progress');

-- Add foreign key for assigneeId
ALTER TABLE Task 
  ADD CONSTRAINT task_assignee_fkey 
  FOREIGN KEY (assigneeId) REFERENCES appUser(userID) ON DELETE SET NULL;

-- Add foreign key for ownerId
ALTER TABLE Project 
  ADD CONSTRAINT project_owner_fkey 
  FOREIGN KEY (ownerId) REFERENCES appUser(userID) ON DELETE CASCADE;

-- Create ProjectMember table for tracking project memberships
CREATE TABLE IF NOT EXISTS ProjectMember (
  projectId VARCHAR(50) NOT NULL,
  userId VARCHAR(50) NOT NULL,
  role VARCHAR(20) DEFAULT 'Member',
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (projectId, userId),
  FOREIGN KEY (projectId) REFERENCES Project(ProjectID) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES appUser(userID) ON DELETE CASCADE
);

-- Create ProjectInvitation table for managing invitations
CREATE TABLE IF NOT EXISTS ProjectInvitation (
  invitationId VARCHAR(50) PRIMARY KEY,
  projectId VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  invitedBy VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES Project(ProjectID) ON DELETE CASCADE,
  FOREIGN KEY (invitedBy) REFERENCES appUser(userID) ON DELETE CASCADE
);

-- Create TaskComment table (update existing if needed)
CREATE TABLE IF NOT EXISTS TaskComment (
  commentId VARCHAR(50) PRIMARY KEY,
  taskId VARCHAR(50) NOT NULL,
  authorId VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taskId) REFERENCES Task(TaskID) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES appUser(userID) ON DELETE CASCADE
);

-- Migrate existing TaskComment_Contains data if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'taskcomment_contains') THEN
    INSERT INTO TaskComment (commentId, taskId, authorId, content, createdAt)
    SELECT CommentID, TaskID, UserID, Text, dateGenerated
    FROM TaskComment_Contains
    ON CONFLICT (commentId) DO NOTHING;
  END IF;
END $$;

-- Migrate existing WorksOn data to ProjectMember
INSERT INTO ProjectMember (projectId, userId, role, joinedAt)
SELECT ProjectID, UserID, 'Member', CURRENT_TIMESTAMP
FROM WorksOn
ON CONFLICT (projectId, userId) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_project ON Task(ProjectID);
CREATE INDEX IF NOT EXISTS idx_task_assignee ON Task(assigneeId);
CREATE INDEX IF NOT EXISTS idx_task_status ON Task(Status);
CREATE INDEX IF NOT EXISTS idx_project_owner ON Project(ownerId);
CREATE INDEX IF NOT EXISTS idx_project_member ON ProjectMember(projectId, userId);
CREATE INDEX IF NOT EXISTS idx_comment_task ON TaskComment(taskId);
CREATE INDEX IF NOT EXISTS idx_invitation_project ON ProjectInvitation(projectId);
CREATE INDEX IF NOT EXISTS idx_invitation_email ON ProjectInvitation(email);

-- Fix appUser column lengths (password hash is 60 chars, CHAR(50) is too small)
ALTER TABLE appUser ALTER COLUMN password TYPE VARCHAR(255);
ALTER TABLE appUser ALTER COLUMN email TYPE VARCHAR(255);
ALTER TABLE appUser ALTER COLUMN firstName TYPE VARCHAR(255);
ALTER TABLE appUser ALTER COLUMN lastName TYPE VARCHAR(255);