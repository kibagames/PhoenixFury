module.exports = {
    name: 'state',
    aliases: ['st'],
    exp: 0,
    cool: 4,
    react: "✅",
    category: 'dev',
    usage: 'Use :state --action=ban/unban reason @tag',
    description: 'Bans or unbans the tagged user based on the parameter',
    async execute(client, arg, M) {
      try {
        // Parse action and reason from arguments
        const match = arg.match(/--action=(ban|unban)\s*(.*)/i);
        if (!match) {
          return M.reply('Invalid command format. Use :state --action=ban/unban reason @tag');
        }
        const action = match[1].toLowerCase();
        const reason = match[2] || 'No reason provided';
  
        // Check for tagged users
        if (M.quoted?.participant) M.mentions.push(M.quoted.participant);
        if (!M.mentions.length) {
          return M.reply(`You must tag the user to ${action} him/her.`);
        }
  
        const banned = (await client.DB.get('banned')) || [];
  
        for (const user of M.mentions) {
          const userTag = user.split('@')[0];
          if (action === 'ban') {
            if (!banned.some(b => b.user === user)) {
              await client.DB.push('banned', { user, reason });
              await client.sendMessage(
                M.from,
                { text: `*@${userTag}* is now banned from using commands.\nReason: ${reason}`, mentions: [user] },
                { quoted: M }
              );
            } else {
              await client.sendMessage(
                M.from,
                { text: `*@${userTag}* is already banned.`, mentions: [user] },
                { quoted: M }
              );
            }
          } else if (action === 'unban') {
            if (banned.some(b => b.user === user)) {
              await client.DB.pull('banned', b => b.user === user);
              await client.sendMessage(
                M.from,
                { text: `*@${userTag}* is now unbanned.`, mentions: [user] },
                { quoted: M }
              );
            } else {
              await client.sendMessage(
                M.from,
                { text: `*@${userTag}* is already unbanned.`, mentions: [user] },
                { quoted: M }
              );
            }
          } else {
            M.reply('Invalid action. Use :state --action=ban or :state --action=unban.');
          }
        }
      } catch (err) {
        console.error('Error in state command:', err);
        await client.sendMessage(M.from, { text: `An error occurred: ${err.message}` }, { quoted: M });
      }
    },
  };
  