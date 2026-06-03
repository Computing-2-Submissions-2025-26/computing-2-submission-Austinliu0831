/**
 * Creates a new simplified Ludo game.
 *
 * @returns {Object} The initial game state.
 */
export function createGame() {
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
}

/**
 * Returns the current player.
 *
 * @param {Object} gameState The current game state.
 * @returns {String} The current player.
 */
export function getCurrentPlayer(gameState) {
    return gameState.currentPlayer;
}

/**
 * Rolls a six-sided dice and stores the value in the game state.
 *
 * @param {Object} gameState The current game state.
 * @returns {Object} Updated game state with a dice value.
 */
export function rollDice(gameState) {
    const diceValue = Math.floor(Math.random() * 6) + 1;

    return {
        ...gameState,
        diceValue: diceValue
    };
}

/**
 * Checks whether the game has ended.
 *
 * @param {Object} gameState The current game state.
 * @returns {Boolean} True if the game is over, otherwise false.
 */
export function isGameOver(gameState) {
    return gameState.winner !== null;
}

/**
 * Returns the winner of the game.
 *
 * @param {Object} gameState The current game state.
 * @returns {String|null} The winner, or null if there is no winner.
 */
export function getWinner(gameState) {
    return gameState.winner;
}

/**
 * Moves the selected piece forward according to the current dice value.
 * Pieces that are still at Home can only enter the board when the dice value is 6.
 * Each player first moves around the shared public path from progress 0 to 21, then enters their own final lane from progress 22 to 26.
 * If a piece lands on an opponent's piece on the shared public path, the opponent's piece is sent back Home.
 *
 * @param {Object} gameState The current game state.
 * @param {String} pieceId The id of the selected piece.
 * @returns {Object} Updated game state after moving the piece.
 */
export function movePiece(gameState, pieceId) {
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
}