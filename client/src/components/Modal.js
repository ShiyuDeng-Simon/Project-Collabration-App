import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Modal({mode, setShowModal, getData, task}) {
  const editMode = mode === 'edit' ? true : false;
  const { user, token } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    user_email: editMode ? task.user_email : user?.email || '',
    title: editMode ? task.title : '',
    progress: editMode ? task.progress : 50,
    date: editMode ? task.date : new Date().toISOString()
  });

  async function postData(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/tasks`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create task');
      }

      setShowModal(false);
      getData();
    } catch(err) {
      console.error('Create task error:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  async function editData(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update task');
      }

      setShowModal(false);
      getData();
    } catch (err) {
      console.error('Update task error:', err);
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  } 

  function handleChange(e) {

    const {name, value} = e.target;
    
    setData(data => ({
      ...data,
      [name] : value
    }))

    //console.log(data);
  } 

  return (
    <div className="overlay">
      <div className="modal">
        <div className="form-title-container">
          <h3>Let's {mode} your task</h3>
          <button onClick={() => setShowModal(false)}>X</button>
        </div>

        {error && (
          <div style={{ 
            color: 'red', 
            padding: '10px', 
            marginBottom: '10px',
            borderRadius: '5px',
            backgroundColor: '#ffe6e6'
          }}>
            {error}
          </div>
        )}

        <form>
          <input 
            required
            maxLength={255}
            placeholder="Your task goes here"
            name="title"
            value={data.title || ''}
            onChange={handleChange}
            disabled={loading}
          />
          <br/>
          <label htmlFor="range">Drag to select progress: {data.progress}%</label>
          <input
            required 
            type="range"
            min="0"
            max="100"
            name="progress"
            value={data.progress}
            onChange={handleChange}
            disabled={loading}
          />
          <input 
            className={mode} 
            type="submit" 
            onClick={editMode ? editData : postData}
            disabled={loading}
            value={loading ? 'Processing...' : (editMode ? 'Update Task' : 'Create Task')}
          />
        </form>
      </div> 
    </div>
  );
}
  
export default Modal;