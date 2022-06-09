var dpr;
var alt_canvas = true;
var current_guess = Array.from({length:100}, (_,i) => i+1);
var model;
var ctx;
var game;
var round;
var nextTurn = false;
var totalScore = [0, 0];
//pass reactions of computer
const passReaction = ["I pass", "Mhmm...", "This is a hard one", "I can't tell yet", "Pass","I don't have it",
 "Give me some time","Time will tell", "Can you give me a hint?", "I have no idea", "Not sure yet...", "I almost have it", "What is the posterior?",
"Almost...", "I will win...Soon!", "I have to pass here", "I pass...for now"]
//guess reactions of computer
const guessReaction = ["I think it is ", "my guess: ", "It should be ", "I got ", "My answer is ", "It must be "]

//TODO: guess of computer should be a concept not a list
//TODO: add more complicated concepts

//this class represents the current game
class Game {
    constructor() {
        //0: player, 1: computer
        this.score = [0, 0] //score of each player
        this.game_over = false
        this.current_round;
        this.player_is_major = true;
        this.model;
        this.playersTurn = "";
    }
    //main class of Game, handles all the game logic
    async startGame(pointLimit) {
        let cTurn;
        let pTurn;
        
        //enable game buttons
        document.getElementsByClassName("start_button")[0].textContent = "Skip"
        
        while (!this.game_over) {
            buttonsClickable(true, true);
            this.startRound();
            while(!this.current_round.isOver) {
                document.getElementById("result").innerHTML = ''
                if (this.player_is_major) {
                    //take input from player (either pass or guess)
                    pTurn = await this.playersTurnHandler(false);
                    this.playTurn("P", pTurn);
                    if (this.current_round.isOver) {
                        break;
                    }
                    //then take action from computer (pass or guess)
                    cTurn = this.model.getAction(this.current_round.turn, this.current_round.sample);
                    this.playTurn("C", cTurn);
                    if (this.current_round.isOver) {
                        break;
                    }
                } else {
                    //then take action from computer (pass or guess)
                    cTurn = this.model.getAction(this.current_round.turn, this.current_round.sample);
                    this.playTurn("C", cTurn);
                    if (this.current_round.isOver) {
                        break;
                    }
                    //take input from player (either pass or guess)
                    pTurn = await this.playersTurnHandler(false);
                    this.playTurn("P", pTurn);
                    if (this.current_round.isOver) {
                        break;
                    }
                }
                showSample(this.current_round.getNextSample());
                //last round
                if (this.current_round.sample.length > 4) {
                    if (this.player_is_major ) {
                        pTurn = await this.playersTurnHandler(true);
                        this.playTurn("P", pTurn);
                    if (this.current_round.isOver) {
                        break;
                    }
                    //then take action from computer (pass or guess)
                    cTurn = this.model.getAction(this.current_round.turn, this.current_round.sample);
                    this.playTurn("C", cTurn);
                        
                    } else {
                        //then take action from computer (pass or guess)
                        cTurn = this.model.getAction(this.current_round.turn, this.current_round.sample);
                        this.playTurn("C", cTurn);
                        if (this.current_round.isOver) {
                            break;
                        }
                        //take input from player (either pass or guess)
                        pTurn = await this.playersTurnHandler(false);
                        this.playTurn("P", pTurn);
                    }
                    this.current_round.isOver = true;
                } 
                await timeout(1500)
            }
            updateScores(this.score[0], this.score[1]);
            //if any player reached the point limit, end the game
            if(Math.max(this.score[0], this.score[1]) >= pointLimit) {
                this.game_over = true;
                if (this.score[0] < this.score[1]) {
                    totalScore[1] = totalScore[1] + 1;
                    document.getElementsByClassName("c_text")[0].textContent = "You are not better than Bayes!"
                    document.getElementById("bayes_img").src = "/img/bayesWin.jpeg";
                    document.getElementById("winning_text").textContent = "You lose!"
                } else {
                    totalScore[0] = totalScore[0] + 1;
                    document.getElementsByClassName("c_text")[0].textContent = "You are better than Bayes!"
                    document.getElementById("winning_text").textContent = "You win!"
                }
                break;
            } else { //swtich major player
                this.player_is_major = !this.player_is_major;
            }
            // wait until next round starts
            buttonsClickable(false, true)
            await this.waitForNextRound();
        }
        //declare winner
        turnAfterGameOverlayOn();
    }

