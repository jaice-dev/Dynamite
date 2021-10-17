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

        if (Object.keys(this.enemyHistory).length === 0) return null
        if (numberOfDraws === 0) return null

        const movehistory = this.enemyHistory[numberOfDraws]

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

        if (this.accumulatedPoints > 0) {
            // Add move following a draw to enemyHistory
            if (this.accumulatedPoints in this.enemyHistory) {
                this.enemyHistory[this.accumulatedPoints] += currentMove["p2"]
            } else {
                this.enemyHistory[this.accumulatedPoints] = currentMove["p2"]
            }
        }
    }

    makeMove(gamestate) {

        if (gamestate["rounds"].length !== 0) {
            this.keepScore(gamestate["rounds"][gamestate["rounds"].length -1])
        }

        const expectedTurnsLeft = Math.min(((1000 - this.botScore) + (1000 - this.enemyScore)), (2500 - this.movesSoFar));

        //If there is a predicted move above set confidence level, return it
        let possibleMove = this.getMostLikelyWinningMoveAfterDraws(this.accumulatedPoints)
        if (possibleMove != null) {
            return possibleMove
        }

        //Otherwise, play as normal
        //When to use dynamite:
        if(this.isThereDynamiteLeft()){

            const turnsPerDynamite = expectedTurnsLeft / this.botNumberOfDynamites
            //assume 1/3 chance of draw per play - big assumption? - add chance of both using dynamite?
            // rough expected length of draws is log base 3 (n (2/3)) where n is number of plays
            // See https://math.stackexchange.com/questions/1409372/what-is-the-expected-length-of-the-largest-run-of-heads-if-we-make-1-000-flips
            const expectedMaxRunOfDraws = Math.round(Math.log(turnsPerDynamite * (2/3))/ Math.log(3))

            if (this.accumulatedPoints >= expectedMaxRunOfDraws) {
                if (Math.random() >= 0.5)
                    return "D"
            }
        }

        //pick random move
        return this.pickCoreMove()
    }
}

module.exports = new Bot();
