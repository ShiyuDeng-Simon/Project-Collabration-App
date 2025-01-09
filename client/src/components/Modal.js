import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function Modal({mode, setShowModal, getData, project}) {
  const { user } = useAuth();
  const editMode = mode === 'edit' ? true : false;

  // Move useState before any conditional returns
  const [data, setData] = useState({
    ProjectName: editMode ? project?.projectname?.trim() : '',
    Description: editMode ? project?.description?.trim() : '',
    Status: editMode ? project?.status : 'A', // 'A' for Active by default
  });

  const [error, setError] = useState(null);

  // Move the authentication check after hooks
  if (!user) {
    return <Navigate to="/" />;
  }

  async function postData(e) {
    e.preventDefault();
    setError(null); // Clear any previous errors
    
    try {
      const projectData = {
        ProjectName: data.ProjectName,
        Description: data.Description,
        Status: data.Status,
        userEmail: user.email
      };

      console.log('Sending project data:', projectData); // Debug log
  
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/projects`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(projectData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create project');
      }

      const result = await response.json();
      console.log('Project created:', result); // Debug log
      setShowModal(false);
      getData();
    } catch(err) {
      console.error('Failed to create project:', err);
      setError(err.message);
    }
  }

  async function editData(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/projects/${project.projectid}`, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ProjectName: data.ProjectName,
          Description: data.Description,
          Status: data.Status
        })
      });

      if (response.ok) {
        setShowModal(false);
        getData();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  } 

  function handleChange(e) {
    const {name, value} = e.target;
    setData(data => ({
      ...data,
      [name]: value
    }));
  } 

  return (
    <div className="overlay">
      <div className="modal">
        <div className="form-title-container">
          <h3>Let's {mode} your project</h3>
          <button onClick={() => setShowModal(false)}>X</button>
        </div>

        <form>
          <div className="form-group">
            <label htmlFor="ProjectName">Project Name</label>
            <input 
              required
              maxLength={50}
              placeholder="Enter project name"
              name="ProjectName"
              value={data.ProjectName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="Description">Description</label>
            <textarea
              maxLength={255}
              placeholder="Enter project description"
              name="Description"
              value={data.Description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="Status">Status</label>
            <select 
              name="Status" 
              value={data.Status} 
              onChange={handleChange}
            >
              <option value="A">Active</option>
              <option value="C">Completed</option>
              <option value="P">Pending</option>
            </select>
          </div>

          <input 
            className={mode} 
            type="submit" 
            onClick={editMode ? editData : postData}
            value={editMode ? "Update Project" : "Create Project"}
          />
        </form>

        {error && (
          <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
            Error: {error}
          </div>
        )}
      </div> 
    </div>
  );
}

export default Modal;