    //starts a new round in a game and updates all information
    startRound() {
        //logical start of round
        current_guess = Array.from(Array(100).keys());
        this.current_round = new Round();
        this.model = new Bayes(this.current_round.collection);
        this.current_round.started = true;
        
        //TODO: static because of exit
        round = this.current_round;
        model = this.model;
        current_guess = round.collection[0];

        //visual start of round
        document.getElementById("result").innerHTML = ""
        document.getElementsByClassName("c_text")[0].textContent = "We'll see!"

        //set round number
        document.getElementById("round_number").textContent = (this.score[0] + this.score[1] + 1).toString();

        //draw sample
        showSample(this.current_round.getNextSample());
    }

    //function that waits for player action to start next turn
    async waitForNextRound() {
        while(!nextTurn) {
            await timeout(300)
        }
        nextTurn = false;
    }

    //handles the turn of the player
    async playersTurnHandler() {
        this.playersTurn = "";
        // make buttons clickable
        buttonsClickable(true, false);
        console.log("it is your turn")
        //wait until player takes action
        while(this.playersTurn  == "") {
            await new Promise((res) => setTimeout(() => res("p2"), 1000));
        }
        //make buttons unclickable
        buttonsClickable(false, false);
        return this.playersTurn;
    }

    //plays a the turn given what the player or computer likes to do
    playTurn(player, turn) {
        console.log("player", player, turn)
        //player takes a guess
        if(turn.toString().includes("guess:")) {
            if (player == "C") {
                setTimeout(2000)
                document.getElementsByClassName("c_text")[0].textContent = turn
                setTimeout(1000)
            }
            let arr = turn.substring(turn.indexOf(":") + 1,turn.length ).split(",")
            //if guess is correct, update score
            if (this.current_round.isCorrectConcept(arr)) {
                animateResult(true);
                if (player == "P") {
                    console.log("player guessed correctly")
                    this.current_round.isOver = true
                    this.score[0] = this.score[0] + 1 

                } else if(player == "C") {
                    document.getElementsByClassName("c_text")[0].textContent = 
                        guessReaction[getRandomInt(0,guessReaction.length)] + game.current_round.getNameOfGuess(arr.filter(el => {return el != ""})) + ".";
                    console.log("computer guessed correctly")
                    this.current_round.isOver = true
                    this.score[1] = this.score[1] + 1
                } 
                this.current_round.isOver;
            } else {
                animateResult(false)
                console.log(player," guessed wrong") 
            }
        } else { //player passed
            if (player == "C") {
                document.getElementsByClassName("c_text")[0].textContent = passReaction[getRandomInt(0, passReaction.length)]
            }
            console.log(player+ " passed")
        }
        //only used for debugging
        if(player == "C")
        console.log("bestGuess:", this.current_round.names[this.model.bestGuess()], "certainty", this.model.posterior[this.model.bestGuess()])
    }
}

//class that represents a single instance of a round
class Round {
    constructor() {
        this.lower_bound = 0;
        this.upper_bound = 100;
        this.names = [];
        this.collection = [];
        this.classes = []; //represents the classes of the samples (linear, exponential, etc.) 
        this.setupConcepts();
        this.concept;
        this.sample = [];
        this.concept_index;
        this.started= false;
        this.setConcept();
        this.isOver = false;
        this.turn = 0;
    }

