/**
 * This is a module for modelling and playing a two-player Ludo game.
 * @namespace Ludo
 * @author Yixuan Liu
 * @version 2026
 */

const Ludo = Object.create(null);

/**
 * Players' colour in the game.
 * @memberof Ludo
 * @typedef {("Red" | "Blue")} Player
 */

/**
 * A Ludo piece.
 * `position` is either `null` for Home, a number for the shared public path,
 * or a string for the final lane of each colour.
 * @memberof Ludo
 * @typedef {Object} Piece
 * @property {string} id The id of the piece.
 * @property {(number | string | null)} position The piece's position on the board.
 * @property {(number | null)} progress The distance that the piece has travelled from the start.
 */

/**
 * The whole game state.
 * @memberof Ludo
 * @typedef {Object} GameState
 * @property {Ludo.Player} currentPlayer The current player.
 * @property {(number | null)} diceValue The current dice value.
 * @property {Ludo.Piece[]} redPieces The Red player's pieces.
 * @property {Ludo.Piece[]} bluePieces The Blue player's pieces.
 * @property {(Ludo.Player | null)} winner The winning player, or null if no player has won.
 */

/**
 * Creates a new game.
 *
 * @memberof Ludo
 * @function
 * @returns {Ludo.GameState} The start state of the game.
 */

Ludo.createGame = function () {
    return {
        currentPlayer: "Red",

        diceValue: null,

        redPieces: [
            { id: "R1", position: null, progress: null },
            { id: "R2", position: null, progress: null }
        ],

        bluePieces: [
            { id: "B1", position: null, progress: null },
            { id: "B2", position: null, progress: null }
        ],

        winner: null
    };
};

/**
 * Returns the current player.
 *
 * @memberof Ludo
 * @function
 * @param {Ludo.GameState} gameState The current game state.
 * @returns {Ludo.Player} The current player.
 */
Ludo.getCurrentPlayer = function (gameState) {
    return gameState.currentPlayer;
};

/**
 * Rolls the dice and stores the value in the game state.
 *
 * @memberof Ludo
 * @function
 * @param {Ludo.GameState} gameState The current game state.
 * @returns {Ludo.GameState} Updated game state with a dice value.
 */
Ludo.rollDice = function (gameState) {
    const diceValue = Math.floor(Math.random() * 6) + 1;

    return {
        ...gameState,
        diceValue: diceValue
    };
};

/**
 * Checks whether the game has ended.
 *
 * @memberof Ludo
 * @function
 * @param {Ludo.GameState} gameState The current game state.
 * @returns {boolean} True if the game is over, otherwise false.
 */
Ludo.isGameOver = function (gameState) {
    return gameState.winner !== null;
};

/**
 * Returns the winner of the game.
 *
 * @memberof Ludo
 * @function
 * @param {Ludo.GameState} gameState The current game state.
 * @returns {(Ludo.Player | null)} The winner, or null if there is no winner.
 */
Ludo.getWinner = function (gameState) {
    return gameState.winner;
};

/**
 * Moves the selected piece forward according to the dice value.
 * Pieces that are still at Home can only enter the board when the dice value is 6.
 * Each player first moves around the shared public path from progress 0 to 21, then enters their own final lane from progress 22 to 26.
 * If a piece lands on an opponent's piece on the shared public path, the opponent's piece will be sent back Home.
 *
 * @memberof Ludo
 * @function
 * @param {Ludo.GameState} gameState The current game state.
 * @param {string} pieceId The id of the selected piece.
 * @returns {Ludo.GameState} Updated game state after moving the piece.
 */
Ludo.movePiece = function (gameState, pieceId) {
    const currentPlayer = gameState.currentPlayer;
    const diceValue = gameState.diceValue;

    const pieceGroups = {
        Red: "redPieces",
        Blue: "bluePieces"
    };

    const startPositions = {
        Red: 0,
        Blue: 11
    };

    const pathLength = 22;
    const publicPathProgressLimit = 21;
    const finishProgress = 26;

    const currentPiecesKey = pieceGroups[currentPlayer];

    const opponentPiecesKey = currentPlayer === "Red"
        ? "bluePieces"
        : "redPieces";

    const selectedPiece = gameState[currentPiecesKey].find((piece) => {
        return piece.id === pieceId;
    });

    if (!selectedPiece) {
        return gameState;
    }

    if (selectedPiece.position === null && diceValue !== 6) {
        return gameState;
    }

    const updatedPieces = gameState[currentPiecesKey].map((piece) => {
        if (piece.id === pieceId) {
            const newProgress = piece.progress === null
                ? 0
                : Math.min(piece.progress + diceValue, finishProgress);

            const newPosition = newProgress <= publicPathProgressLimit
                ? (startPositions[currentPlayer] + newProgress) % pathLength
                : `${currentPlayer}-final-${newProgress - publicPathProgressLimit}`;

            return {
                ...piece,
                position: newPosition,
                progress: newProgress
            };
        }

        return piece;
    });

    const movedPiece = updatedPieces.find((piece) => {
        return piece.id === pieceId;
    });

    const updatedOpponentPieces = gameState[opponentPiecesKey].map((piece) => {
        const movedToPublicPath = typeof movedPiece.position === "number";
        const opponentOnSameSpace = piece.position === movedPiece.position;

        if (movedToPublicPath && opponentOnSameSpace) {
            return {
                ...piece,
                position: null,
                progress: null
            };
        }

        return piece;
    });

    const hasWon = updatedPieces.every((piece) => {
        return piece.progress !== null && piece.progress >= finishProgress;
    });

    return {
        ...gameState,
        [currentPiecesKey]: updatedPieces,
        [opponentPiecesKey]: updatedOpponentPieces,
        currentPlayer: hasWon
            ? currentPlayer
            : diceValue === 6
                ? currentPlayer
                : currentPlayer === "Red"
                    ? "Blue"
                    : "Red",
        diceValue: null,
        winner: hasWon ? currentPlayer : null
    };
};

export default Object.freeze(Ludo);