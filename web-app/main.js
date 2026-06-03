import {
    createGame,
    rollDice,
    movePiece
} from "./Module.js";

let game = createGame();
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

    const rows = [
        [0, 1, 2],
        [5, 4, 3],
        [6, 7, 8],
        [11, 10, 9],
        [12, 13, 14],
        [17, 16, 15],
        [18, 19, 20]
    ];

    const pathRows = rows.map((row) => {
        const spaces = row.map((space) => {
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

            return `
                <div class="path-space">
                    <span class="space-number">${space}</span>
                    <span class="space-pieces">${piecesOnSpace.join("")}</span>
                </div>
            `;
        });

        return `
            <div class="path-row">
                ${spaces.join("")}
            </div>
        `;
    });

    boardDiv.innerHTML = `
        <div class="ludo-board">
            <div class="home-area red-home">
                <h3>Red Home</h3>
                <div class="home-pieces">${redHomePieces || "Empty"}</div>
            </div>

            <div class="path-area">
                ${pathRows.join("")}
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

    rollButton.classList.toggle("disabled-dice", Boolean(game.winner));
}

rollButton.addEventListener("click", () => {
    if (game.winner) {
        return;
    }

    game = rollDice(game);
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

    game = movePiece(game, pieceId);
    displayedDiceValue = null;
    rollMessage = "";

    render();
});

restartButton.addEventListener("click", () => {

    game = createGame();
    displayedDiceValue = null;
    rollMessage = "";

    render();

});

render();