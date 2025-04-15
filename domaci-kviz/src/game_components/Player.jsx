import { use, useState, useEffect } from 'react'
import '../App.css'
import api from '../constants'

function Player(questionCnt) {
    const [answer, setAnswer] = useState("")
    const [currentQuestion, setCurrentQuestion] = useState(0)
    console.log(currentQuestion)
    console.log(questionCnt)
    const [isAnswered, setIsAnswered] = useState(false)
    console.log(isAnswered)
    const playerId = localStorage.getItem("playerId")

    useEffect(() => {
        if (currentQuestion != questionCnt.questionCnt) {
            setIsAnswered(false)
        }
    })
        


    const answerQuestion = () => {
        setIsAnswered(true);
        setCurrentQuestion(questionCnt.questionCnt);
        const payload = {
            questionId: questionCnt.questionCnt,
            playerId: playerId,
            answer: answer
        };
        fetch(api + "/api/answer_question", {
            method:'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        setAnswer("");
    }

    const handleAnswer = (answer) => {
        const answ = answer.target.value;
        setAnswer(answ);
    }

    console.log(isAnswered)

    return (
        <>
        {!isAnswered && (
            <div className='input-div'>
                <input type="text" value={answer} onChange={handleAnswer} placeholder="odpověď"/>
                <button onClick={() => answerQuestion()}>Odeslat</button>
            </div>
        )}
        {isAnswered && (
            <h3>Počkej na další otázku</h3>
        )}
        </>
    )
}

export default Player;