import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';
import {useEffect, useState} from 'react';



export default function Home() {

  const userEmail = 'simon@test.com';
  const [tasks, setTasks] = useState(null);

  async function getData() {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/tasks/${userEmail}`);
      const json = await response.json();
      setTasks(json);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => getData, []);

  //console.log(tasks);

  //Sort by date
  const sortedTasks = tasks?.sort((a,b) => new Date(a.date) - new Date(b.date));


  return (
    // <Routes>
    //   <Route path="/" element={<Login />} />
    //   <Route path="/Home" element={<Home />} />
    //   <Route path="/Project" element={<Project />} />
    // </Routes>

    <div className="app">
      <ListHeader listName={'Holiday tick list'} getData={getData} />
      {sortedTasks?.map((task) => <ListItem key={task.id} task={task} getData={getData} />)}
    </div>


      

  );
}


 