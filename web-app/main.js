import Ludo from "./Ludo.js";

let game = Ludo.createGame();
let rollMessage = "";
let displayedDiceValue = null;

const currentPlayerText =
    document.getElementById("current-player");

const diceValueText =
    document.getElementById("dice-value");

const diceFace =
    document.getElementById("dice-face");

const statusText =
    document.getElementById("status-text");

const boardDiv =
    document.getElementById("board");

const winnerText =
    document.getElementById("winner");

const rollButton = diceFace;

const restartButton =
    document.getElementById("restart-button");

function switchPlayer(player) {
    return player === "Red" ? "Blue" : "Red";
}

function canMoveWithDice(piece, diceValue) {
    return diceValue !== null && (piece.position !== null || diceValue === 6);
}

function currentPlayerHasMove(gameState) {
    const currentPieces = gameState.currentPlayer === "Red"
        ? gameState.redPieces
        : gameState.bluePieces;

    return currentPieces.some((piece) => {
        return canMoveWithDice(piece, gameState.diceValue);
    });
}

function renderDiceFace(diceValue) {
    const dicePatterns = {
        1: ["center"],
        2: ["top-left", "bottom-right"],
        3: ["top-left", "center", "bottom-right"],
        4: ["top-left", "top-right", "bottom-left", "bottom-right"],
        5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
        6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"]
    };

    if (diceValue === null) {
        return "";
    }

    return dicePatterns[diceValue]
        .map((position) => {
            return `<span class="dice-dot ${position}"></span>`;
        })
        .join("");
}

function renderPieceButton(piece, colourClass) {
    const piecePlayer = piece.id.startsWith("R") ? "Red" : "Blue";
    const isCurrentPlayerPiece = game.currentPlayer === piecePlayer;
    const canMovePiece = isCurrentPlayerPiece && canMoveWithDice(piece, game.diceValue) && !game.winner;

    return `
        <button
            class="piece ${colourClass}"
            data-piece-id="${piece.id}"
            aria-label="Move ${piece.id}"
            ${canMovePiece ? "" : "disabled"}
        >
            ${piece.id}
        </button>
    `;
}

