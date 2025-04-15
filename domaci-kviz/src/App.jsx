import { use, useState, useEffect } from 'react'
import './App.css'
import Game from './Game'
import api from './constants'

function App() {
  const [sessionExists, createSession] = useState(false);
  const [players, setPlayers] = useState({});
  const [role, setRole] = useState("player");

  useEffect(() => {
    fetch(api + '/api/session')
    .then((response) => response.json())
    .then((data) => {
      data.message != 0 ? createSession(true) : createSession(false)
    })
    .catch((error) => console.error('Error', error));
  }, []);
  console.log(sessionExists)
  
  const createSesh = () => {
    fetch(api + '/api/create_session', {
      method:'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(null)
    })
    .then((response) => response.json())
    .then((data) => {
      setPlayers(data.players)
      setRole("admin")
      localStorage.setItem("role", "admin")
    }).catch((error) => console.error('Error', error))
    createSession(true)
  }

  return (
    <>
    <div>
      <div className="header"><h1>Domácí Kvíz</h1></div>
      {sessionExists ? (
        <Game role={role}/>
      ): (
        <div>
          <h2>Vytvořit novou hru?</h2>
          <button onClick={createSesh}>Vytvořit</button>
        </div>
      )}
    </div>
    </>
  )
}

export default App;
