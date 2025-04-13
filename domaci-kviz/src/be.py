from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

class Session:
    def __init__(self, id):
        self.__id = id
        self.__players = {}
        self.__question_cnter = 0
        self.__answers = {0: {0: None}}
        self.__is_open = True
        l = [1, 2, 3, 4, 5, 6, 7]
        random.shuffle(l)
        l.insert(0, 0)
        self.__image_ids = l
        self.__is_running = False
        self.__is_revealed = False
        self.__scores = {}
        self.__game_ended = False

    def add_player(self, player_id, player_name, role):
        if self.__players.get(player_id):
            player_id = player_id + 1
        self.__players[player_id] = (player_name, role, self.__image_ids[player_id])
        self.__scores[player_id] = 0
        return self.__players

    @property
    def id(self):
        return self.__id
    
    @property
    def players(self):
        return self.__players
    
    def close(self):
        self.__is_open = False

    @property
    def is_open(self):
        return self.__is_open
    
    def add_question(self):
        # self.__answers is {question: {player_id: [answer, correct?]}}
        self.__question_cnter += 1
        self.__answers[self.__question_cnter] = {}
        for player in self.__players.keys():
            self.__answers[self.__question_cnter][player] = [None, None]
        return self.__question_cnter

    def answer_question(self, question_counter, player_id, answer):
        print(self.__answers)
        print("question counter: ", question_counter)
        print("playerid ", player_id)
        print("answer ", answer)
        self.__answers[question_counter][int(player_id)] = [answer, False]

    def evaluate_answer(self, question_cnt, player_id, valuation):
        if len(self.__answers[question_cnt][int(player_id)]) > 1:
            self.__answers[question_cnt][int(player_id)].pop()
        self.__answers[question_cnt][int(player_id)].append(valuation)
        

    @property
    def scores(self):
        for player_id in self.__scores.keys():
            self.__scores[player_id] = 0
        for _, player_answers in self.__answers.items():
            for player_id, answer in player_answers.items():
                if player_id == 0:
                    continue
                if answer[1] == True:
                    self.__scores[player_id] += 1
        return self.__scores

    @property
    def answers(self):
        return self.__answers
    
    def set_is_revealed(self, bool):
        self.__is_revealed = bool
        return self.__is_revealed
    
    def end_game(self):
        self.__game_ended = True

    @property
    def game_ended(self):
        return self.__game_ended
    
    @property
    def is_revealed(self):
        return self.__is_revealed

    @property
    def question_cnter(self):
        return self.__question_cnter

    def get_players_responses(self, question_id):
        return self.__answers[question_id]
    
    def start_game(self):
        self.__is_running = True
        self.add_question()

    def get_score_weighed_players(self):
        scores = self.__scores
        players = self.__players
        winners_array = []

        for player_id in players.keys():
            winners_array.append([player_id, scores[player_id]])
        
        winners_array.sort(key=lambda x:x[1], reverse=True)

        winners_array.remove([0, 0])

        save = winners_array[0]
        winners_array[0] = winners_array[1]
        winners_array[1] = save

        return winners_array

    @property
    def is_running(self):
        return self.__is_running
    
    @property
    def image_ids(self):
        return self.__image_ids
    
    def get_mock_quotes(self):
        mock_quo = [
            "Snažil ses ...",
            "To to dopadlo ...",
            "Hodně štěstí příště!",
            "Zase pod stupínkem ...",
            "Aspoň můžeš fandit lepším.",
            "Určitě ti jdou jiné věci.",
            "'Nadané dítě' ... ",
            "Rodiče ti asi lhali ...",
            "Tleskej a usmívej se."
        ]
        length = len(self.__scores.keys()) - 4
        returned_mock_quo = []
        for i in range(length):
            random_index = random.randrange(0, len(mock_quo)-1)
            random_mock = mock_quo[random_index]
            returned_mock_quo.append(random_mock)
            mock_quo.remove(random_mock)
        
        return returned_mock_quo

    

__SESSION: Session = Session(id=0)

# Example route: GET request to the root of the application
@app.route('/')
def hello_world():
    return "Hello, World!"

# Example API route: GET request to /api/data
@app.route('/api/session', methods=['GET'])
def get_session():
    global __SESSION
    data = {"message": __SESSION.id}
    return jsonify(data)

