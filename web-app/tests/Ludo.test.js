import Ludo from "../Ludo.js";

import assert from "assert";

describe("Simplified Ludo game module", function () {

    // Check that the new game starts with red.
    it("should start with Red player", function () {
        const game = Ludo.createGame();

        assert.equal(
            game.currentPlayer,
            "Red"
        );
    });

    // Check that getCurrentPlayer returns the active player.
    it("should return the current player", function () {
        const game = Ludo.createGame();

        assert.equal(
            Ludo.getCurrentPlayer(game),
            "Red"
        );
    });

    // Check that dice values are always within the valid range.
    it("should roll a dice value between 1 and 6", function () {
        const game = Ludo.createGame();
        const updatedGame = Ludo.rollDice(game);

        assert.ok(updatedGame.diceValue >= 1);
        assert.ok(updatedGame.diceValue <= 6);
    });

    // Check that a new game is not over.
    it("should not be over at the start", function () {
        const game = Ludo.createGame();

        assert.equal(
            Ludo.isGameOver(game),
            false
        );
    });

    // Check that a new game starts without a winner.
    it("should have no winner at the start", function () {
        const game = Ludo.createGame();

        assert.equal(
            Ludo.getWinner(game),
            null
        );
    });

    // Check that all pieces begin at Home.
    it("should start all pieces at Home", function () {
        const game = Ludo.createGame();

        assert.equal(game.redPieces[0].position, null);
        assert.equal(game.redPieces[1].position, null);
        assert.equal(game.bluePieces[0].position, null);
        assert.equal(game.bluePieces[1].position, null);

        assert.equal(game.redPieces[0].progress, null);
        assert.equal(game.redPieces[1].progress, null);
        assert.equal(game.bluePieces[0].progress, null);
        assert.equal(game.bluePieces[1].progress, null);
    });

    // Check that a piece cannot leave Home without rolling a 6.
    it("should not move a new piece out of Home when the dice value is not 6", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 4
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].position, null);
        assert.equal(updatedGame.redPieces[0].progress, null);
    });

    // Check that an invalid piece id does not change the game state.
    it("should ignore an invalid piece id", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 6
        };

        const updatedGame = Ludo.movePiece(game, "R3");

        assert.equal(updatedGame, game);
    });

    // Check that a red piece enters the board after rolling a 6.
    it("should move a new Red piece out of Home when the dice value is 6", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 6
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].position, 0);
        assert.equal(updatedGame.redPieces[0].progress, 0);
    });

    // Check that a blue piece enters from the Blue start square.
    it("should move a new Blue piece out of Home from Blue start position when the dice value is 6", function () {
        const game = {
            ...Ludo.createGame(),
            currentPlayer: "Blue",
            diceValue: 6
        };

        const updatedGame = Ludo.movePiece(game, "B1");

        assert.equal(updatedGame.bluePieces[0].position, 11);
        assert.equal(updatedGame.bluePieces[0].progress, 0);
    });

    // Check that rolling a value 6 gets an extra turn.
    it("should keep the same player's turn after rolling a 6", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 6
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(
            updatedGame.currentPlayer,
            "Red"
        );
    });

    // Check that the turn passes to the other player after a normal move.
    it("should switch turn after moving with a dice value that is not 6", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 3, progress: 3 },
                { id: "R2", position: null, progress: null }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(
            updatedGame.currentPlayer,
            "Blue"
        );
    });

    // Check that red movement follows the shared path correctly.
    it("should move a Red piece around the shared public path according to progress", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 3, progress: 3 },
                { id: "R2", position: null, progress: null }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].progress, 7);
        assert.equal(updatedGame.redPieces[0].position, 7);
    });

    // Check that landing on an opponent sends the opponent back home.
    it("should send an opponent piece back Home when landing on it on the shared public path", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 3, progress: 3 },
                { id: "R2", position: null, progress: null }
            ],
            bluePieces: [
                { id: "B1", position: 7, progress: 18 },
                { id: "B2", position: null, progress: null }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].position, 7);
        assert.equal(updatedGame.redPieces[0].progress, 7);
        assert.equal(updatedGame.bluePieces[0].position, null);
        assert.equal(updatedGame.bluePieces[0].progress, null);
    });

    // Check that pieces in final lanes cannot be captured.
    it("should not capture an opponent piece in a final lane", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: "Red-final-1", progress: 22 },
                { id: "R2", position: null, progress: null }
            ],
            bluePieces: [
                { id: "B1", position: "Red-final-5", progress: 26 },
                { id: "B2", position: null, progress: null }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].position, "Red-final-5");
        assert.equal(updatedGame.redPieces[0].progress, 26);
        assert.equal(updatedGame.bluePieces[0].position, "Red-final-5");
        assert.equal(updatedGame.bluePieces[0].progress, 26);
    });

    // Check that blue movement follows the shared path correctly.
    it("should move a Blue piece around the shared public path from Blue start position", function () {
        const game = {
            ...Ludo.createGame(),
            currentPlayer: "Blue",
            diceValue: 4,
            bluePieces: [
                { id: "B1", position: 14, progress: 3 },
                { id: "B2", position: null, progress: null }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "B1");

        assert.equal(updatedGame.bluePieces[0].progress, 7);
        assert.equal(updatedGame.bluePieces[0].position, 18);
    });

    // Check that blue transitions correctly into its final lane.
    it("should wrap a Blue piece around the shared public path", function () {
        const game = {
            ...Ludo.createGame(),
            currentPlayer: "Blue",
            diceValue: 4,
            bluePieces: [
                { id: "B1", position: 10, progress: 21 },
                { id: "B2", position: null, progress: null }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "B1");

        assert.equal(updatedGame.bluePieces[0].progress, 25);
        assert.equal(updatedGame.bluePieces[0].position, "Blue-final-4");
    });

    // Check that red enters its final lane after completing the public path.
    it("should move a Red piece into the Red final lane after public path progress 21", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 20, progress: 20 },
                { id: "R2", position: null, progress: null }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].progress, 24);
        assert.equal(updatedGame.redPieces[0].position, "Red-final-3");
    });

    // Check that one finished piece is not enough to win.
    it("should not set a winner when only one piece reaches final progress", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 6,
            redPieces: [
                { id: "R1", position: "Red-final-4", progress: 25 },
                { id: "R2", position: 10, progress: 10 }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].progress, 26);
        assert.equal(updatedGame.redPieces[0].position, "Red-final-5");
        assert.equal(updatedGame.winner, null);
    });

    // Check that a player wins when both pieces reach the finish.
    it("should set the winner when both pieces reach final progress", function () {
        const game = {
            ...Ludo.createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: "Red-final-1", progress: 22 },
                { id: "R2", position: "Red-final-5", progress: 26 }
            ]
        };

        const updatedGame = Ludo.movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].progress, 26);
        assert.equal(updatedGame.redPieces[0].position, "Red-final-5");
        assert.equal(updatedGame.winner, "Red");
    });

    // Check that the game is marked as over once a winner exists.
    it("should be over when there is a winner", function () {
        const game = {
            ...Ludo.createGame(),
            winner: "Red"
        };

        assert.equal(
            Ludo.isGameOver(game),
            true
        );
    });

});