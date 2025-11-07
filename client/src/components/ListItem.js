import TickIcon from './TickIcon';
import ProgressBar from './ProgressBar';
import Modal from './Modal';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ListItem({task, getData}) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { token } = useAuth();
 
  async function deleteItem() {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/tasks/${task.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      getData();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  }
  
    return (
      <li className = "list-item"> 

        <div className="info-container">
          <TickIcon/>
          <p className="task-title">{task.title}</p>
          <ProgressBar progress={task.progress || 0}/>
        </div>

        <div className="button-container"> 
          <button className="edit" onClick={() => setShowModal(true)} disabled={deleting}>EDIT</button>
          <button className="delete" onClick={deleteItem} disabled={deleting}>
            {deleting ? 'DELETING...' : 'DELETE'}
          </button>
        </div>
        {showModal && <Modal mode={'edit'} setShowModal={setShowModal} getData={getData} task={task}/>}
      </li>
    );
  }
  
  export default ListItem;