    //sets up the concepts for the round
    //x0+x1*z+x2*base**z+x3*z**exponent
    setupConcepts() {
        let linear = [];
        let exp = [];
        let temp;
        //set up x0+x1*z
        linear.push(this.collection.length)
        for (let x1 = 1; x1 <= 20; x1++) {
            for (let x0 = 0; x0 < x1; x0++) {
                temp = buildConcept(x0, x1, 0, 0, 0, 0)
                if (temp.length >= 5) {
                    this.collection.push(temp.slice());
                    this.names.push(x0 + "+" + x1 + "z")
                }
            }
        }
        linear.push(this.collection.length - 1);
        this.classes.push(linear)

        //set up x0+x2*base**z
        exp.push(this.collection.length)
        for (let x2 = 1; x2 < 50; x2++) {
            for (let base = 2; base < 4; base++) {
                for(let x0 = 0; x0 < 100; x0++) {
                    //rule out redundant concepts
                    if (x2**2 == base) continue;
                    //TODO: filter out redundant concepts
                    temp = buildConcept(x0, 0, x2, base, 0, 0)
                    if (temp.length >= 5) {
                        this.collection.push(temp.slice());
                        this.names.push(x0 + "+" + x2 + "*" + base + "**z")
                    }    
                }
            }
        }
        exp.push(this.collection.length)
        this.classes.push(exp)
    }

    //choose a hidden concpet for this round
    setConcept() {
        if (this.concept != null) {
            return this.concept;
        }
        let temp = getRandomInt(0, this.classes.length);
        console.log("current range: "+this.classes[temp][0], this.classes[temp][1])
        this.concept_index = getRandomInt(this.classes[temp][0], this.classes[temp][1]);
        this.concept = this.collection[this.concept_index];
        console.log("concept:", this.names[this.concept_index])
    }

    //gets a sample from the hidden concept
    getNextSample() {
        if (this.concept == null) {
            console.log("no concept defined")
            return
        }
        if (this.sample.length == this.concept.length) {
            console.log("no further samples possible");
            return this.sample.slice()
        }
        let i = getRandomInt(0, this.concept.length);
        while(this.sample.includes(this.concept[i])) {
            i = getRandomInt(0, this.concept.length);
        }
        this.sample.push(this.concept[i]);
        this.turn++;
        return this.sample.slice();
    }

    //correctness if arrays are equal
    //-> hidden concept is less important than the array created from it
    isCorrectConcept(guess) {
        if (guess.length == this.collection[this.concept_index].length) {
            for (let i = 0; i < guess.length; i++) {
                if (guess[i] != this.collection[this.concept_index][i]) {
                    break
                }
            }
            return true
        }
        return false
    }

    //returns the name of the guess
    getNameOfGuess(guess) {
        loop1:
        for (let i = 0; i < this.collection.length; i++) {
            if (guess == null || this.collection[i] == null) continue;
            if (guess.length !== this.collection[i].length) continue;
            let j = 0;
            loop2:
            for (j = 0; j < guess.length; j++) {
                if (parseInt(guess[j]) != this.collection[i][j]) {
                    continue loop1
                }
            }
            return this.names[i];
        }
    }
}

//handles initial setup of website
function setup() {
    window.addEventListener('resize', function() {resize_handler()});
    ctx = setupCanvas(document.getElementsByClassName("canvas")[0]);
    updateCanvas(ctx,Array.from({length: 100},  (_, i) => i + 1), []);

    //turn on overlay
    turnOverlayOn();
    //adds functionality of "start/nextTurn" button
    const start_button = document.getElementsByClassName("start_button")[0];
    start_button.addEventListener("click", function() { if(game == null) {
        game = new Game();
        game.startGame(2);
        } else {
           next_turn_handler(); 
        } 
    });

    //adds functionality to "help" button
    const help_button = document.getElementsByClassName("help_button")[0];
    help_button.addEventListener("click", function() {
        turnOverlayOn();
    }); 

   //functionality of "pass" button
   const pass_button = document.getElementsByClassName("pass_button")[0];
   pass_button.addEventListener("click", function() { if (round != null && round.started) {       
       game.playersTurn = "pass";
   }
   })

   //functionality of the "guess" button
   const guess_button = document.getElementsByClassName("guess_button")[0];
   guess_button.addEventListener("click", function() {
    if (round != null && round.started) {
        game.playersTurn = "guess:" + current_guess;
    }})

    const input = document.getElementById("input");
    input.addEventListener("input", function() { input_handler(ctx, game.current_round.sample) })
}

//sets up the webseite for next game
function setupNextGame() {
    updateCanvas(ctx,Array.from({length: 100},  (_, i) => i + 1), []);
    game = null;
    document.getElementsByClassName("start_button")[0].textContent = "Start";
    buttonsClickable(false, true);
    updateScores(0, 0);
    document.getElementById("bayes_img").src = "/img/bayes.jpeg";
    showSample("");
    document.getElementById("result").innerHTML = '';
    document.getElementsByClassName("c_text")[0].textContent = "Better than Bayes?"
}

