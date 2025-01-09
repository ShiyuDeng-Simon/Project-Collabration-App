CREATE DATABASE collabrationapp;


CREATE TABLE appUser (
    userID char(50) primary key,
    firstName CHAR(50) NOT NULL,
    lastName CHAR(50) NOT NULL,
    email char(50) not null unique
);


CREATE TABLE project (
	ProjectID CHAR(50),
    ProjectName CHAR(50) NOT NULL,
    Description CHAR(255),
    Status CHAR(1),
    Time TIMESTAMP,
    PRIMARY KEY (ProjectID),
    UNIQUE (ProjectName)
);


CREATE TABLE task (
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


CREATE TABLE worksOn (
    ProjectID CHAR(50),
    UserID CHAR(50),
    PRIMARY KEY (ProjectID, UserID),
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);
