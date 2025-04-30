const now = new Date();
const hour = now.getHours();
let greeting;

if (hour >= 0 && hour < 12) {
  greeting = "🌸✨ Good Morning";
} else if (hour >= 12 && hour < 18) {
  greeting = "☀️🌼 Good Afternoon";
} else {
  greeting = "🌙💫 Good Evening";
}

module.exports = {
  name: 'help',
  aliases: ['h', 'menu', 'list'],
  category: 'core',
  exp: 1,
  cool: 4,
  react: "🌟",
  usage: 'Use :help for helplist or :help <command_name> to get command info',
  description: 'Displays the command list or specific command info',
  async execute(client, arg, M) {
    try {
      if (!arg) {
        let pushName = M.pushName.trim();
        if (pushName.split(' ').length === 1) {
          pushName = `${pushName} 🌸`;
        }

        const categories = client.cmd.reduce((obj, cmd) => {
          const category = cmd.category;
          if (category !== 'dev') { // Exclude 'dev' category
            obj[category] = obj[category] || [];
            obj[category].push(cmd.name);
          }
          return obj;
        }, {});

        const commandList = Object.keys(categories);
        let commands = '';

        for (const category of commandList) {
          commands += `🌟 *${client.utils.capitalize(category, true)}*\n➖➖➖➖\n\`\`\`${categories[category].join(', ')}\`\`\`\n\n`;
        }

        let message = `${greeting}, *${pushName}* 🌺!\n\n✨ *Welcome to yurie Bot* ✨\nHere’s the list of available commands:\n\n${commands}`;
        message += `\n📌 *Notes:*\n1️⃣ To join the official support group, type: *${client.prefix}support*\n2️⃣ For command details, use: *${client.prefix}command <command_name>*\n\n🔖 _Powered by Team yurie_ 🌈`;

        await client.sendMessage(
          M.from,
          {
            text: message
          },
          {
            quoted: M
          }
        );
        return;
      }

      const command = client.cmd.get(arg) || client.cmd.find((cmd) => cmd.aliases && cmd.aliases.includes(arg));

      if (!command) {
        M.reply('❌ Command not found! Please try again.');
        return;
      }

      const message = `✨ *Command Details:*\n\n🔹 *Name:* ${command.name}\n🔹 *Aliases:* ${command.aliases.join(', ')}\n🔹 *Category:* ${command.category}\n🔹 *Cooldown:* ${command.cool} seconds\n🔹 *Usage:* ${command.usage}\n🔹 *Description:* ${command.description}`;

      M.reply(message);
    } catch (err) {
      await client.sendMessage(
        M.from,
        { image: { url: `${client.utils.errorChan()}` }, caption: `💥 Oops! An error occurred:\n\n${err}` },
        { quoted: M }
      );
    }
  }
};
