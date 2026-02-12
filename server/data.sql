CREATE DATABASE collabrationapp;

CREATE TABLE notification (
    notificationID char(50),
    text char(255),
    dateGenerated TIMESTAMP not null,
    primary key (notificationID)
);

CREATE TABLE appUser (
    userID char(50) primary key,
    password VARCHAR(255) not null,
    firstName CHAR(50) NOT NULL,
    lastName CHAR(50) NOT NULL,
    email VARCHAR(255) not null unique
);

CREATE TABLE ProjectManager (
    UserID CHAR(50),
    PermissionID CHAR(50) NOT NULL,
    PRIMARY KEY (UserID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE Member (
    UserID CHAR(50),
    Role CHAR(50),
    PRIMARY KEY (UserID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE Project (
	ProjectID CHAR(50),
    ProjectName CHAR(50) NOT NULL,
    Description CHAR(255),
    Status CHAR(1),
    Time TIMESTAMP,
    PRIMARY KEY (ProjectID),
    UNIQUE (ProjectName)
);


CREATE TABLE CollaborationRequest (
    RequestID CHAR(50),
    UserID CHAR(50) NOT NULL,
    ProjectID CHAR(50) NOT NULL,
    Status CHAR(1),
    PRIMARY KEY (RequestID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
    ON DELETE CASCADE
);

CREATE TABLE Task (
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

CREATE TABLE MeetupEvent (
    MeetupEventID CHAR(50),
    ProjectID CHAR(50) NOT NULL,
    Location CHAR(50),
    Time TIMESTAMP,
    UserID CHAR(50) NOT NULL,
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE Poll (
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

CREATE TABLE VoteHas (
    VoteID CHAR(50),
    PollID CHAR(50),
    selection CHAR(50) NOT NULL,
    PRIMARY KEY (VoteID, PollID),
    FOREIGN KEY (PollID) REFERENCES Poll(PollID)
    ON DELETE CASCADE
);

CREATE TABLE TaskComment_Contains (
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

CREATE TABLE Receives (
    NotificationID CHAR(50),
    UserID CHAR(50),
    PRIMARY KEY (NotificationID, UserID),
    FOREIGN KEY (NotificationID) REFERENCES Notification(NotificationID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE Acquires (
    UserID CHAR(50),
    RequestID CHAR(50),
    PRIMARY KEY (UserID, RequestID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RequestID) REFERENCES CollaborationRequest(RequestID)
    ON DELETE CASCADE
);

CREATE TABLE WorksOn (
    ProjectID CHAR(50),
    UserID CHAR(50),
    PRIMARY KEY (ProjectID, UserID),
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES appUser(UserID)
    ON DELETE CASCADE
);

CREATE TABLE Makes (
    UserID CHAR(50),
    VoteID CHAR(50),
    PollID CHAR(50),
    PRIMARY KEY (UserID, VoteID),
    FOREIGN KEY (UserID) REFERENCES appUser(UserID) ON DELETE CASCADE,
    FOREIGN KEY (VoteID, PollID) REFERENCES VoteHas(VoteID, PollID)
    ON DELETE CASCADE
);

INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N1', 'Notification text 1', TIMESTAMP '2024-03-20 10:00:00');
INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N2', 'Notification text 2', TIMESTAMP '2024-03-21 09:30:00');
INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N3', 'Notification text 3', TIMESTAMP '2024-03-22 14:45:00');
INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N4', 'Notification text 4', TIMESTAMP '2024-03-23 15:00:00');
INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N5', 'Notification text 5', TIMESTAMP '2024-03-24 11:20:00');

INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N6', 'Notification text 6', TIMESTAMP '2024-03-25 11:20:21');
INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N7', 'Notification text 7', TIMESTAMP '2024-03-25 11:20:22');
INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N8', 'Notification text 8', TIMESTAMP '2024-03-25 11:20:23');
INSERT INTO notification (notificationID, text, dateGenerated) VALUES ('N9', 'Notification text 9', TIMESTAMP '2024-03-25 11:20:24');

INSERT INTO appUser (userID, password, firstName, lastName, email) VALUES ('U1','|Rs22G22', 'Jeff', 'White', 'user1@example.com');
INSERT INTO appUser (userID, password, firstName, lastName, email) VALUES ('U2','3>>L9oL3', 'Jessica', 'Lin', 'user2@example.com');
INSERT INTO appUser (userID, password, firstName, lastName, email) VALUES ('U3', '0P7g=7L|', 'Caroline', 'Henderson', 'user3@example.com');
INSERT INTO appUser (userID, password, firstName, lastName, email) VALUES ('U4', 'xD9531"<', 'Michael', 'Tanner', 'user4@example.com');
INSERT INTO appUser (userID, password, firstName, lastName, email) VALUES ('U5', 'Cs949(6i', 'Rachel', 'Farley', 'user5@example.com');

INSERT INTO ProjectManager (UserID, PermissionID) VALUES ('U1', 'Permission1');
INSERT INTO ProjectManager (UserID, PermissionID) VALUES ('U2', 'Permission2');
INSERT INTO ProjectManager (UserID, PermissionID) VALUES ('U3', 'Permission3');

INSERT INTO Member (UserID, Role) VALUES ('U4', 'Role4');
INSERT INTO Member (UserID, Role) VALUES ('U5', 'Role5');

INSERT INTO Project (ProjectID, ProjectName, Description, Status, Time) VALUES ('P1', 'Project 1', 'Desc1', 'T', TIMESTAMP '2024-03-20 10:00:00');
INSERT INTO Project (ProjectID, ProjectName, Description, Status, Time) VALUES ('P2', 'Project 2', 'Desc2', 'F', TIMESTAMP '2024-03-20 08:30:00');
INSERT INTO Project (ProjectID, ProjectName, Description, Status, Time) VALUES ('P3', 'Project 3', 'Desc3', 'T', TIMESTAMP '2024-03-20 12:00:00');
INSERT INTO Project (ProjectID, ProjectName, Description, Status, Time) VALUES ('P4', 'Project 4', 'Desc4', 'F', TIMESTAMP '2024-03-20 10:00:00');
INSERT INTO Project (ProjectID, ProjectName, Description, Status, Time) VALUES ('P5', 'Project 5', 'Desc5', 'T', TIMESTAMP '2024-03-20 11:59:59');

INSERT INTO CollaborationRequest (RequestID, UserID, ProjectID, Status) VALUES ('CR1', 'U1', 'P1', 'T');
INSERT INTO CollaborationRequest (RequestID, UserID, ProjectID, Status) VALUES ('CR2', 'U2', 'P2', 'F');
INSERT INTO CollaborationRequest (RequestID, UserID, ProjectID, Status) VALUES ('CR3', 'U3', 'P3', 'T');
INSERT INTO CollaborationRequest (RequestID, UserID, ProjectID, Status) VALUES ('CR4', 'U4', 'P4', 'F');
INSERT INTO CollaborationRequest (RequestID, UserID, ProjectID, Status) VALUES ('CR5', 'U5', 'P5', 'T');


INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T1', 'Task 1', 'P1', TIMESTAMP '2024-03-20 10:00:00', 'T', 'Task description 1', TIMESTAMP '2024-03-20 10:00:00');
INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T2', 'Task 2', 'P2', TIMESTAMP '2024-03-21 09:30:00', 'F', 'Task description 2', TIMESTAMP '2024-03-21 09:30:00');
INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T3', 'Task 3', 'P3', TIMESTAMP '2024-03-22 14:45:00', 'T', 'Task description 3', TIMESTAMP '2024-03-22 14:45:00');
INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T4', 'Task 4', 'P4', TIMESTAMP '2024-03-23 15:00:00', 'F', 'Task description 4', TIMESTAMP '2024-03-23 15:00:00');
INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T5', 'Task 5', 'P5', TIMESTAMP '2024-03-24 11:20:00', 'T', 'Task description 5', TIMESTAMP '2024-03-23 12:00:00');

INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T6', 'Task 6', 'P1', TIMESTAMP '2024-04-30 11:20:00', 'T', 'Task description 6', TIMESTAMP '2024-03-24 12:00:00');
INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T7', 'Task 7', 'P1', TIMESTAMP '2024-04-30 11:20:00', 'T', 'Task description 7', TIMESTAMP '2024-03-24 12:00:00');
INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T8', 'Task 8', 'P1', TIMESTAMP '2024-04-30 11:20:00', 'T', 'Task description 8', TIMESTAMP '2024-03-24 12:00:00');
INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T9', 'Task 9', 'P1', TIMESTAMP '2024-04-30 11:20:00', 'T', 'Task description 9', TIMESTAMP '2024-03-24 12:00:00');
INSERT INTO Task (TaskID, TaskName, ProjectID, DueDate, Status, Description, CreateTime) VALUES ('T10', 'Task 10', 'P1', TIMESTAMP '2024-04-30 11:20:00', 'T', 'Task description 10', TIMESTAMP '2024-03-24 12:00:00');

INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPRICHMOND1', 'P1', 'Richmond', TIMESTAMP '2024-03-20 10:00:00', 'U1');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPRICHMOND1', 'P1', 'Richmond', TIMESTAMP '2024-03-20 10:00:00', 'U2');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPRICHMOND1', 'P1', 'Richmond', TIMESTAMP '2024-03-20 10:00:00', 'U3');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPRICHMOND2', 'P1', 'Richmond', TIMESTAMP '2024-03-20 10:00:00', 'U1');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPUBC1', 'P2', 'UBC', TIMESTAMP '2024-03-21 09:30:00', 'U4');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPUBC1', 'P2', 'UBC', TIMESTAMP '2024-03-21 09:30:00', 'U5');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPDOWNTOWN1', 'P3', 'Downtown', TIMESTAMP '2024-03-22 14:45:00', 'U4');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPDOWNTOWN2', 'P3', 'Downtown', TIMESTAMP '2024-03-22 14:45:00', 'U5');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPBURNABY1', 'P3', 'Burnaby', TIMESTAMP '2024-03-23 15:00:00', 'U4');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPUBC2', 'P4', 'UBCV/UBCO', TIMESTAMP '2024-03-27 15:00:00', 'U4');
INSERT INTO MeetupEvent (MeetupEventID, ProjectID, Location, Time, UserID) VALUES ('MEETUPUBC3', 'P4', 'UBCV/UBCO', TIMESTAMP '2024-03-27 19:00:00', 'U4');


INSERT INTO Poll (PollID, ProjectID, Topic, OptionA, OptionB, OptionC, OptionD) VALUES ('Poll1', 'P1', 'Poll topic 1', 'Option A1', 'Option B1', 'Option C1', 'Option D1');
INSERT INTO Poll (PollID, ProjectID, Topic, OptionA, OptionB, OptionC, OptionD) VALUES ('Poll2', 'P2', 'Poll topic 2', 'Option A2', 'Option B2', 'Option C2', 'Option D2');
INSERT INTO Poll (PollID, ProjectID, Topic, OptionA, OptionB, OptionC, OptionD) VALUES ('Poll3', 'P3', 'Poll topic 3', 'Option A3', 'Option B3', 'Option C3', 'Option D3');
INSERT INTO Poll (PollID, ProjectID, Topic, OptionA, OptionB, OptionC, OptionD) VALUES ('Poll4', 'P4', 'Poll topic 4', 'Option A4', 'Option B4', 'Option C4', 'Option D4');
INSERT INTO Poll (PollID, ProjectID, Topic, OptionA, OptionB, OptionC, OptionD) VALUES ('Poll5', 'P5', 'Poll topic 5', 'Option A5', 'Option B5', 'Option C5', 'Option D5');


INSERT INTO VoteHas (VoteID, PollID, selection) VALUES ('Vote1', 'Poll1', 'Option A1');
INSERT INTO VoteHas (VoteID, PollID, selection) VALUES ('Vote2', 'Poll2', 'Option A2');
INSERT INTO VoteHas (VoteID, PollID, selection) VALUES ('Vote3', 'Poll3', 'Option A3');
INSERT INTO VoteHas (VoteID, PollID, selection) VALUES ('Vote4', 'Poll4', 'Option A4');
INSERT INTO VoteHas (VoteID, PollID, selection) VALUES ('Vote5', 'Poll5', 'Option A5');


INSERT INTO TaskComment_Contains (CommentID, TaskID, dateGenerated, Text, UserID) VALUES ('Comment1', 'T1', TIMESTAMP '2024-03-20 10:00:00', 'Comment text 1', 'U1');
INSERT INTO TaskComment_Contains (CommentID, TaskID, dateGenerated, Text, UserID) VALUES ('Comment2', 'T2', TIMESTAMP '2024-03-21 09:30:00', 'Comment text 2', 'U2');
INSERT INTO TaskComment_Contains (CommentID, TaskID, dateGenerated, Text, UserID) VALUES ('Comment3', 'T3', TIMESTAMP '2024-03-22 14:45:00', 'Comment text 3', 'U3');
INSERT INTO TaskComment_Contains (CommentID, TaskID, dateGenerated, Text, UserID) VALUES ('Comment4', 'T4', TIMESTAMP '2024-03-23 15:00:00', 'Comment text 4', 'U4');
INSERT INTO TaskComment_Contains (CommentID, TaskID, dateGenerated, Text, UserID) VALUES ('Comment5', 'T5', TIMESTAMP '2024-03-24 11:20:00', 'Comment text 5', 'U5');


INSERT INTO Receives (NotificationID, UserID) VALUES ('N1', 'U1');
INSERT INTO Receives (NotificationID, UserID) VALUES ('N2', 'U2');
INSERT INTO Receives (NotificationID, UserID) VALUES ('N3', 'U3');
INSERT INTO Receives (NotificationID, UserID) VALUES ('N4', 'U4');
INSERT INTO Receives (NotificationID, UserID) VALUES ('N5', 'U5');


INSERT INTO Acquires (UserID, RequestID) VALUES ('U1', 'CR1');
INSERT INTO Acquires (UserID, RequestID) VALUES ('U2', 'CR2');
INSERT INTO Acquires (UserID, RequestID) VALUES ('U3', 'CR3');
INSERT INTO Acquires (UserID, RequestID) VALUES ('U4', 'CR4');
INSERT INTO Acquires (UserID, RequestID) VALUES ('U5', 'CR5');


INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P1', 'U1');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P2', 'U1');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P3', 'U1');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P4', 'U1');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P5', 'U1');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P1', 'U2');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P2', 'U2');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P3', 'U2');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P4', 'U2');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P5', 'U2');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P1', 'U3');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P2', 'U3');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P3', 'U3');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P4', 'U3');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P5', 'U3');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P4', 'U4');
INSERT INTO WorksOn (ProjectID, UserID) VALUES ('P5', 'U5');


INSERT INTO Makes (UserID, VoteID, PollID) VALUES ('U1', 'Vote1', 'Poll1');
INSERT INTO Makes (UserID, VoteID, PollID) VALUES ('U2', 'Vote2', 'Poll2');
INSERT INTO Makes (UserID, VoteID, PollID) VALUES ('U3', 'Vote3', 'Poll3');
INSERT INTO Makes (UserID, VoteID, PollID) VALUES ('U4', 'Vote4', 'Poll4');
INSERT INTO Makes (UserID, VoteID, PollID) VALUES ('U5', 'Vote5', 'Poll5');
