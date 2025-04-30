const timers = {}; // Store timers per group

module.exports = {
    name: 'timer',
    aliases: ['tm'],
    exp: 0,
    cool: 5,
    react: "⏰",
    category: 'dev',
    usage: 'Use :timer <minutes> OR :timer end',
    description: 'Starts a timer for the specified number of minutes or ends the ongoing timer.',
  
    async execute(client, arg, M) {
        const groupId = M.from; // Identify the group

        if (arg === 'end') {
            if (!timers[groupId]) return M.reply('⏰ No active timer in this group.');
            clearInterval(timers[groupId].interval);
            delete timers[groupId];
            return M.reply('⏰ Timer has been stopped.');
        }

        if (!arg || isNaN(arg) || parseInt(arg) <= 0) {
            return M.reply('❌ Please provide a valid number of minutes.');
        }

        const minutes = parseInt(arg);
        const milliseconds = minutes * 60 * 1000;

        if (timers[groupId]) {
            return M.reply('⏰ A timer is already running in this group. Wait for it to finish or use `:timer end`.');
        }

        await M.reply(`⏰ Timer started for ${minutes} minute(s).`);

        const startTime = Date.now();
        const notifyTimes = [
            { timeLeft: 5 * 60 * 1000, message: '⏰ 5 minutes left.' },
            { timeLeft: 3 * 60 * 1000, message: '⏰ 3 minutes left.' },
            { timeLeft: 1 * 60 * 1000, message: '⏰ 1 minute left.' },
            { timeLeft: 30 * 1000, message: '⏰ 30 seconds left. Get ready!' }
        ];
        let notified = new Set();

        timers[groupId] = {
            interval: setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remainingTime = milliseconds - elapsed;

                notifyTimes.forEach(({ timeLeft, message }) => {
                    if (remainingTime <= timeLeft && !notified.has(timeLeft)) {
                        M.reply(message);
                        notified.add(timeLeft);
                    }
                });

                // Start countdown at 10 seconds remaining
                if (remainingTime <= 10000 && remainingTime > 0) {
                    clearInterval(timers[groupId].interval);
                    let secondsLeft = Math.ceil(remainingTime / 1000);

                    timers[groupId].countdown = setInterval(() => {
                        if (secondsLeft > 0) {
                            M.reply(`⏰ ${secondsLeft} second(s) left!`);
                            secondsLeft -= 1;
                        } else {
                            clearInterval(timers[groupId].countdown);
                            delete timers[groupId];
                            client.groupSettingUpdate(groupId, 'announcement'); // Close group
                            M.reply('⏰ Timer ended. Group is now closed.');
                        }
                    }, 1000);
                }
            }, 1000)
        };
    }
};
