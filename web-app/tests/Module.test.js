import {
    createGame,
    getCurrentPlayer,
    rollDice,
    isGameOver,
    getWinner,
    movePiece
} from "../Module.js";

import assert from "assert";

describe("Simplified Ludo game module", () => {

    it("should start with Red player", () => {
        const game = createGame();

        assert.equal(
            game.currentPlayer,
            "Red"
        );
    });

    it("should return the current player", () => {
        const game = createGame();

        assert.equal(
            getCurrentPlayer(game),
            "Red"
        );
    });

    it("should roll a dice value between 1 and 6", () => {
        const game = createGame();
        const updatedGame = rollDice(game);

        assert.ok(updatedGame.diceValue >= 1);
        assert.ok(updatedGame.diceValue <= 6);
    });

    it("should not be over at the start", () => {
        const game = createGame();

        assert.equal(
            isGameOver(game),
            false
        );
    });

    it("should have no winner at the start", () => {
        const game = createGame();

        assert.equal(
            getWinner(game),
            null
        );
    });

    it("should start all pieces at Home", () => {
        const game = createGame();

        assert.equal(game.redPieces[0].position, null);
        assert.equal(game.redPieces[1].position, null);
        assert.equal(game.bluePieces[0].position, null);
        assert.equal(game.bluePieces[1].position, null);
    });

    it("should not move a new piece out of Home when the dice value is not 6", () => {
        const game = {
            ...createGame(),
            diceValue: 4
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(
            updatedGame.redPieces[0].position,
            null
        );
    });

    it("should move a new Red piece out of Home when the dice value is 6", () => {
        const game = {
            ...createGame(),
            diceValue: 6
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(
            updatedGame.redPieces[0].position,
            0
        );
    });

    it("should keep the same player's turn after rolling a 6", () => {
        const game = {
            ...createGame(),
            diceValue: 6
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(
            updatedGame.currentPlayer,
            "Red"
        );
    });

    it("should switch turn after moving with a dice value that is not 6", () => {
        const game = {
            ...createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 3 },
                { id: "R2", position: null }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(
            updatedGame.currentPlayer,
            "Blue"
        );
    });

    it("should move a piece that is already on the board according to the dice value", () => {
        const game = {
            ...createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 3 },
                { id: "R2", position: null }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(
            updatedGame.redPieces[0].position,
            7
        );
    });

    it("should set the winner when both pieces reach Home", () => {
        const game = {
            ...createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 16 },
                { id: "R2", position: 20 }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(
            updatedGame.winner,
            "Red"
        );
    });

    it("should be over when there is a winner", () => {
        const game = {
            ...createGame(),
            winner: "Red"
        };

        assert.equal(
            isGameOver(game),
            true
        );
    });

    it("should cap a piece position at 20 when moving beyond Home", () => {
        const game = {
            ...createGame(),
            diceValue: 6,
            redPieces: [
                { id: "R1", position: 18 },
                { id: "R2", position: null }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(
            updatedGame.redPieces[0].position,
            20
        );
    });

});
