class Bot {
    constructor() {
        this.coreMoves = ["R", "P", "S"];
        this.numberOfDynamites = 100;
        this.botScore = 0;
        this.enemyScore = 0;
        this.movesSoFar = 0;
    }

    pickCoreMove() {
        const random = Math.floor(Math.random() * this.coreMoves.length);
        return this.coreMoves[random]
    }

    isThereDynamiteLeft() {
        if (this.numberOfDynamites > 0) {
            return true;
        }
    }

    makeMove(gamestate) {

        // Chance of n draws in a row is (1/3)^n
        // expected n-draws in a row is (number of moves left) * (1/3)^n
        // if number of moves left is less than expected chance of n-draws in a row, don't wait to use dynamite there.
        // expected moves left = floor ((1000 - botScore), (1000 - enemyScore), (2500 - movesSoFar)


        if (this.isThereDynamiteLeft()) {
            this.numberOfDynamites--
            return "D"
        }

        return this.pickCoreMove()
    }
}

const bot = new Bot();
for (let i=0; i<110; i++) {
    console.log(bot.makeMove())
}

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
// {rounds: [
//         {
//             p1 : "R",
//             p2 : "D"
//         },
//         {
//             p1 : "W",
//             p2 : "S"
//         },
//         ...]
// }

// module.exports = new Bot();