//disables/enables the player buttons
//if before game, only start button is clickable
function buttonsClickable(enableGameButtons, beforeGame) {
    const start_button = document.getElementsByClassName("start_button")[0];
    const pass_button = document.getElementsByClassName("pass_button")[0];
    const guess_button = document.getElementsByClassName("guess_button")[0];
    const input = document.getElementById("input");
    //beforeGame = true -> buttons are not clickable before game starts
    //beforeGame = false -> buttons are clikable only in players turn
    pass_button.disabled = !enableGameButtons;
    guess_button.disabled = !enableGameButtons
    input.disabled = !enableGameButtons
    if (beforeGame) {
        start_button.disabled = enableGameButtons
    }  
}

function next_turn_handler() {
    nextTurn = true;
}

//helper timeout function return a promise
const timeout = async ms => new Promise(res => setTimeout(res, ms));

//function that updates score of players
function updateScores(p_score, c_score) {
    document.getElementById("player_score").textContent = p_score
    document.getElementById("computer_score").textContent = c_score
}

//function that redraws the canvas
function resize_handler() {
    try{
        updateCanvas(ctx, current_guess, game.current_round.sample)
    } catch {
        updateCanvas(ctx, current_guess, [])
    }
}

//fucntion that turns of help overlay
function turnOverlayOff() {
    document.getElementsByClassName("overlay")[0].style.display = "none";
}

//function that turns on the help overlay
function turnOverlayOn() {
    updateTableValues();
    document.getElementsByClassName("overlay")[0].style.display = "block";
}

//function that retrieves curretn game score for score table
function updateTableValues() {
    if (game == null) {
        document.getElementsByClassName("player_score")[0].textContent = 0;
        document.getElementsByClassName("computer_score")[0].textContent = 0; 
    } else {
        document.getElementsByClassName("player_score")[0].textContent = game.score.slice()[0];
        document.getElementsByClassName("computer_score")[0].textContent = game.score.slice()[1]; 
        document.getElementsByClassName("player_score")[2].textContent = game.score.slice()[0];
        document.getElementsByClassName("computer_score")[2].textContent = game.score.slice()[1]; 
    }
    document.getElementsByClassName("player_score")[1].textContent = totalScore.slice()[0];
    document.getElementsByClassName("computer_score")[1].textContent = totalScore.slice()[1];
    document.getElementsByClassName("player_score")[3].textContent = totalScore.slice()[0];
    document.getElementsByClassName("computer_score")[3].textContent = totalScore.slice()[1];
}

//function that turns off the after-game overlay
function turnAfterGameOverlayOff() {
    document.getElementsByClassName("afterGame")[0].style.visibility = "hidden";
    setupNextGame();
}

//function that turns on the after-game overlay
function turnAfterGameOverlayOn() {
    updateTableValues();
    document.getElementsByClassName("afterGame")[0].style.visibility = 'visible';
}
  
