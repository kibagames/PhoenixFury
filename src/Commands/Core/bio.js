module.exports = {
    name: 'bio',
    aliases: ['about'],
    category: 'core',
    exp: 1,
    cool: 5,
    react: "✅",
    usage: 'bio --set <bio> | bio --reset',
    description: 'Set or reset your bio',

  async execute(client, arg, M) {
      const userId = M.sender;

      if (!arg || arg.length === 0) {
          return M.reply('❌ Please provide an option like `--set <bio>` or `--reset`.');
      }

      // Check if the action is '--set' or '--reset'
      if (arg.startsWith('--set')) {
          const bio = arg.slice(6).trim();  // Extract bio text after '--set'

          // Validate the bio text
          if (!bio) return M.reply('❌ Please provide a valid bio text to set.');

          // Save the bio in the database
          await client.DB.set(`${userId}_bio`, bio);
          return M.reply(`✅ Your bio has been set to *${bio}*`);

      } else if (arg.startsWith('--reset')) {
          // Remove the bio from the database
          await client.DB.delete(`${userId}_bio`);
          return M.reply('✅ Your bio has been reset.');

      } else {
          // If an invalid action is provided
          return M.reply('❌ Invalid option. Use `--set <bio>` to set your bio or `--reset` to clear it.');
      }
  }
};
