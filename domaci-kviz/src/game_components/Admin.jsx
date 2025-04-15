import { use, useState, useEffect } from 'react'
import '../App.css'
import api from '../constants';

function Admin() {
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [currentAnswers, setCurrentAnswers] = useState({});
    const [players, setPlayers] = useState({});
    const [isRevealed, setIsRevealed] = useState(false);
    const [evalCntPlaceholder, setEvalCntPlaceholder] = useState(0);
    const [scores, setScores] = useState({});

    // {playerid : (player_name, role, self.__image_ids[player_id])}


    
    const getScores = () => {
        fetch(api + '/api/scores')
        .then((response) => response.json())
        .then((data) => {
            setScores(data.message);
            console.log(scores);
        })
    }

    useEffect(() => {
        fetch(api + '/api/get_players')
        .then((response) => response.json())
        .then((data) => {
            setPlayers(data.message);
        })
        getScores();
    }, [])


    const addQuestion = () => {
        fetch(api + '/api/add_question', {
            method:'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(null)
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.number);
            setCurrentQuestion(data.number);
        })
        setIsRevealed(false);  
        getScores();
    }

    const revealAnswer = () => {
        fetch(api + "/api/reveal_answers").then(
            setIsRevealed(true)
        )
    }
    
    const endGame = () => {
        fetch(api + "/api/end_game")
    }

    const evaluateAnswer = (playerId, evaluation) => {
        const payload = {
            questionCnt: currentQuestion,
            playerId: playerId,
            eval: evaluation
        }
        fetch(api + '/api/submit_answer_eval', {
            method:'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        setEvalCntPlaceholder(evalCntPlaceholder + 1);
    }

    useEffect(() => {
        const getAnswers = async () => {
            fetch(api + "/api/get_answers")
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message[currentQuestion])
                console.log(currentQuestion)
                setCurrentAnswers(data.message[currentQuestion]);
                setIsRevealed(data.revealed);
                console.log(scores);
            })
        }

        getAnswers();

        const interval = setInterval(getAnswers, 2000);

        return () => clearInterval(interval)
    }, [currentQuestion, isRevealed, evalCntPlaceholder])


    return (
        <>
        {currentAnswers != {} && (
            <>
            <div className='scores'>
                {Object.entries(players).map(([key, value]) => (
                    key != 0 ? (
                        <>
                        <span>
                            <img src={`/public/assets/${value[2]}.png`} width="25px"/><p>{scores[key]}</p>
                        </span> 
                        </>
                    ) : (<></>)
                ))}
            </div>
            <div>
                {Object.entries(currentAnswers).map(([key, value]) => (
                    key != 0 ? ( value[0]? (
                    <div style={{display:"flex", alignItems: "center"}}>
                    <span style={{width: "80%"}}>
                        <div style={{
                        display: "flex", 
                        alignItems: "center",
                        backgroundColor: value[1] == true ? "rgba(20, 200, 20, 0.4)" : "rgba(255, 255, 255, 0.4)"}} 
                        className='answer'>
                        <span><img src={`/public/assets/${players[key][2]}.png`} width="75px"/></span>
                        <span>
                            <div><strong>{players[key][0]}</strong></div>
                            <div
                                style={{
                                    filter: isRevealed ? 'none' : 'blur(10px)',
                                    transition: 'filter 0.3s ease',
                                    fontWeight: 450
                                }}
                            >{value[0]}</div>
                        </span>    
                    </div>
                    </span>
                    <span style={{width: "15%", marginBottom: "1rem"}}>
                        <div>
                            <button onClick={() => evaluateAnswer(key, true)}>✔️</button>
                        </div>
                        <div>
                            <button onClick={() => evaluateAnswer(key, false)}>❌</button>
                        </div>
                    </span>  
                    </div>
                    ) : (<></>)
                    ) : (<></>)
                ))}
            </div>
            </>

        )}
        <div>
            {!isRevealed && (
                <button onClick={() => revealAnswer()}>Odhalit odpovědi</button>
            )}
        </div>
        <div>
            <button onClick={() => addQuestion()}>Další otázka</button>
        </div>
        <div>
            <button onClick={() => endGame()}>Ukončit hru</button>
        </div>
        </>
    )
}

export default Admin;