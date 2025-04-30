const guessMap = new Map();
const riddles = [
    { question: "I am an odd number. Take away one letter, and I become even. What number am I?", answer: "seven" },
    { question: "I am not alive, but I can grow. I don’t have lungs, but I need air. What am I?", answer: "fire" },
    { question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", answer: "echo" },
    { question: "What has keys but can’t open locks?", answer: "piano" },
    { question: "What can travel around the world while staying in a corner?", answer: "stamp" }
];

const getRandomPrize = (attemptsLeft) => {
    const basePrize = Math.floor(Math.random() * (10000 - 7000 + 1)) + 7000;
    const prizeMultiplier = attemptsLeft / 10;  // The more attempts left, the higher the prize
    return Math.floor(basePrize * prizeMultiplier);
};

const generateNumber = () => {
    return Math.floor(Math.random() * 100) + 1; // Generates a number between 1 and 100
};

const getHint = (difference, attemptsLeft) => {
    if (attemptsLeft <= 3) return "You're far off"; // Harder hints with fewer attempts
    if (difference >= 50) {
        return "too far";
    } else if (difference >= 20) {
        return "far";
    } else if (difference >= 10) {
        return "close";
    } else if (difference >= 5) {
        return "too close";
    } else {
        return "near";
    }
};

const getRangeHint = (number, attemptsLeft) => {
    const range = attemptsLeft >= 5 ? 15 : 10; // Smaller range with fewer attempts
    const lowerBound = Math.max(1, number - range);
    const upperBound = Math.min(100, number + range);
    return `${lowerBound} and ${upperBound}`;
};

module.exports = {
    name: "number",
    aliases: ["numguess"],
    exp: 1,
    cool: 5,
    react: "✅",
    category: "games",
    description: "Use :number start/guess (number)/forfeit/guide",
    async execute(client, arg, M) {
        let game = guessMap.get(M.sender);

        if (!arg) {
            return M.reply('⚠️ **No command provided. Use** \`:number guide\` **for instructions on how to play.**');
        }

        if (arg === 'guide') {
            return M.reply(`
                🎮 **Number Guessing Game Guide** 🎮
                - \`:number start\`: Start a new game of Number Guessing. Costs 5000 coins.
                - \`:number guess (number)\`: Guess a number in the current game (between 1 and 100).
                - \`:number forfeit\`: Forfeit the current game.
                
                **Game Details:**
                - You need 5000 coins to start a game.
                - You have 10 attempts to guess the number.
                - The fewer attempts you take, the higher the reward.
                - Incorrect guesses cost 500 coins after 5 wrong attempts.
                - Answer riddles correctly to get hints about the number.
                - You can forfeit the game anytime to see the correct number.
            `);
        } else if (arg === 'start') {
            const userEconomy = await client.econ.findOne({ userId: M.sender });

            if (userEconomy.coin < 5000) {
                return M.reply('⚠️ **You do not have enough coins to start a game. You need 5000 coins to join.**');
            }

            userEconomy.coin -= 5000;
            await userEconomy.save();

            const number = generateNumber();
            const attempts = 10;
            const riddleIndex = Math.floor(Math.random() * riddles.length);
            const { question, answer } = riddles[riddleIndex];

            const text = `🎮 **Number Guessing Game Started!** 🎮\n\n💰 **5000 coins have been deducted from your account.**\n\n🔢 **Riddle:** ${question}\n\n🔢 You have **${attempts} attempts** to guess the number between 1 and 100. Use \`:number guess (number)\``;

            client.sendMessage(M.from, { text: text }, { quoted: M });

            guessMap.set(M.sender, {
                progress: true,
                number: number,
                attempts: attempts,
                correctAnswer: answer.toLowerCase(), // Store the answer to check later
            });
        } else if (arg.startsWith('guess ')) {
            if (!game || !game.progress) {
                return M.reply('⚠️ **You need to start a game first using** \`:number start\`');
            }

            const guess = parseInt(arg.split(' ')[1], 10);
            if (isNaN(guess) || guess < 1 || guess > 100) {
                return M.reply('❗ **Please guess a valid number between 1 and 100**');
            }

            const difference = Math.abs(guess - game.number);

            if (guess === game.number) {
                const prizeAmount = getRandomPrize(game.attempts);
                const winnerEconomy = await client.econ.findOne({ userId: M.sender });

                if (winnerEconomy) {
                    winnerEconomy.coin += prizeAmount;
                    await winnerEconomy.save();
                }

                guessMap.delete(M.sender);
                return M.reply(`🎉 **Congratulations! You've guessed the number correctly!** 🎉\n\n💰 **Prize:** ${prizeAmount} coins!`);
            } else {
                game.attempts--;

                // Penalty for more than 5 incorrect guesses
                if (game.attempts < 5) {
                    const userEconomy = await client.econ.findOne({ userId: M.sender });
                    if (userEconomy.coin >= 50) {
                        userEconomy.coin -= 50;
                        await userEconomy.save();
                        M.reply('⚠️ **500 coins have been deducted due to multiple incorrect guesses. Be careful!**');
                    }
                }

                if (game.attempts === 0) {
                    const text = `💀 **You've run out of attempts!** The number was: \`${game.number}\` 💀`;
                    guessMap.delete(M.sender);
                    return client.sendMessage(M.from, { text }, { quoted: M });
                } else {
                    const hint = getHint(difference, game.attempts);
                    const rangeHint = getRangeHint(game.number, game.attempts);
                    const text = `❌ **Incorrect guess!** Hint: You are \`${hint}\`. The number is between **${rangeHint}**.\n\n🔢 Attempts remaining: **${game.attempts}**`;
                    guessMap.set(M.sender, game);
                    return client.sendMessage(M.from, { text }, { quoted: M });
                }
            }
        } else if (arg.startsWith('riddle ')) {
            if (!game || !game.progress || !game.correctAnswer) {
                return M.reply('⚠️ **You need to start a game first and have an incorrect guess to answer a riddle.**');
            }

            const riddleAnswer = arg.split(' ')[1].toLowerCase();
            if (riddleAnswer === game.correctAnswer) {
                // If the riddle answer is correct, continue the game
                const hint = getHint(Math.abs(game.number - game.number), game.attempts); // Just to show an example
                const rangeHint = getRangeHint(game.number, game.attempts);
                const text = `✅ **Correct riddle answer!** Now you can guess the number. Hint: You are \`${hint}\`. The number is between **${rangeHint}**.\n\n🔢 Attempts remaining: **${game.attempts}**`;

                guessMap.set(M.sender, game);
                delete game.correctAnswer; // Remove the riddle answer from the game
                client.sendMessage(M.from, { text }, { quoted: M });
            } else {
                M.reply('❌ **Incorrect riddle answer. Try again!**');
            }
        } else if (arg === 'forfeit') {
            if (!game || !game.progress) {
                return M.reply('⚠️ **You need to start a game first using** \`:number start\`');
            }

            guessMap.delete(M.sender);
            return M.reply(`💀 **You forfeited the game!** The number was: \`${game.number}\` 💀`);
        }
    }
};
