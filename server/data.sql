CREATE DATABASE collabrationapp;

CREATE TABLE tasks (
    project_id VARCHAR(255),
    project_title VARCHAR(63),
    task_id VARCHAR(255),
    task_title VARCHAR(63),
    task_description VARCHAR(1023),
    assigned_to VARCHAR(255),
    progress INT,
    date VARCHAR(300)
    );

CREATE TABLE users (
    email VARCHAR(255),
    project_id VARCHAR(255)
);

