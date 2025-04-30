const now = new Date();
const hour = now.getHours();
let greeting;
if (hour >= 0 && hour < 12) {
  greeting = "💕 Good Morning";
} else if (hour >= 12 && hour < 18) {
  greeting = "💕 Good Afternoon";
} else {
  greeting = "💕 Good Evening";
}

module.exports = {
    name: 'hi',
    aliases: ['hello'],
    category: 'core',
    exp: 1,
    cool: 4, // Cooldown in seconds
    react: "🍥",
    usage: 'Use :hi to check bot',
    description: 'Says hi to the bot.',
    async execute(client, arg, M) { 
        try {
            const hello = ['konnichiwa', 'hello', 'hi', 'kya haal?', 'bonjour', 'hola', 'hallo', 'hey', 'yo', 'howdy', 'greetings'];
            const hi = hello[Math.floor(Math.random() * hello.length)];
            
            const contact = await client.contact.getContact(M.sender, client);
            const username = contact && contact.username ? contact.username : 'there';
            let { key } = await M.reply(`${greeting} ${username}`)
        
            setTimeout(async () => {
            await client.relayMessage(M.from, {
                protocolMessage: {
                    key,
                    type: 14,
                    editedMessage: {
                        conversation: `${hi} *${username}*. How are you today?`
                    }
                }
            },{})

      if ( M.sender == "917973456275@s.whatsapp.net") {
            await client.relayMessage(M.from, {
                protocolMessage: {
                    key,
                    type: 14,
                    editedMessage: {
                        conversation: `${hi} Master Phoenix, ${greeting} How are you today my master?`
                    }
                }
            },{})
      }
        }, 5000);
        } catch (error) {
            console.error('Error in executing hi command:', error);
            M.reply('An error occurred while executing the hi command.');
        }
    }
}
