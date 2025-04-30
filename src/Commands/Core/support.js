module.exports = {
  name: 'support',
  aliases: ['support'],
  category: 'core',
  exp: 1,
  cool: 4,
  react: "✅",
  usage: 'Use :support',
  description: 'Gives links of official group chats',
  async execute(client, arg, M) {
      try {
          // Group links message
          const supportG = `*━『 Aurora Group Links 』━*
          
• *[ Aurora Support ]*
Link: https://chat.whatsapp.com/LfP92QqDOZv4xqHjVfwjdJ

• *[ Aurora Auction ]*
Link: https://chat.whatsapp.com/DvUlhUJIypEI3PaLgaYcn6

• *[ Aurora Casino ]*
Link: https://chat.whatsapp.com/HQYq49kB59J9BDHrzJUkiT

• *[ Aurora Games ]*
Link: https://chat.whatsapp.com/HpJAi81LONm8VTQjAzlBjy

• *[ Aurora Quest ]*
Link: https://chat.whatsapp.com/ReplaceWithActualLink

• *[ Aurora Battles ]*
Link: https://chat.whatsapp.com/ReplaceWithActualLink

• *[ Aurora General ]*
Link: https://chat.whatsapp.com/JwXQf1qBkGDLCbugc22UVt`;

          // Notify the user in the group
          await client.sendMessage(M.from, { text: `*🟩 DMed you the group links.*` }, { quoted: M });

          // Send the detailed group links message as a DM
          await client.sendMessage(
              M.sender, 
              { 
                  image: { url: 'https://i.ibb.co/tPhb428/Aurora.jpg' }, 
                  caption: supportG 
              }, 
              { quoted: M }
          );
      } catch (error) {
          console.error('Error in support command:', error);

          // Notify the user about the error
          await client.sendMessage(
              M.from, 
              { 
                  image: { url: `${client.utils.errorChan()}` }, 
                  caption: `${client.utils.greetings()} *Error-Chan*: 
                  
                  An error occurred while processing your request:
                  \`\`\`${error.message}\`\`\``
              }, 
              { quoted: M }
          );
      }
  }
};
