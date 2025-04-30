
module.exports = {
  name: 'pick',
  aliases: ['choose'],
  exp: 3,
  cool: 10,
  react: "✅",
  category: 'fun',
  usage: 'pick <number> <label>',
  description: 'Pick a number of random users from the group and tag them with a specified label',
  async execute(client, arg, M) {
      try {
          const [countStr, ...labelParts] = arg.split(' ');
          const count = parseInt(countStr, 10);
          const label = labelParts.join(' ') || 'member';

          if (isNaN(count) || count <= 0) {
              return M.reply('Please provide a valid number of users to pick.');
          }

          // Limit the maximum number of users to pick to 10
          const maxCount = 5;
          if (count > maxCount) {
              return M.reply(`You can pick a maximum of ${maxCount} users.`);
          }

          const groupMetadata = await client.groupMetadata(M.from);
          const groupMembers = groupMetadata?.participants.map((x) => x.id) || [];
          
          if (count > groupMembers.length) {
              return M.reply('The number of users to pick exceeds the number of group members.');
          }

          // Shuffle the array and pick the specified number of users
          const shuffledMembers = groupMembers.sort(() => 0.5 - Math.random());
          const selectedMembers = shuffledMembers.slice(0, count);

          // Create the message text
          let text = `🎉 *Congratulations to the selected ${label}s!* 🎉\n\n`;
          text += selectedMembers.map((jid) => `@${jid.split('@')[0]} (${label})`).join('\n');

          // Send the message
          await client.sendMessage(M.from, { text, mentions: selectedMembers }, { quoted: M });
      } catch (error) {
          console.error('Error executing the pick command:', error);
          await client.sendMessage(M.from, { text: 'An error occurred while picking users.' }, { quoted: M });
      }
  }
};