//function that handles all concept inputs of player
//input of form: 2 + 3z
// 7+12*z
function input_handler(ctx, sample) {
    let concept = document.getElementById("input").value.replace(/[^-()\d/*+.z^]/g,"");
    //let concept = input.slice();
    if (concept.length == 0) {
        console.log("length of 0")
        return [0, 1]
    }
    let arr;
    if (concept.includes("+")) {
         arr = concept.split("+");
    } else if (concept.includes("-")) {
         arr = concept.split("-");
    } else {
         arr = [concept];
    }
    
    arr = arr.filter(Boolean);
    //x0 + x1*z +x2*base**z + x3*z**exponent
    let x0 = 0;
    let x1 = 0;
    let x2 = 0;
    let base = 0;
    let x3 = 0;
    let exponent = 0;
    for (let i = 0; i < arr.length;i++) {
        if (arr[i].includes("^")) {
            arr[i] = arr[i].replace("^", "**");
        }
        if (!arr[i].includes("z")) {
            try {
                arr[i] = eval(arr[i]);
            } 
            catch (e) {
                
                return [0, 1];
            }
            x0 = x0 + arr[i];
        } else {
            if (arr[i].includes("/")) {
                console.log("contains /");
                return [0, 1]
            }
            //2z
            //2*z
            //z**4
            if (arr[i].includes("**")) {
                    if (arr[i].indexOf("**") > arr[i].indexOf("z")) { // x3*z**exponent
                        exponent = exponent + eval(arr[i].substring(arr[i].indexOf("**") + 2))
                        if (arr[i].substring(0, arr[i].indexOf("z")).length != 0) {
                            if (arr[i].substring(0, arr[i].indexOf("z")).slice(-1) == "*") { //x3*z**exponent
                                x3 = x3 + eval(arr[i].substring(0, arr[i].indexOf("z") - 1));
                            }  else{ // x3z**exponent
                                x3 = x3 + eval(arr[i].substring(0, arr[i].indexOf("z")));
                            }
                        } else {
                            x3 = 1;
                        }
                    } else { //x2*base**z
                        if (arr[i].substring(0, arr[i].indexOf("**")).includes("*")) { //x2*base**z
                            base = eval(arr[i].substring(0, arr[i].indexOf("**")).substring(arr[i].substring(arr[i].indexOf("**")).lastIndexOf("*") + 1));
                            x2 = eval(arr[i].substring(0, arr[i].indexOf("**")).substring(0, arr[i].substring(0, arr[i].indexOf("**")).lastIndexOf("*")));
                        } else { //base**z
                            base = eval(arr[i].substring(0, arr[i].indexOf("**")));
                            x2 = 1
                        }
                    }
                
            
            } else { //x1*z or x1z  or z
                if (arr[i].length == 1) { // z
                    console.log("trivial")
                    x1 = x1 + 1
                } else {
                    if (arr[i].slice(-2, -1) == "*") {
                        x1 = x1 + eval(arr[i].substring(0, arr[i].length - 2))
                    } else {
                        x1 = x1 + eval(arr[i].substring(0, arr[i].length - 1))
                    }
                }
            }
        }
    }
    current_guess = buildConcept(x0, x1, x2, base, x3, exponent);
    updateCanvas(ctx, current_guess, sample)
}

//helper function, that builds the set of numbers according to concept
//x0+x1*z+x2*base**z+x3*z**exponent
function buildConcept(x0, x1, x2, base, x3, exponent) {
    let concept = [];
    let number;
    if (base != 0) {
         number = x0 + x2;
    } else {
         number = x0 ;
    }
    
    let lastNumber = number;
    concept.push(number);
    let duplicate  = 0;
    for (let k = -1; k > -100; k--) {
        number = x0 + x1 * k + x3 * k ** exponent
        if (number >= 0 && number <= 100 && Number.isInteger(number)) {
            concept.push(number);
            
        } else {
            break;
        }
        
        if (lastNumber == number) {
            duplicate = duplicate + 1;
            if (duplicate > 3) {
                break;
            }
        } else {
            duplicate = 0;
        }
        lastNumber = number;
    }
    
    for (let k = 1; k <= 100; k++) {
        number = x0 + x1 * k + x2 * Math.pow(base,k) + x3 * Math.pow(k, exponent)
        if (number >= 0 && number <= 100 && Number.isInteger(number)) {
            concept.push(number);
        } else {
            break;
        }
        
        if (lastNumber == number) {
            duplicate = duplicate + 1;
            if (duplicate > 3) {
                return buildConcept(0, 1, 0, 0, 0, 0);
            }
        } else {
            duplicate = 0;
        }
        lastNumber = number;
    }
    concept = concept.filter(Boolean)
    concept = [...new Set(concept)];
    return concept.sort(function(a, b) {return a - b});

}

//adjusts canvas to device pixel ratio
function setupCanvas(canvas) {
    // Get the device pixel ratio, falling back to 1.
    dpr = window.devicePixelRatio || 1;
    //set height and width wrt device pixel ratio
    let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    canvas.setAttribute('height', style_height * dpr);
    canvas.setAttribute('width', style_width * dpr);
    var ctx = canvas.getContext('2d');
    return ctx;
}

//draws guess on canvas according to current collection and sample
function updateCanvas(ctx, guess, sample) {

    ctx = setupCanvas(document.getElementsByClassName("canvas")[0]);
    clearCanvas(ctx);
    let width = ctx.canvas.width;
    let height = ctx. canvas.height;
    if (!alt_canvas) {
        let grid_size = width / 100; 
        //draw cooridinate system
        for (let i = 0; i <= 100; i = i + 10) {
            ctx.font = 2 * grid_size+"px arial";
            ctx.fillStyle ="black"
            ctx.fillText(i, grid_size + i * grid_size, 3 *height / 5 + 20 * grid_size / 4)   
        }

        // draw guess
        for (let i = 0; i <= 100; i++) {
            if (guess.includes(i)) {
                if (sample.includes(i)) {
                    ctx.fillStyle ="green";
                } else {
                    ctx.fillStyle = "black";
                }
                ctx.fillRect(grid_size + i * grid_size, 3 *  height / 5, 2 * grid_size / 4, 10 * grid_size / 4);
            }
        }

        // draw sample
        for (let i = 0; i <= 100; i++) {
            if (sample.includes(i)) {
                if (guess.includes(i)) {
                    ctx.fillStyle = "green"
                } else {
                    ctx.fillStyle = "red"
                }
                ctx.fillRect(grid_size +i*grid_size, 2*height/5, 2*grid_size/4, 10*grid_size/4);
            }
            
        }
    } else {
        let rowsize = height / 5;
        let grid_size = width / 21;
        let y_offset = rowsize /2.1

        for (let row = 0; row <= 4; row++) {
            for (let col = 10; col <= 20; col = col + 10){
                ctx.font = "bold " + rowsize/4+"px arial";
                ctx.fillStyle ="black"
                if (row * 20 + col == 100) {
                    ctx.fillText(row * 20 + col, col * grid_size - grid_size / 4, y_offset + rowsize * row + rowsize / 2.5);
                } else {
                    ctx.fillText(row * 20 + col, col * grid_size - grid_size / 8, y_offset + rowsize * row + rowsize / 2.5);
                }
            }
        }
        let radius = width / 70
        // draw guess
        for (let row = 0; row <= 4; row++) {
            for (let col = 1; col <= 20; col++){
                if (guess.includes(row * 20 + col)) {
                    if (sample.includes(row * 20 + col)) {
                        ctx.fillStyle ="green";
                    } else {
                        ctx.fillStyle = "black";
                    }
                    //ctx.fillRect(col*grid_size, rowsize+rowsize*row, width/70, width/70);
                    ctx.beginPath()
                    ctx.arc(col * grid_size + radius / 2, y_offset + rowsize * row + radius / 2, radius / 2, 0, 2 * Math.PI, false)
                    ctx.fill();
                }
            }
            
        }
        //draw samples
        for (let row = 0; row <= 4; row++) {
            for (let col = 1; col <= 20; col++){
                if (sample.includes(row * 20 + col)) {
                    if (guess.includes(row * 20 + col)) {
                        ctx.fillStyle = "green";
                    } else {
                        ctx.fillStyle = "red";
                    }
                    //ctx.fillRect(col*grid_size, rowsize+rowsize*row-grid_size/2, dpr*10, dpr*10);
                    ctx.beginPath()
                    ctx.arc(col * grid_size + radius / 2, y_offset + rowsize * row - grid_size / 2 + radius / 2, radius / 2, 0, 2 * Math.PI, false)
                    ctx.fill();
                }
            }
        }
    }
}

//clears canvas
function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// checks if a guess is the hidden concept of that round
function animateResult(guessedCorrectly) {
    if (guessedCorrectly) {
        document.getElementById("result").innerHTML = '<i class="fa-solid fa-circle-check"></i>'
        return true
    } else {
        document.getElementById("result").innerHTML = '<i class="fa-solid fa-circle-xmark"></i>'
        setTimeout(3000)
        return false
    }
}

//shows sample on the html file
function showSample(sample) {
    const current_sample = document.getElementsByClassName("current_sample")[0];
    current_sample.innerHTML = sample;
    updateCanvas(ctx,current_guess,sample)
}

// returns random Int n , where min <= n < max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
