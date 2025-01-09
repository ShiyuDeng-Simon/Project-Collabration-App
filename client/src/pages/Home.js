import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';
import {useEffect, useState} from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';



export default function Home() {
  const [projects, setProjects] = useState(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      getData();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/" />;
  }

  async function getData() {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/projects/${user.email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const json = await response.json();
      setProjects(json);
    } catch (err) {
      console.error(err);
    }
  }

  // Sort by date
  const sortedProjects = projects?.sort((a,b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="app">
      <ListHeader listName={`${user.firstname}'s Project list`} getData={getData} />
      {sortedProjects?.map((project) => (
        <ListItem 
          key={project.projectid} // Use projectid as key
          project={project} 
          getData={getData} 
        />
      ))}
    </div>
  );
}