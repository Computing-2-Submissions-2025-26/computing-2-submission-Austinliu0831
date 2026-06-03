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

        assert.equal(game.redPieces[0].progress, null);
        assert.equal(game.redPieces[1].progress, null);
        assert.equal(game.bluePieces[0].progress, null);
        assert.equal(game.bluePieces[1].progress, null);
    });

    it("should not move a new piece out of Home when the dice value is not 6", () => {
        const game = {
            ...createGame(),
            diceValue: 4
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].position, null);
        assert.equal(updatedGame.redPieces[0].progress, null);
    });

    it("should move a new Red piece out of Home when the dice value is 6", () => {
        const game = {
            ...createGame(),
            diceValue: 6
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].position, 0);
        assert.equal(updatedGame.redPieces[0].progress, 0);
    });

    it("should move a new Blue piece out of Home from Blue start position when the dice value is 6", () => {
        const game = {
            ...createGame(),
            currentPlayer: "Blue",
            diceValue: 6
        };

        const updatedGame = movePiece(game, "B1");

        assert.equal(updatedGame.bluePieces[0].position, 11);
        assert.equal(updatedGame.bluePieces[0].progress, 0);
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
                { id: "R1", position: 3, progress: 3 },
                { id: "R2", position: null, progress: null }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(
            updatedGame.currentPlayer,
            "Blue"
        );
    });

    it("should move a Red piece around the shared public path according to progress", () => {
        const game = {
            ...createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 3, progress: 3 },
                { id: "R2", position: null, progress: null }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].progress, 7);
        assert.equal(updatedGame.redPieces[0].position, 7);
    });

    it("should send an opponent piece back Home when landing on it on the shared public path", () => {
        const game = {
            ...createGame(),
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

        const updatedGame = movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].position, 7);
        assert.equal(updatedGame.redPieces[0].progress, 7);
        assert.equal(updatedGame.bluePieces[0].position, null);
        assert.equal(updatedGame.bluePieces[0].progress, null);
    });

    it("should not capture an opponent piece in a final lane", () => {
        const game = {
            ...createGame(),
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

        const updatedGame = movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].position, "Red-final-5");
        assert.equal(updatedGame.redPieces[0].progress, 26);
        assert.equal(updatedGame.bluePieces[0].position, "Red-final-5");
        assert.equal(updatedGame.bluePieces[0].progress, 26);
    });

    it("should move a Blue piece around the shared public path from Blue start position", () => {
        const game = {
            ...createGame(),
            currentPlayer: "Blue",
            diceValue: 4,
            bluePieces: [
                { id: "B1", position: 14, progress: 3 },
                { id: "B2", position: null, progress: null }
            ]
        };

        const updatedGame = movePiece(game, "B1");

        assert.equal(updatedGame.bluePieces[0].progress, 7);
        assert.equal(updatedGame.bluePieces[0].position, 18);
    });

    it("should wrap a Blue piece around the shared public path", () => {
        const game = {
            ...createGame(),
            currentPlayer: "Blue",
            diceValue: 4,
            bluePieces: [
                { id: "B1", position: 10, progress: 21 },
                { id: "B2", position: null, progress: null }
            ]
        };

        const updatedGame = movePiece(game, "B1");

        assert.equal(updatedGame.bluePieces[0].progress, 25);
        assert.equal(updatedGame.bluePieces[0].position, "Blue-final-4");
    });

    it("should move a Red piece into the Red final lane after public path progress 21", () => {
        const game = {
            ...createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: 20, progress: 20 },
                { id: "R2", position: null, progress: null }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].progress, 24);
        assert.equal(updatedGame.redPieces[0].position, "Red-final-3");
    });

    it("should not set a winner when only one piece reaches final progress", () => {
        const game = {
            ...createGame(),
            diceValue: 6,
            redPieces: [
                { id: "R1", position: "Red-final-4", progress: 25 },
                { id: "R2", position: 10, progress: 10 }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].progress, 26);
        assert.equal(updatedGame.redPieces[0].position, "Red-final-5");
        assert.equal(updatedGame.winner, null);
    });

    it("should set the winner when both pieces reach final progress", () => {
        const game = {
            ...createGame(),
            diceValue: 4,
            redPieces: [
                { id: "R1", position: "Red-final-1", progress: 22 },
                { id: "R2", position: "Red-final-5", progress: 26 }
            ]
        };

        const updatedGame = movePiece(game, "R1");

        assert.equal(updatedGame.redPieces[0].progress, 26);
        assert.equal(updatedGame.redPieces[0].position, "Red-final-5");
        assert.equal(updatedGame.winner, "Red");
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

});
