import { use, useState, useEffect } from 'react'
import '../App.css'
import api from '../constants'

function Spectator() {
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [currentAnswers, setCurrentAnswers] = useState({});
    const [players, setPlayers] = useState({});
    const [isRevealed, setIsRevealed] = useState(false);
    const [scores, setScores] = useState({});
    const [hasGameEnded, setHasGameEnded] = useState(false);
    const [scoreWeighedPlayers, setScoreWeighedPlayers] = useState([]);
    const [mockQuotes, setMockQuotes] = useState([]);

    // {playerid : (player_name, role, self.__image_ids[player_id])}

    const getScores = () => {
        fetch(api + '/api/scores')
        .then((response) => response.json())
        .then((data) => {
            setScores(data.message);
        })
    }

    const getWinners = () => {
        fetch(api + '/api/get_winners')
        .then((response) => response.json())
        .then((data) => {
            setScoreWeighedPlayers(data.message);
        })
    }

    useEffect(() => {
        fetch(api + '/api/get_players')
        .then((response) => response.json())
        .then((data) => {
            setPlayers(data.message);
        })
    }, [])

    useEffect(() => {
        const getAnswers = async () => {
            fetch(api + "/api/get_answers")
            .then((response) => response.json())
            .then((data) => {
                setCurrentQuestion(Object.keys(data.message)[Object.keys(data.message).length - 1])
                setCurrentAnswers(data.message[currentQuestion]);
                setIsRevealed(data.revealed);
                getScores();
                setHasGameEnded(data.ended);
                console.log(scoreWeighedPlayers);
            })
        }

        getAnswers();

        const interval = setInterval(getAnswers, 2000);

        return () => clearInterval(interval)
    }, [currentQuestion, isRevealed, hasGameEnded])

    useEffect(() => {
        getWinners()
        console.log(scoreWeighedPlayers)
    }, [hasGameEnded])

    useEffect(() => {
        fetch(api + "/api/mocking")
        .then((response) => response.json())
        .then((data) => {
            setMockQuotes(data.message)
        })
    }, [hasGameEnded])

    return (
        <>
        {currentAnswers != {} && (
            <>
            {!hasGameEnded && (
                <>
                <div className='scores'>
                    {Object.entries(players).map(([key, value]) => (
                        key != 0 ? (
                            <>
                            <span>
                                <img src={`/public/assets/${value[2]}.png`} width="25px" height="25px"/><p>{scores[key]}</p>
                            </span> 
                            </>
                        ) : (<></>)
                    ))}
                </div>
                <div>
                    {Object.entries(currentAnswers).map(([key, value]) => (
                        key != 0 ? ( value[0]? (
                        <div style={{
                            display: "flex", 
                            alignItems: "center",
                            backgroundColor: value[1] == true ? "rgba(20, 200, 20, 0.4)" : "rgba(255, 255, 255, 0.4)"}} className='answer'>
                            <span><img src={`/public/assets/${players[key][2]}.png`} width="75px" height="75px"/></span>
                            <span>
                                <div><strong>{players[key][0]}</strong></div>
                                <div
                                    style={{
                                        filter: isRevealed ? 'none' : 'blur(10px)',
                                        transition: 'filter 0.3s ease'
                                    }}
                                >{value[0]}</div>
                            </span>      
                        </div>
                        ) : (<></>)
                        ) : (<></>)
                    ))}
                </div>
                </>
            )}
            {hasGameEnded && (
                <> 
                    <div className="podium-flex">
                        {scoreWeighedPlayers.map((element) => (
                            element[0] != 0 ?
                            (
                                scoreWeighedPlayers.indexOf(element) < 3 ? (
                                    <><div>
                                        <span className="podium-flex podium-span">
                                        <div style={{fontSize:"1.5rem", marginBottom:"0.5rem"}}><strong>{element[1]}</strong></div>
                                        <div><img src={`/public/assets/${players[Number(element[0])][2]}.png`} width="50px" height="50px" className='podium-flex'/></div>
                                        <div className="podium-flex podium" style={{height:`${100 - Math.abs((0.8 - scoreWeighedPlayers.indexOf(element)))*50}px`}}>{
                                        scoreWeighedPlayers.indexOf(element) == 0 ? 2 : (scoreWeighedPlayers.indexOf(element) == 1 ? 1 : 3)
                                        }</div>
                                        <div className="podium-text"><strong>{players[Number(element[0])][0]}</strong></div>
                                        </span>
                                    </div></>
                                    
                                ) : (
                                    <> 
                                        <div className="scoreboard">
                                        <span>
                                            <div>
                                                <img src={`/public/assets/${players[Number(element[0])][2]}.png`} width="50px" height="50px"/>
                                                <div className="scoreboard-text">
                                                    <strong>{players[Number(element[0])][0]}</strong>
                                                </div>
                                            </div>
                                        </span>
                                        <span>
                                            <div className='scoreboard-score'>
                                                <strong>{element[1]}</strong>
                                                <div className='mocking'>{mockQuotes[scoreWeighedPlayers.indexOf(element) - 3]}</div>
                                            </div>
                                        </span>
                                        </div>
                                    </>
                                )
                            ) : (<></>)
                        ))}

                </div>
                </>
            )}
            </>

        )}
        </>
    )
}

export default Spectator;