# Example route to handle POST requests
@app.route('/api/create_session', methods=['POST'])
def create_session():
    global __SESSION
    # You can now process the data, e.g., save it to a database
    __SESSION = Session(id=1)
    players = __SESSION.add_player(0, "admin", "admin")
    response = {"message": "Session created", "players": players}
    return jsonify(response)

@app.route('/api/add_player', methods=['POST'])
def add_player():
    data = request.get_json()
    global __SESSION
    player_id = list(__SESSION.players.keys())[-1] + 1
    players = __SESSION.add_player(player_id, data["playerName"], "player")
    added_player = {player_id: players[player_id]}
    response = {"message": "Player added", "player": added_player}
    print(added_player)
    print(players)
    return jsonify(response)

@app.route('/api/close', methods=['POST'])
def close_logins():
    global __SESSION
    __SESSION.close()
    response = {"message": "Logins closed"}
    return jsonify(response)

@app.route('/api/is_open', methods=['GET'])
def is_open():
    global __SESSION
    response = {"message": f"Logins are {'' if __SESSION.is_open else 'not '}open.", "open": __SESSION.is_open}
    return jsonify(response)

@app.route('/api/is_game_running', methods=['GET'])
def get_is_game_running():
    global __SESSION
    response = {"message": f"Game is {'' if __SESSION.is_running else 'not '}running.", 
                "bool":__SESSION.is_running, 
                "number":__SESSION.question_cnter, 
                "players": __SESSION.players,
                "ended": __SESSION.game_ended}
    return jsonify(response)

@app.route('/api/start_game', methods=['POST'])
def start_game():
    global __SESSION
    __SESSION.start_game()
    response = {"message": "Game started"}
    return jsonify(response)

@app.route('/api/get_answers', methods=['GET'])
def get_answers():
    global __SESSION
    response = {"message": __SESSION.answers, "revealed": __SESSION.is_revealed, "ended": __SESSION.game_ended}
    return jsonify(response)

@app.route('/api/answer_question', methods=['POST'])
def answer_question():
    # payload will be {questionId: question_id, playerId: player_id, answer: answer}
    data = request.get_json()
    global __SESSION
    __SESSION.answer_question(data["questionId"], data["playerId"], data["answer"])
    response = {"message": "Answer logged."}
    return jsonify(response)

@app.route('/api/add_question', methods=["POST"])
def add_question():
    data = request.get_json()
    global __SESSION
    __SESSION.set_is_revealed(False)
    question_cnt = __SESSION.add_question()
    response = {"message": "Question added.", "number": question_cnt}
    return jsonify(response)

@app.route('/api/get_players', methods=['GET'])
def get_player():
    global __SESSION
    response = {"message": __SESSION.players}
    return jsonify(response)

@app.route('/api/reveal_answers', methods=['GET'])
def reveal_answers():
    global __SESSION
    __SESSION.set_is_revealed(True)
    response = {"message": "Answers revealed"}
    return jsonify(response)

@app.route('/api/submit_answer_eval', methods=['POST'])
def submit_answer_eval():
    # payload is {questionCnt: questionCnt, playerId: playerId, eval: eval}
    data = request.get_json()
    global __SESSION
    question_cnt = data["questionCnt"]
    player_id = data["playerId"]
    evaluation = data["eval"]
    __SESSION.evaluate_answer(question_cnt, player_id, evaluation)
    response = {"message": "Answers logged"}
    return jsonify(response)

@app.route('/api/scores', methods=['GET'])
def get_scores():
    global __SESSION
    response = {"message": __SESSION.scores}
    return jsonify(response)

@app.route('/api/end_game', methods=['GET'])
def end_game():
    global __SESSION
    __SESSION.end_game()
    response = {"message": "Game Ended"}
    return jsonify(response)

@app.route('/api/get_winners', methods=['GET'])
def get_winners():
    global __SESSION
    winners = __SESSION.get_score_weighed_players()
    response = {"message": winners}
    return jsonify(response)

@app.route('/api/mocking', methods=['GET'])
def get_mocking():
    global __SESSION
    mocking = __SESSION.get_mock_quotes()
    response = {"message": mocking}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)  # This starts the Flask development server
