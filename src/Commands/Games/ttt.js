const ttt = new Map();
const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
const checkWin = (board, player) => {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    return winPatterns.some(pattern => 
        pattern.every(index => board[index] === player)
    );
};
const isBoardFull = (board) => {
    return board.every(cell => cell === '❌' || cell === '⭕');
};

const drawBoard = async (attempts) => {
    try {
        const response = await axios.get(`https://shiui-ff2daa3f5778.herokuapp.com/ttt?board=${attempts}`, { responseType: 'json' });
        if (response.data && response.data.image && response.data.image.data) {
            return Buffer.from(response.data.image.data);
        }
    } catch (error) {
        console.error("Error fetching hangman image:", error);
    }
    return null;
};

module.exports = {
    name: "tictactoe",
    aliases: ["ttt"],
    exp: 1,
    cool: 5,
    react: "✅",
    category: "games",
    description: "Use :ttt start @tag / :ttt join / :ttt mark (number) / :ttt forfeit / :ttt reject / :ttt guide",
    async execute(client, arg, M) {
        const args = arg.split(' ');
        const command = args[0];
        const challenger = M.sender;
        const challenged = M.mentions[0] || (M.quoted && M.quoted.participant);
        const isPlayerInGame = (player) => {
            for (const game of ttt.values()) {
                if (game.challenger === player || game.opponent === player) {
                    return true;
                }
            }
            return false;
        };
        if (!command) {
            return client.sendMessage(
                M.from,
                { text: '⚠️ **No command provided. Use** \`:ttt guide\` **for instructions on how to play.**' }
            );
        }
        if (command === 'guide') {
            return client.sendMessage(
                M.from,
                { text: `
                    🎮 **Tic-Tac-Toe Game Guide** 🎮
                    - \`:ttt start @tag\`: Challenge someone to a game of Tic-Tac-Toe. Entry fee is 5000 coins per player.
                    - \`:ttt join\`: Accept a challenge.
                    - \`:ttt mark (number)\`: Place your mark on the board.
                    - \`:ttt forfeit\`: Forfeit the current game.
                    - \`:ttt reject\`: Reject a pending challenge.
                    **Game Details:**
                    - Both players need to have at least 5000 coins to start the game.
                    - The game board consists of 9 positions, numbered 1 to 9.
                    - Players take turns to place their marks (❌ or ⭕) on the board.
                    - The first player to get three marks in a row (horizontally, vertically, or diagonally) wins the game.
                    - The winner receives a prize of 10000 coins.
                    - If the board is full and no player has won, the game ends in a draw.
                ` }
            );
        } else if (command === 'start') {
            if (!challenged || challenged === challenger) {
                return client.sendMessage(
                    M.from,
                    { text: 'You must tag someone to challenge.' }
                );
            }
            if (isPlayerInGame(challenger) || isPlayerInGame(challenged)) {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ One or both players are already in a game.' }
                );
            }
            const challengerEconomy = await client.econ.findOne({ userId: challenger });
            const challengedEconomy = await client.econ.findOne({ userId: challenged });
            if (challengerEconomy.coin < 5000 || challengedEconomy.coin < 5000) {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ Both players need to have at least 5000 coins to start the game.' }
                );
            }
            challengerEconomy.coin -= 5000;
            challengedEconomy.coin -= 5000;
            await challengerEconomy.save();
            await challengedEconomy.save();
            ttt.set(challenged, {
                progress: false,
                challenger: challenger,
                board: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                currentPlayer: '❌',
                opponent: null
            });
            client.sendMessage(
                M.from,
                { text: `🎮 **Tic-Tac-Toe Challenge!** 🎮\n\n@${challenged.split('@')[0]}, you have been challenged by @${challenger.split('@')[0]} to a game of Tic-Tac-Toe. Use \`:ttt join\` to accept or \`:ttt reject\` to decline.\n\n💰 **Both players have given 5000 coins to join the game.**` }
            );
        } else if (command === 'join') {
            const game = ttt.get(challenger);
            if (!game || game.progress) {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ You have no pending challenges or are already in a game.' }
                );
            }
            if (isPlayerInGame(challenger)) {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ You are already in a game.' }
                );
            }
            game.progress = true;
            game.opponent = challenger;
            ttt.set(game.challenger, game);
            ttt.set(game.opponent, game);
            // Generate the board image
            const buffer = await drawBoard(game.board);
            client.sendMessage(
                M.from,
                { image: buffer, caption: `🎮 **Game On!** 🎮\n\n@${game.challenger.split('@')[0]} is ❌ and @${game.opponent.split('@')[0]} is ⭕\n\n❌ **Player X's turn. Use \`:ttt mark (number)\` to place your mark.**` }
            );
        } else if (command === 'mark') {
            const game = ttt.get(challenger) || ttt.get(challenged);
            if (!game || !game.progress) {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ You need to be in a game to make a move. Start a new game using \`:ttt start @tag\`.' }
                );
            }
            // Check if it's the player's turn
            const player = game.challenger === M.sender ? '❌' : (game.opponent === M.sender ? '⭕' : null);
            if (player !== game.currentPlayer) {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ It\'s not your turn!' }
                );
            }
            const position = parseInt(args[1], 10) - 1;
            if (isNaN(position) || position < 0 || position > 8 || game.board[position] !== ' ') {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ Invalid move. Please choose a valid position (1-9) that is not already occupied.' }
                );
            }
            game.board[position] = player;
            if (checkWin(game.board, player)) {
                const prizeAmount = 10000; // Fixed prize amount
                const winnerId = game.currentPlayer === '❌' ? game.challenger : game.opponent;
                const winnerEconomy = await client.econ.findOne({ userId: winnerId });
                if (winnerEconomy) {
                    winnerEconomy.coin += prizeAmount;
                    await winnerEconomy.save();
                }
                client.sendMessage(
                    M.from,
                    { text: `🎉 **Congratulations!** 🎉\n\n@${winnerId.split('@')[0]} has won the Tic-Tac-Toe game and received ${prizeAmount} coins!` }
                );
                ttt.delete(game.challenger);
                ttt.delete(game.opponent);
            } else if (isBoardFull(game.board)) {
                client.sendMessage(
                    M.from,
                    { text: '🤝 **It\'s a draw!** 🤝\n\nThe Tic-Tac-Toe game has ended in a draw. No coins have been awarded.' }
                );
                ttt.delete(game.challenger);
                ttt.delete(game.opponent);
            } else {
                game.currentPlayer = game.currentPlayer === '❌' ? '⭕' : '❌';
                // Generate the updated board image
                const buffer = await drawBoard(game.board);
                client.sendMessage(
                    M.from,
                    { image: buffer, caption: `${game.currentPlayer === '❌' ? '@' + game.challenger.split('@')[0] : '@' + game.opponent.split('@')[0]} **'s turn. Use \`:ttt mark (number)\` to place your mark.**` }
                );
            }
        } else if (command === 'forfeit') {
            const game = ttt.get(challenger) || ttt.get(challenged);
            if (!game || !game.progress) {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ You are not currently in a game.' }
                );
            }
            const forfeitedPlayer = game.challenger === M.sender ? game.challenger : game.opponent;
            const winner = game.challenger === M.sender ? game.opponent : game.challenger;
            const winnerEconomy = await client.econ.findOne({ userId: winner });
            if (winnerEconomy) {
                winnerEconomy.coin += 10000; // Fixed prize amount
                await winnerEconomy.save();
            }
            client.sendMessage(
                M.from,
                { text: `🚩 **${forfeitedPlayer.split('@')[0]} has forfeited the game!** 🚩\n\n@${winner.split('@')[0]} is the winner and has received 10000 coins!` }
            );
            ttt.delete(game.challenger);
            ttt.delete(game.opponent);
        } else if (command === 'reject') {
            if (!challenger || !challenged) {
                return client.sendMessage(
                    M.from,
                    { text: '⚠️ No challenge to reject.' }
                );
            }
        }
    }
};