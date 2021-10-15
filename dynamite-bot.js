class Bot {
    constructor() {
        this.coreMoves = ["R", "P", "S"];
        this.botNumberOfDynamites = 100;
        this.enemyNumberOfDynamites = 100;
        this.botScore = 0;
        this.enemyScore = 0;
        this.movesSoFar = 0;
        this.accumulatedPoints = 0;
    }

    pickCoreMove() {
        const random = Math.floor(Math.random() * this.coreMoves.length);
        return this.coreMoves[random]
    }

    isThereDynamiteLeft() {
        if (this.botNumberOfDynamites > 0) {
            return true;
        }
    }

    keepScore(gamestateRounds) {
        //MUST PASS IN THE LAST ROUND
        // Updates player and enemy scores for previous rounds
        // Keeps track of accumulated points
        // Manages dynamite levels

        let currentMove = gamestateRounds;

        //Draws
        if ((currentMove["p1"] === "R" && currentMove["p2"] === "R")
            || (currentMove["p1"] === "P" && currentMove["p2"] === "P")
            || (currentMove["p1"] === "S" && currentMove["p2"] === "S")
            || (currentMove["p1"] === "D" && currentMove["p2"] === "D")
            || (currentMove["p1"] === "W" && currentMove["p2"] === "W")) {

            this.accumulatedPoints++

        }

        //Bot Wins
        else if ((currentMove["p1"] === "R" && currentMove["p2"] === "S")
            || (currentMove["p1"] === "P" && currentMove["p2"] === "R")
            || (currentMove["p1"] === "S" && currentMove["p2"] === "P")
            || (currentMove["p1"] === "D" && currentMove["p2"] !== "W")
            || (currentMove["p1"] === "W" && currentMove["p2"] === "D")) {

            this.botScore += 1 + this.accumulatedPoints;
            this.accumulatedPoints = 0;

        }

        //Enemy Wins
        else if ((currentMove["p1"] === "R" && currentMove["p2"] === "P")
            || (currentMove["p1"] === "P" && currentMove["p2"] === "S")
            || (currentMove["p1"] === "S" && currentMove["p2"] === "R")
            || (currentMove["p1"] !== "W" && currentMove["p2"] === "D")
            || (currentMove["p1"] === "D" && currentMove["p2"] === "W")) {

            this.enemyScore += 1 + this.accumulatedPoints;
            this.accumulatedPoints = 0;

        }

        //Keep track of Dynamites
        if (currentMove["p1"] === "D") this.botNumberOfDynamites--
        if (currentMove["p2"] === "D") this.enemyNumberOfDynamites--

        this.movesSoFar++

    }

    makeMove(gamestate) {

        // Chance of n draws in a row is (1/3)^n
        // expected n-draws in a row is (number of moves left) * (1/3)^n
        // if number of moves left is less than expected chance of n-draws in a row, don't wait to use dynamite there.
        // expected moves left = floor ((1000 - botScore), (1000 - enemyScore), (2500 - movesSoFar)

        for (let i = 0; i < gamestate["rounds"].length; i++) {
            this.keepScore(gamestate["rounds"][i])
        }
        //Normally
        // this.keepScore(gamestate["rounds"][gamestate["rounds"].length -1])



        console.log(`Bot dynamites: ${this.botNumberOfDynamites}, 
        enemy dynamites: ${this.enemyNumberOfDynamites}, 
        bot score: ${this.botScore}, 
        enemy score: ${this.enemyScore}, 
        moves so far ${this.movesSoFar}, 
        accumulated points: ${this.accumulatedPoints}`)

        if (this.isThereDynamiteLeft()) {
            return "D"
        }

        return this.pickCoreMove()
    }
}

let gamestate = {
    rounds: [
        {
            p1: "R",
            p2: "R"
        },
        {
            p1: "W",
            p2: "W"
        },
        {
            p1: "D",
            p2: "D"
        },
        {
            p1: "S",
            p2: "D"
        }]
};

const bot = new Bot();
bot.makeMove(gamestate)



// 100 sticks of Dynamite
    // play until one player reaches 1000 points
    // maximum of 2500 rounds

    // Dynamite
    // when to use Dynamite. the more ties there have been, the more valuable the dynamite.
    // calculate how many ties, double ties, triple ties etc there were
    // likely to be in the remainder of the game, and compared that to the number of
    // sticks of dynamite I had left to decide whether the current move was valuable
    // enough to use my dynamite on.
    // used dynamite about a third of the time that I thought it was worth it.
    // I think the 1/3rd figure is quite important, because it maximises my own
    // opportunity to win points, while making it expensive for my opponent to water
    // balloon me on the off-chance that I use the dynamite.

    // predicting what my opponent would do.
    // I kept a history of “number of ties => corresponding move”,
    // and various other combinations of historical factors, which I weighted to predict
    // the next move. And then based on that prediction, went for an appropriate counter-move
    // designed to maximise my expected score.

// Form of Gamestate: an array containing each players moves for all previous rounds


// module.exports = new Bot();
