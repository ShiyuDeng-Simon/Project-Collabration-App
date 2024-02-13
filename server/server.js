const PORT = process.env.PORT ?? 8000;
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express()
const pool = require('./db');

app.use(cors());
app.use(express.json());

// get all tasks
app.get('/tasks/:userEmail', async (req, res) => {

    const { userEmail } = req.params;

    try {
        const tasks = await pool.query('SELECT * FROM tasks WHERE user_email = $1;', [userEmail]);
        res.json(tasks.rows);
    } catch (err) {
        console.error(err);
    }
});

//create new task
app.post('/tasks', async (req, res) => {
    const { user_email, title, progress, date } = req.body;
    const id = uuidv4();
    try {
        const newTask = await pool.query('INSERT INTO tasks(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5);',
            [id, user_email, title, progress, date]);
        res.json(newTask);
    } catch (err) {
        console.error(err);
    }
})

// edit a task
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { user_email, title, progress, date } = req.body;

    try {
        const editTask = await pool.query('UPDATE tasks SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5;',
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
