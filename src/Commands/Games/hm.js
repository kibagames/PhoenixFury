const axios = require('axios');
const hm = new Map();
const getRandomPrize = () => Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
const fetchRandomWord = async () => {
    const words = ["Banana", "Laptop", "Rocket", "Coffee", "Garden", "Jacket", "Yellow", "Mother", "Silver", "Window", "Breeze"];
    return words[Math.floor(Math.random() * words.length)];
};

const fetchHangmanImage = async (attempts) => {
    try {
        const response = await axios.get(`https://shiui-ff2daa3f5778.herokuapp.com/hm?attempts=${attempts}`, { responseType: 'json' });
        if (response.data && response.data.image && response.data.image.data) {
            return Buffer.from(response.data.image.data);
        }
    } catch (error) {
        console.error("Error fetching hangman image:", error);
    }
    return null;
};

module.exports = {
    name: "hangman",
    aliases: ["hm"],
    exp: 1,
    cool: 5,
    react: "✅",
    category: "games",
    description: "Use :hm start/guess (letter)/forfeit/guide",

    async execute(client, arg, M) {
        let hang = hm.get(M.sender);

        if (!arg) return M.reply('⚠️ **No command provided. Use** `:hm guide` **for instructions.**');

        if (arg === 'guide') {
            return M.reply(`
🎮 **Hangman Game Guide** 🎮
- :hm start → Start a new game (5000 coins).
- :hm guess (letter) → Guess a letter.
- :hm forfeit → Forfeit the game.

**Game Details:**
- Costs 5000 coins to start.
- 6 attempts to guess the word.
- Win a random prize between 10000-15000 coins.
- Forfeit to reveal the correct word.
            `);
        } 
        
        else if (arg === 'start') {
            const userEconomy = await client.econ.findOne({ userId: M.sender });
            if (userEconomy.coin < 5000) return M.reply('⚠️ **You need 5000 coins to start a game.**');

            userEconomy.coin -= 5000;
            await userEconomy.save();

            const word = await fetchRandomWord();
            const maskedWord = word.replace(/./g, '➖');
            const imageBuffer = await fetchHangmanImage(6);

            await client.sendMessage(M.from, { 
                image: imageBuffer || null, 
                caption: `🎮 **Hangman Started!** 🎮\n💰 **5000 coins deducted.**\n🔤 **Your word:** ${maskedWord}\n🔍 **6 attempts remaining.**`
            });

            hm.set(M.sender, { progress: true, word: word.toLowerCase(), maskedWord, attempts: 6, guessedLetters: [] });
        } 
        
        else if (arg === 'forfeit') {
            if (!hang || !hang.progress) return M.reply('⚠️ **No ongoing game! Start a game with** `:hm start`.');

            const imageBuffer = await fetchHangmanImage(hang.attempts);
            await client.sendMessage(M.from, { 
                image: imageBuffer || null, 
                caption: `⚠️ **Game forfeited. The word was:** ${hang.word.toUpperCase()}`
            });

            hm.delete(M.sender);
        } 
        
        else if (arg.startsWith('guess ')) {
            if (!hang || !hang.progress) return M.reply('⚠️ **No ongoing game! Start a game with** `:hm start`.');

            const guess = arg.split(' ')[1].toLowerCase();
            if (!guess || guess.length !== 1 || !/[a-z]/.test(guess)) return M.reply('⚠️ **Invalid input. Please guess a single letter (a-z).**');
            if (hang.guessedLetters.includes(guess)) return M.reply('⚠️ **Letter already guessed. Try a different one.**');

            hang.guessedLetters.push(guess);

            if (hang.word.includes(guess)) {
                const updatedMaskedWord = hang.word.split('').map((char, i) => (hang.maskedWord[i] !== '➖' || char === guess ? char : '➖')).join('');
                hang.maskedWord = updatedMaskedWord;

                if (!updatedMaskedWord.includes('➖')) {
                    const prize = getRandomPrize();
                    userEconomy.coin += prize;
                    await userEconomy.save();
                    
                    const imageBuffer = await fetchHangmanImage(hang.attempts);
                    await client.sendMessage(M.from, { 
                        image: imageBuffer || null, 
                        caption: `🎉 **You won! The word was:** ${hang.word.toUpperCase()}\n💰 **You earned ${prize} coins!**`
                    });

                    hm.delete(M.sender);
                    return;
                }

                const imageBuffer = await fetchHangmanImage(hang.attempts);
                await client.sendMessage(M.from, { 
                    image: imageBuffer || null, 
                    caption: `✅ **Correct!**\n🔤 **Word:** ${hang.maskedWord}\n🔍 **Attempts left:** ${hang.attempts}`
                });

            } else {
                hang.attempts--;

                if (hang.attempts === 0) {
                    const imageBuffer = await fetchHangmanImage(0);
                    await client.sendMessage(M.from, { 
                        image: imageBuffer || null, 
                        caption: `❌ **You lost! The word was:** ${hang.word.toUpperCase()}`
                    });
                    hm.delete(M.sender);
                } else {
                    const imageBuffer = await fetchHangmanImage(hang.attempts);
                    await client.sendMessage(M.from, { 
                        image: imageBuffer || null, 
                        caption: `❌ **Wrong guess!**\n🔤 **Word:** ${hang.maskedWord}\n🔍 **Attempts left:** ${hang.attempts}`
                    });
                }
            }
        }
    }
};
