import React, { useEffect } from 'react';
import './App.css';
import { use, useState } from 'react';
import Admin from './game_components/Admin';
import Player from './game_components/Player';
import Spectator from './game_components/Spectator';

function Game(role) {
    const storedName = localStorage.getItem("playerName");
    const [nickname, setNickname] = useState(storedName ? storedName : "");
    const storedId = localStorage.getItem("playerId");
    const storedRole = localStorage.getItem("role");
    const storedImageId = localStorage.getItem("imageId");
    const [playerId, setPlayerId] = useState(storedId ? storedId : null);
    const [isOpen, setIsOpen] = useState(true);
    const [myImageId, setImageId] = useState(1);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [players, setPlayers] = useState({});
    const [hasGameEnded, setHasGameEnded] = useState(false);

    const [finalRole, setFinalRole] = useState(storedRole ? storedRole : role.role);

    // this has to be done on BE
    const playerImageSrc = `/src/assets/${storedImageId? storedImageId : myImageId}.png`;

    const handleChange = (e) => {
      setNickname(e.target.value);
    }

    const setObserver = () => {
        setFinalRole("observer");
    }

    const addPlayer = () => {
        fetch('http://127.0.0.1:5000/api/add_player', {
            method:'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({playerName: nickname})
          })
          .then((response) => response.json())
          .then((data) => {
            const playerId = Object.keys(data.player)[0]
            const imageId = data.player[playerId][2]
            console.log(data.player)
            console.log(imageId)
            localStorage.setItem("playerId", playerId)
            localStorage.setItem("playerName", nickname)
            setPlayerId(playerId)
            setImageId(imageId)
            localStorage.setItem("imageId", imageId)
          }).catch((error) => console.error('Error', error))
    }

    useEffect(() =>{
        fetch('http://127.0.0.1:5000/api/is_open')
        .then((response) => response.json())
        .then((data) => {
            setIsOpen(data.open)
        }).catch((error) => console.error("Error", error))
    })

    useEffect(() => {
        const getIsGameRunning = async () => {
            fetch("http://127.0.0.1:5000/api/is_game_running")
            .then((response) => response.json())
            .then((data) => {
                setIsGameRunning(data.bool);
                setCurrentQuestion(data.number);
                setPlayers(data.players);
                setHasGameEnded(data.ended);
            })
        }

        getIsGameRunning();

        const interval = setInterval(getIsGameRunning, 2000);

        return () => clearInterval(interval)
    }, [])

    const startGame = () => {
        close()
        fetch('http://127.0.0.1:5000/api/start_game', {
            method:'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          })
    }

    const close = () => {
        fetch('http://127.0.0.1:5000/api/close', {
            method:'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(null)
          })
          .then((response) => response.json())
          .then((data) => {
            console.log(data.message)
          }).catch((error) => console.error("Error", error))
    }

    return (
        <>
            {finalRole == "admin" && (
            <>
            {!isGameRunning && (
            <>
                <div>
                    <button onClick={() => close()}>Uzavřít login</button>
                </div>
                <div>
                    <button onClick={() => startGame()}>Start</button>
                </div>
            </>
            )}
            {isGameRunning && (
                <>
                    {currentQuestion && (
                        <>
                            <h2>Otázka {currentQuestion}</h2>
                            <Admin></Admin>
                        </>
                    )}
                </>
            )}
            </>
            )}
            {((isOpen == false && !playerId) || finalRole == "observer" ) && (
                <div>
                    <h2>Pozorovatel</h2>
                    {!isGameRunning && (
                    <>
                        <h3>Čeká se na správce hry ...</h3>
                        <div style={{display: "flex", justifyContent: "center", flexWrap:"wrap"}}>
                            {Object.entries(players).map(([key, value]) => (
                                key != 0 ? (
                                <>
                                    <span>
                                        <img src={`/src/assets/${value[2]}.png`} width="50px" height="50px"/>
                                        <p style={{margin:0, lineHeight:0}}><strong>{value[0]}</strong></p>
                                    </span> 
                                </>
                                ) : (<></>)
                            ))}
                        </div>
                    </>
                    )}

                    {isGameRunning && (
                    <div>
                        {currentQuestion && (
                            <>
                            {!hasGameEnded && (
                                <h2>Otázka {currentQuestion}</h2>
                            )}
                            <Spectator></Spectator>
                            </>
                        )}
                    </div>
                    )}
                </div>
            )}
            {!playerId && finalRole == "player" && isOpen && (
            <>
              <input type="text" value={nickname} onChange={handleChange} placeholder="přezdívka"/>
              <button onClick={() => addPlayer()}>
                Potvrdit
              </button>
              <div>
                <button onClick={() => setObserver()}>Chci být pozorovatel</button>
              </div>
            </>
            )}
            {playerId && finalRole == "player" && (
            <div>
                <img src={playerImageSrc} width="100px"></img>
                <h2>{nickname}</h2>
                {!isGameRunning && (
                    <>
                        <h3>Čeká se na správce hry ...</h3>
                    </>
                )}

                {isGameRunning && (
                    <div>
                        {currentQuestion && (
                            <>
                                <h2>Otázka {currentQuestion}</h2>
                                <Player questionCnt={currentQuestion}></Player>
                            </>
                        )}
                    </div>
                )}
            </div>
          )}
        </>
      )
}

export default Game;