function render() {
    currentPlayerText.innerHTML = `
        Current Player:
        <span class="current-player-name ${game.currentPlayer === "Red" ? "player-red" : "player-blue"}">
            ${game.currentPlayer}
        </span>
    `;

    diceValueText.textContent =
        `Dice: ${displayedDiceValue ?? "-"}`;

    diceFace.innerHTML = renderDiceFace(displayedDiceValue);

    statusText.textContent = rollMessage;

    const redHomePieces = game.redPieces
        .filter((piece) => piece.position === null)
        .map((piece) => {
            return renderPieceButton(piece, "red-piece");
        })
        .join("");

    const blueHomePieces = game.bluePieces
        .filter((piece) => piece.position === null)
        .map((piece) => {
            return renderPieceButton(piece, "blue-piece");
        })
        .join("");

    const ringPositions = [
        { space: 0, row: 1, column: 1 },
        { space: 1, row: 1, column: 2 },
        { space: 2, row: 1, column: 3 },
        { space: 3, row: 1, column: 4 },
        { space: 4, row: 1, column: 5 },
        { space: 5, row: 1, column: 6 },
        { space: 6, row: 1, column: 7 },
        { space: 7, row: 2, column: 7 },
        { space: 8, row: 3, column: 7 },
        { space: 9, row: 4, column: 7 },
        { space: 10, row: 5, column: 7 },
        { space: 11, row: 6, column: 7 },
        { space: 12, row: 6, column: 6 },
        { space: 13, row: 6, column: 5 },
        { space: 14, row: 6, column: 4 },
        { space: 15, row: 6, column: 3 },
        { space: 16, row: 6, column: 2 },
        { space: 17, row: 6, column: 1 },
        { space: 18, row: 5, column: 1 },
        { space: 19, row: 4, column: 1 },
        { space: 20, row: 3, column: 1 },
        { space: 21, row: 2, column: 1 }
    ];

    const pathSpaces = ringPositions.map(({ space, row, column }) => {
        const piecesOnSpace = [];

        game.redPieces.forEach((piece) => {
            if (piece.position === space) {
                piecesOnSpace.push(
                    renderPieceButton(piece, "red-piece")
                );
            }
        });

        game.bluePieces.forEach((piece) => {
            if (piece.position === space) {
                piecesOnSpace.push(
                    renderPieceButton(piece, "blue-piece")
                );
            }
        });

        const startLabel = space === 0
            ? '<span class="start-label red-start">Red Start</span><span class="start-arrow red-start">→</span>'
            : space === 11
                ? '<span class="start-label blue-start">Blue Start</span><span class="start-arrow blue-start">←</span>'
                : '';

        return `
            <div class="path-space" style="grid-row: ${row}; grid-column: ${column};">
                ${startLabel}
                <span class="space-pieces">${piecesOnSpace.join("")}</span>
            </div>
        `;
    });

    const renderFinalLane = (playerName, pieces, colourClass) => {
        const spaces = [1, 2, 3, 4, 5].map((laneSpace) => {
            const piecesOnSpace = pieces
                .filter((piece) => piece.position === `${playerName}-final-${laneSpace}`)
                .map((piece) => {
                    return renderPieceButton(piece, colourClass);
                })
                .join("");

            const finishLabel = laneSpace === 5
                ? `<span class="finish-label ${playerName.toLowerCase()}-finish">${playerName} Finish</span>`
                : "";

            return `
                <div class="final-space ${playerName.toLowerCase()}-final-space">
                    ${finishLabel}
                    <span class="space-pieces">${piecesOnSpace}</span>
                </div>
            `;
        });

        return spaces.join("");
    };

    const redFinalLane = renderFinalLane("Red", game.redPieces, "red-piece");
    const blueFinalLane = renderFinalLane("Blue", game.bluePieces, "blue-piece");

    boardDiv.innerHTML = `
        <div class="ludo-board">
            <div class="home-area red-home">
                <h3>Red Home</h3>
                <div class="home-pieces">${redHomePieces || "Empty"}</div>
            </div>

            <div class="path-area">
                ${pathSpaces.join("")}

                <div class="final-lane red-final-lane">
                    ${redFinalLane}
                </div>

                <div class="final-lane blue-final-lane">
                    ${blueFinalLane}
                </div>

            </div>

            <div class="home-area blue-home">
                <h3>Blue Home</h3>
                <div class="home-pieces">${blueHomePieces || "Empty"}</div>
            </div>
        </div>
    `;

    winnerText.textContent =
        game.winner
            ? `Winner: ${game.winner}`
            : "";

    rollButton.classList.toggle("disabled-dice", Boolean(game.winner) || game.diceValue !== null);
}

rollButton.addEventListener("click", () => {
    if (game.winner || game.diceValue !== null) {
        return;
    }
    game = Ludo.rollDice(game);
    displayedDiceValue = game.diceValue;
    rollMessage = "";

    if (!currentPlayerHasMove(game)) {
        const playerWhoRolled = game.currentPlayer;
        const diceRolled = game.diceValue;

        game = {
            ...game,
            currentPlayer: switchPlayer(game.currentPlayer),
            diceValue: null
        };

        rollMessage =
            `${playerWhoRolled} rolled ${diceRolled}. No move available, turn passed.`;
    }

    render();

});

boardDiv.addEventListener("click", (event) => {
    const pieceButton = event.target.closest(".piece");

    if (!pieceButton || pieceButton.disabled) {
        return;
    }

    const pieceId = pieceButton.dataset.pieceId;

    game = Ludo.movePiece(game, pieceId);
    displayedDiceValue = null;
    rollMessage = "";

    render();
});

restartButton.addEventListener("click", () => {
    game = Ludo.createGame();
    displayedDiceValue = null;
    rollMessage = "";

    render();

});

render();