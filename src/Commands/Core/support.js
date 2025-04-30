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
          const supportG = `*━『 yurie Group Links 』━*
          
• *[ yurie Support ]*
Link: https://chat.whatsapp.com/FpJ4aiTVkyHHtqTIR960xX

• *[ yurie Auction ]*
Link: https://chat.whatsapp.com/LAfV7XSyFkU7EgNntxdWyj

• *[ yurie Casino ]*
Link: https://chat.whatsapp.com/InFdCK65EaW4YhqBFHmWep

• *[ yurie main ]*
Link: https://chat.whatsapp.com/L3J8tp04lzUBZbd1bTitSI


• *[ yurie Battles ]*
Link: https://chat.whatsapp.com/CZJTJsXlGiS1GHSLFrCJlF

• *[ yurie General ]*
Link: https://chat.whatsapp.com/Iivfl5q0F7v57jyTZep4a8

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
