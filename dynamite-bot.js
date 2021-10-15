class Bot {
    constructor() {
        this.coreMoves = ["R", "P", "S"];
        this.botNumberOfDynamites = 100;
        this.enemyNumberOfDynamites = 100;
        this.botScore = 0;
        this.enemyScore = 0;
        this.movesSoFar = 0;
        this.accumulatedPoints = 0;
        this.enemyHistory = {};
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

    getMostLikelyWinningMoveAfterDraws(numberOfDraws) {

        let RNumber = 0;
        let PNumber = 0;
        let SNumber = 0;
        let DNumber = 0;
        let WNumber = 0;

        const certaintlyLevel = 0.75

        const movehistory = this.enemyHistory[numberOfDraws]


        // var getMax = function (str) {
        //     var max = 0,
        //         maxChar = '';
        //     str.split('').forEach(function(char){
        //         if(str.split(char).length > max) {
        //             max = str.split(char).length;
        //             maxChar = char;
        //         }
        //     });

        for (let i = 0; i < movehistory.length; i++) {
            if (movehistory[i] === "R") RNumber++
            if (movehistory[i] === "P") PNumber++
            if (movehistory[i] === "S") SNumber++
            if (movehistory[i] === "D") DNumber++
            if (movehistory[i] === "W") WNumber++
        }

        if ((RNumber / movehistory.length) > certaintlyLevel) return "P"
        if ((PNumber / movehistory.length) > certaintlyLevel) return "S"
        if ((SNumber / movehistory.length) > certaintlyLevel) return "R"
        if ((DNumber / movehistory.length) > certaintlyLevel) return "W"
        if ((WNumber / movehistory.length) > certaintlyLevel) return this.pickCoreMove()

        return null
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
            || (currentMove["p1"] === "W" && currentMove["p2"] === "D")
            || ((currentMove["p1"] === "R" || currentMove["p1"] === "P" || currentMove["p1"] === "S") && currentMove["p2"] === "W")) {

            this.botScore += 1 + this.accumulatedPoints;
            this.accumulatedPoints = 0;

        }

        //Enemy Wins
        else if ((currentMove["p1"] === "R" && currentMove["p2"] === "P")
            || (currentMove["p1"] === "P" && currentMove["p2"] === "S")
            || (currentMove["p1"] === "S" && currentMove["p2"] === "R")
            || (currentMove["p1"] !== "W" && currentMove["p2"] === "D")
            || (currentMove["p1"] === "D" && currentMove["p2"] === "W")
            || (currentMove["p1"] === "W" && (currentMove["p2"] === "R" || currentMove["p2"] === "P" || currentMove["p2"] === "S"))) {

            this.enemyScore += 1 + this.accumulatedPoints;
            this.accumulatedPoints = 0;

        }

        //Keep track of Dynamites
        if (currentMove["p1"] === "D") this.botNumberOfDynamites--
        if (currentMove["p2"] === "D") this.enemyNumberOfDynamites--

        this.movesSoFar++

        //if enemy has broken run of draws, keep a history of the move
        if (this.accumulatedPoints > 0) {

            if (this.accumulatedPoints in this.enemyHistory) {
                this.enemyHistory[this.accumulatedPoints] += currentMove["p2"]
            } else {
                this.enemyHistory[this.accumulatedPoints] = currentMove["p2"]
            }
        }
    }

    makeMove(gamestate) {

        // KeepScore testing
        // for (let i = 0; i < gamestate["rounds"].length; i++) {
        //     this.keepScore(gamestate["rounds"][i])
        // }
        // console.log(`Bot dynamites: ${this.botNumberOfDynamites},
        // enemy dynamites: ${this.enemyNumberOfDynamites},
        // bot score: ${this.botScore},
        // enemy score: ${this.enemyScore},
        // moves so far ${this.movesSoFar},
        // accumulated points: ${this.accumulatedPoints}`)

        if (gamestate["rounds"].length !== 0) {
            this.keepScore(gamestate["rounds"][gamestate["rounds"].length -1])
        }

        const expectedTurnsLeft = Math.min(((1000 - this.botScore) + (1000 - this.enemyScore)), (2500 - this.movesSoFar));

        let possibleMove = this.getMostLikelyWinningMoveAfterDraws()
        if (possibleMove != null) {
            return possibleMove
        }

        //When to use dynamite
        if(this.isThereDynamiteLeft()){

            const turnsPerDynamite = expectedTurnsLeft / this.botNumberOfDynamites
            //assume 1/3 chance of draw per play - big assumption? - add chance of both using dynamite?
            // rough expected length of draws is log base 3 (n (2/3)) where n is number of plays
            const expectedMaxRunOfDraws = Math.round(Math.log(turnsPerDynamite * (2/3))/ Math.log(3))

            if (this.accumulatedPoints >= expectedMaxRunOfDraws) {
                return "D"
                //TODO Dynamite everytime? Or only say 1/2 the time
            }
            // console.log(`Expected turns left: ${expectedTurnsLeft},
            // turns per dynamite: ${turnsPerDynamite}, expectedMaxRun: ${expectedMaxRunOfDraws}`)
        }

        // Predict enemy moves
        // keep history of number of ties to corresponding move



        return this.pickCoreMove()
    }
}

// let gamestate = {
//     rounds: [
//         {
//             p1: "R",
//             p2: "D"
//         },
//         {
//             p1: "W",
//             p2: "S"
//         }]
// };
//
// const bot = new Bot();
// bot.makeMove(gamestate)



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


module.exports = new Bot();
