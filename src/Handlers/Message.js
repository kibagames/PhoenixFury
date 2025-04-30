const { getBinaryNodeChild } = require('@whiskeysockets/baileys');
const { serialize } = require('../Structures/WAclient');
const { getStats, ranks } = require('../Helpers/Stats');
const chalk = require('chalk');
const emojiStrip = require('emoji-strip');
const axios = require('axios');
const cron = require("node-cron");
const { Collection } = require('discord.js');
const cool = new Collection();

module.exports = MessageHandler = async (messages, client) => {
    try {
        if (messages.type !== 'notify') return;
        let M = serialize(JSON.parse(JSON.stringify(messages.messages[0])), client);
        if (!M.message) return;
        if (M.key && M.key.remoteJid === 'status@broadcast') return;
        if (M.type === 'protocolMessage' || M.type === 'senderKeyDistributionMessage' || !M.type || M.type === '')
            return;

        const { isGroup, isSelf, sender, from, body } = M;
        const gcMeta = isGroup ? await client.groupMetadata(from) : '';
        const gcName = isGroup ? gcMeta.subject : '';
        const args = body.trim().split(/ +/).slice(1);
        const isCmd = body.startsWith(client.prefix);
        const cmdName = body.slice(client.prefix.length).trim().split(/ +/).shift().toLowerCase();
        const arg = body.replace(cmdName, '').slice(1).trim();
        const groupMembers = gcMeta?.participants || [];
        const commands = ['switch', 'hello', 'hi']
        const groupAdmins = groupMembers.filter((v) => v.admin).map((v) => v.id);
        const ActivateMod = (await client.DB.get('antilink')) || [];
        const banned = (await client.DB.get('banned')) || [];
        const companion = await client.pkmn.get(`${sender}_companion`);
        const economy = await client.econ.findOne({ userId: sender })
        
    
        
        // Antilink system
        if (isGroup && ActivateMod.includes(from) && groupAdmins.includes(client.user.id.split(':')[0] + '@s.whatsapp.net') && body) {
            const groupCodeRegex = body.match(/chat.whatsapp.com\/(?:invite\/)?([\w\d]*)/);
            if (groupCodeRegex && groupCodeRegex.length === 2 && !groupAdmins.includes(sender)) {
                const groupCode = groupCodeRegex[1];
                const groupNow = await client.groupInviteCode(from);

                if (groupCode !== groupNow) {
                    await client.sendMessage(from, { delete: M.key });
                    await client.groupParticipantsUpdate(from, [sender], 'remove');
                    return M.reply('Successfully removed an intruder!!!!');
                }
            }
        }

      // Link handling code
if (!isGroup && body.includes('chat.whatsapp.com')) {
    const senderInfo = M.pushName || sender;
    const messageToMods = `*🌐 WhatsApp Link Alert! 🌐*\n\n👤 *Sent by:* ${senderInfo}\n🔗 *Link:* ${body}`;

    // Notify the sender
    await client.sendMessage(from, {
        text: '✅ Your request has been sent to the moderators.',
    });

    // Notify the moderators group
    const modsGroupJid = client.groups.modsGroup;
    await client.sendMessage(modsGroupJid, {
        text: messageToMods,
        mentions: [M.sender],
    });
}

        
        //group responses
        if ( body === 'test' || body === 'Test') return M.reply(`Everything is working fine ${M.pushName}`)
        if ( body === 'aurora' || body === 'Aurora') return M.reply('Aurora is an bot which is created for entertainment purpose which contains the anime themed cardgame of shoob.gg and the pokemon adventure game of nintendo')
        if (isCmd && !cmdName) return M.reply('I am alive user, use :help to get started');

        client.log(
            `${chalk[isCmd ? 'red' : 'green'](`${isCmd ? '~EXEC' : '~RECV'}`)} ${
                isCmd ? `${client.prefix}${cmdName}` : 'Message'
            } ${chalk.white('from')} ${M.pushName} ${chalk.white('in')} ${isGroup ? gcName : 'DM'} ${chalk.white(
                `args: [${chalk.blue(args.length)}]`
            )}`,
            'yellow'
        );

        //leaveing
        if (gcMeta.size < 35 && from !== client.groups.modsGroup ) {
            await client.sendMessage(from, { text: 'leaving your group for less members' })
            await client.groupLeave(from)
        }
        
        if (!isCmd) return;

        // Switch check
        const bot = await client.DB.get(`${M.from}_ActiveBot`);
        if (bot && bot != client.name && bot !== 'all' && !commands.includes(cmdName)) return null
        
const bannedUser = banned.find(b => b.user === sender);
        if (isCmd && bannedUser) {
            return M.reply(`You are banned from using the bot. Reason: ${bannedUser.reason}`);
        }

                
        const command = client.cmd.get(cmdName) || client.cmd.find((cmd) => cmd.aliases && cmd.aliases.includes(cmdName));

        if (!command) {
            // Find similar commands
const similarCommands = client.cmd.filter(cmd => cmd.name.includes(cmdName) || (cmd.aliases && cmd.aliases.includes(cmdName)));

// Sort similar commands by name length
similarCommands.sort((a, b) => a.name.length - b.name.length);

// Get the first (shortest) similar command
const suggestedCommand = similarCommands.first();

// Check if a similar command was found
if (suggestedCommand) {
    return M.reply(`No such command found! Did you mean: ${suggestedCommand.name}?`);
} else {
    return M.reply('No such command found! BAKA');
}
            
        }

        if (isGroup) {
            const { casinoGroup, auctionGroup, gamesGroup } = client.groups;
            const isCasinoGroup = from === casinoGroup;
            const isAuctionGroup = from === auctionGroup;
            const isGamesGroup = from === gamesGroup;
        
            if (isCasinoGroup) {
                if (command.category !== 'economy' && command.category !== 'dev' && command.category !== 'moderation') {
                    return M.reply(`🚫 *Restricted Command* 🚫\n\n*Only slot and gamble commands* can be used in the casino group.`);
                }
            }
        
            if (isAuctionGroup) {
                if (cmdName !== 'auction' && cmdName !== 'bid' && command.category !== 'dev' && command.category !== 'moderation') {
                    return M.reply(`🚫 *Restricted Command* 🚫\n\n*Only auction and bid commands* can be used in the auction group.`);
                }
            }
        
            if (isGamesGroup) {
                if (command.category !== 'games' && command.category !== 'dev' && command.category !== 'moderation') {
                    return M.reply(`🚫 *Restricted Command* 🚫\n\n*Only game commands* can be used in the games group.`);
                }
            }
        }
        
        // Check if the command or any of its aliases are disabled
const disabledCommands = await client.DB.get('disable-commands') || [];
const disabledCmd = disabledCommands.find((cmd) => {
    const allAliases = [cmd.command, ...(client.cmd.get(cmd.command)?.aliases || [])];
    return allAliases.includes(cmdName);
});

if (disabledCmd) {
    const disabledAt = new Date(disabledCmd.disabledAt).toLocaleString();
    const reason = disabledCmd.reason || 'No reason provided.';
    const disabledBy = disabledCmd.disabledBy;

    const replyMessage = `🚫 *Command Disabled* 🚫\n\n` +
        `🔒 *Disabled By:* ${disabledBy}\n` +
        `🕒 *Disabled At:* ${disabledAt}\n` +
        `📋 *Reason:* ${reason}\n\n` +
        `*Command:* ${disabledCmd.command} (${disabledCmd.aliases?.join(', ') || ''})\n\n` +
        `Please contact an admin if you believe this was an error.`;

    return M.reply(replyMessage);
}


       // Cooldown system implementation
const cooldownAmount = (command.cool ?? 5) * 1000; // Cooldown in milliseconds
const cooldownKey = `${sender}${command.name}`
const currentTime = Date.now();
const senderIsMod = client.mods.includes(sender.split('@')[0]);

// Check if the sender is on cooldown
if (!senderIsMod && cool.has(cooldownKey)) {
    const cooldownEnd = cool.get(cooldownKey);
    const remainingTime = cooldownEnd - currentTime;

    if (remainingTime > 0) {
        const formattedTime = client.utils.convertMs(remainingTime);
        return M.reply(`⏳ *Cooldown Active* ⏳\n\nYou must wait *${formattedTime}* ${formattedTime > 1 ? 'seconds' : 'second'} before using the *${command.name}* command again.`);
    } else {
        // Cooldown time has expired, remove it
        cool.delete(cooldownKey);
    }
}

// Set or reset the cooldown for non-mods
if (!senderIsMod) {
    cool.set(cooldownKey, currentTime + cooldownAmount);
    setTimeout(() => cool.delete(cooldownKey), cooldownAmount);
}


        if (command.react) {
            const reactionMessage = {
                react: {
                    text: command.react,
                    key: M.key
                }
            };
            await client.sendMessage(M.from, reactionMessage);
        }

        // Command restrictions based on user and group status

// Check for admin commands
if (command.category === 'moderation') {
    if (!isGroup) {
        return M.reply('🚫 *Group Command Only* 🚫\n\nThis command can only be used in groups.');
    }

    if (!groupAdmins.includes(sender)) {
        return M.reply('🚫 *Admin Access Required* 🚫\n\nThis command can only be used by group or community admins.');
    }

    if (!groupAdmins.includes(`${client.user.id.split(':')[0]}@s.whatsapp.net`)) {
        return M.reply('🚫 *Bot Admin Access Required* 🚫\n\nThis command can only be used when the bot is an admin.');
    }
}

// Check for group-specific commands
if (isGroup) {
    if ((command.name === 'slot' || command.name === 'gamble') && from !== client.groups.casinoGroup) {
        return M.reply('🎰 *Casino Commands Only* 🎰\n\nThe slot and gamble commands can only be used in the casino group.');
    }

    if ((command.name === 'auction' || command.name === 'bid') && from !== client.groups.auctionGroup) {
        return M.reply('🏷️ *Auction Commands Only* 🏷️\n\nThe auction commands can only be used in the auction group.');
    }

    if ((command.name === 'hangman' || command.name === 'tictactoe' || command.name === 'duel' || command.name === 'number' ) && from !== client.groups.gamesGroup) {
        return M.reply('🎮 *Games Commands Only* 🎮\n\nThe game commands can only be used in the games group.');
    }

    
} 

// Check for bot access in groups
if (!isGroup && !client.mods.includes(sender.split('@')[0])) {
    return M.reply('🚫 *Group Access Required* 🚫\n\nBot commands can only be accessed in groups.');
}

// Check for mod-specific commands
if (command.category === 'dev' && !client.mods.includes(sender.split('@')[0])) {
    return M.reply('🚫 *Mods Only* 🚫\n\nThis command can only be accessed by mods.');
}

// Check for journey and economy commands
if (command.category === 'pokemon' && !companion && command.name !== 'start-journey') {
    return M.reply('🎒 *Journey Required* 🎒\n\nYou haven\'t started your journey yet. Use `start-journey` to begin.');
}

if (command.category === 'economy' && !economy && command.name !== 'bonus') {
    return M.reply('💸 *Economy Command Only* 💸\n\nUse `bonus` to get started with the economy commands.');
}
               if (command.antiBattle && client.pokemonBattlePlayerMap.has(M.sender))
            return M.reply("You can't use this command now as you're in the midway of a battle with someone!")
            
        if (command.category === 'pokemon' && (command.name === 'challenge' || command.name === 'battle' )&& M.from !== client.groups.battleGroup)
            return M.reply("Bakano! You Can't Battle Here Join Our Battle Group To Battle")

        await client.act.add(`${M.sender}_Points`, 0.20)
        command.execute(client, arg, M);
        
        await client.exp.add(sender, command.exp);

        const level = (await client.DB.get(`${sender}_LEVEL`)) || 0;
        const experience = await client.exp.get(sender);
        const { requiredXpToLevelUp } = getStats(level);
        if (requiredXpToLevelUp > experience) return null;
        await client.DB.add(`${sender}_LEVEL`, 1);
        const newLevel = level + 1;
        const reward = newLevel * 10000; // Updated reward calculation
        client.sendMessage(
            from,
            {
                text: `\nCongratulations you leveled up from *${level} ---> ${newLevel}* 🎊\n\nYou won a reward of ${reward} coins\n`
            },
            {
                quoted: M
            }
        );
        economy.coin += reward;
        await economy.save();
    } catch (err) {
        client.log(err, 'red');
    }
                               }
    
