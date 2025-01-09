const PORT = process.env.PORT ?? 8000;
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express()
const pool = require('./db');

app.use(cors());
app.use(express.json());

// get all projects
app.get('/projects/:userEmail', async (req, res) => {
    const { userEmail } = req.params;
    
    try {
        const projects = await pool.query(
            `SELECT p.*, TRIM(p.ProjectName) as ProjectName, TRIM(p.Description) as Description 
             FROM project p
             JOIN worksOn w ON p.ProjectID = w.ProjectID
             JOIN appUser u ON w.UserID = u.userID
             WHERE TRIM(u.email) = $1`,
            [userEmail]
        );
        res.json(projects.rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch projects',
            details: err.message 
        });
    }
});

// Create or verify app user
app.post('/users', async (req, res) => {
    const { email, name } = req.body;
    const userID = uuidv4();
    
    try {
        // Input validation
        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }

        // Split full name into first and last name
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ') || ''; // Join remaining parts or empty string
        
        // First check if user exists
        const existingUser = await pool.query(
            'SELECT userID, TRIM(firstName) as firstName, TRIM(lastName) as lastName, TRIM(email) as email FROM appUser WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length === 0) {
            // User doesn't exist, create new user
            const newUser = await pool.query(
                `INSERT INTO appUser(userID, firstName, lastName, email) 
                 VALUES($1, $2, $3, $4) 
                 RETURNING userID, TRIM(firstName) as firstName, TRIM(lastName) as lastName, TRIM(email) as email`,
                [userID, firstName.substring(0, 50), lastName.substring(0, 50), email.substring(0, 50)]
            );
            res.json(newUser.rows[0]);
        } else {
            // User exists, return existing user
            res.json(existingUser.rows[0]);
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            error: 'Failed to create/verify user',
            details: err.message 
        });
    }
});

//create new task
app.post('/tasks', async (req, res) => {
    const { user_email, title, progress, date } = req.body;
    const id = uuidv4();
    try {
        const newTask = await pool.query('INSERT INTO task(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5);',
            [id, user_email, title, progress, date]);
        res.json(newTask);
    } catch (err) {
        console.error(err);
    }
})

// Create a new project
app.post('/projects', async (req, res) => {
    const { ProjectName, Description, Status, userEmail } = req.body;
    
    // Add input validation logging
    console.log('Received request body:', req.body);
    
    if (!ProjectName || !userEmail) {
        return res.status(400).json({ 
            error: 'ProjectName and userEmail are required',
            receivedData: { ProjectName, userEmail }
        });
    }

    const ProjectID = uuidv4();
    const Time = new Date().toISOString();
    
    try {
        // Start transaction
        await pool.query('BEGIN');

        // Log the email we're searching for
        console.log('Searching for user with email:', userEmail);

        // Get userID from email
        const userResult = await pool.query(
            'SELECT userID FROM appUser WHERE TRIM(email) = $1',
            [userEmail]
        );

        console.log('User query result:', userResult.rows);

        if (userResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ 
                error: 'User not found',
                email: userEmail 
            });
        }

        const userID = userResult.rows[0].userid;

        // Create project
        const newProject = await pool.query(
            `INSERT INTO project(ProjectID, ProjectName, Description, Status, Time) 
             VALUES($1, $2, $3, $4, $5) 
             RETURNING ProjectID, TRIM(ProjectName) as ProjectName, 
                       TRIM(Description) as Description, Status, Time`,
            [
                ProjectID,
                ProjectName.substring(0, 50),
                Description ? Description.substring(0, 255) : null,
                Status || 'A',  // Default to 'A' if not provided
                Time
            ]
        );

        // Create worksOn relationship
        await pool.query(
            'INSERT INTO worksOn(ProjectID, UserID) VALUES($1, $2)',
            [ProjectID, userID]
        );

        await pool.query('COMMIT');

        res.json(newProject.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Detailed error:', {
            message: err.message,
            stack: err.stack,
            details: err
        });
        res.status(500).json({ 
            error: 'Failed to create project',
            details: err.message 
        });
    }
});

// Update an existing project
app.put('/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const { ProjectName, Description, Status } = req.body;
    
    try {
        // Verify project exists and user has access
        const projectCheck = await pool.query(
            `SELECT p.* FROM project p 
             WHERE p.ProjectID = $1`,
            [projectId]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Update project
        const updatedProject = await pool.query(
            `UPDATE project 
             SET ProjectName = $1, 
                 Description = $2, 
                 Status = $3,
                 Time = CURRENT_TIMESTAMP
             WHERE ProjectID = $4
             RETURNING ProjectID, TRIM(ProjectName) as ProjectName, 
                       TRIM(Description) as Description, Status, Time`,
            [
                ProjectName.substring(0, 50),
                Description ? Description.substring(0, 255) : null,
                Status.substring(0, 1),
                projectId
            ]
        );

        res.json(updatedProject.rows[0]);
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).json({ 
            error: 'Failed to update project',
            details: err.message 
        });
    }
});

// Delete a project
app.delete('/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    
    try {
        // The worksOn relationships will be automatically deleted due to ON DELETE CASCADE
        const result = await pool.query(
            'DELETE FROM project WHERE ProjectID = $1 RETURNING *',
            [projectId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ 
            error: 'Failed to delete project',
            details: err.message 
        });
    }
});

// Get a single project
app.get('/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT p.*, TRIM(p.ProjectName) as ProjectName, 
                    TRIM(p.Description) as Description
             FROM project p
             WHERE p.ProjectID = $1`,
            [projectId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching project:', err);
        res.status(500).json({ 
            error: 'Failed to fetch project',
            details: err.message 
        });
    }
});




// edit a task
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { user_email, title, progress, date } = req.body;

    try {
        const editTask = await pool.query('UPDATE task SET useremail = $1, title = $2, progress = $3, date = $4 WHERE id = $5;',
            [user_email, title, progress, date, id]);
        res.json(editTask);
    } catch (err) {
        console.error(err);
    }
})

//delete a task

app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleteTask = await pool.query('DELETE FROM tasks WHERE id = $1;', [id]);
        res.json(deleteTask);
    } catch (err) {
        console.error(err);
    }
})

// app.get('/', (req, res) => {
//     res.send('hello Simon!');
// });


app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
