module.exports = {
  name: 'username',
  aliases: ['user'],
  category: 'core',
  exp: 1,
  cool: 5,
  react: "✅",
  usage: 'username --set <username> | username --reset',
  description: 'Set or reset your username',
  async execute(client, arg, M) {
    const userId = M.sender;
    const input = arg.trim();

    if (input.startsWith('--set')) {
      const username = input.replace('--set', '').trim();
      if (!username) return M.reply('❌ Please provide a new username.');

      await client.DB.set(`${userId}_username`, username);
      return M.reply(`✅ Your username has been changed to *${username}*`);

    } else if (input.startsWith('--reset')) {
      await client.DB.delete(`${userId}_username`);
      return M.reply('✅ Your username has been reset.');

    } else {
      return M.reply('❌ Invalid option. Use `--set <username>` or `--reset`.');
    }
  }
};
