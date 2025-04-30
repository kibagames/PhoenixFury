const { getDisplayUrl } = require('../../lib/upload');

module.exports = {
  name: 'icon',
  aliases: [''],
  category: 'core',
  exp: 1,
  cool: 5,
  react: "✅",
  usage: 'icon --set | icon --reset',
  description: 'Set or reset your profile icon',
  
  async execute(client, arg, M) {
    const userId = M.sender;

    if (!arg || arg.length === 0) {
      return M.reply('❌ Please provide an option like `--set` or `--reset`.');
    }

    if (arg.startsWith('--set')) {
      const icon = await makeImage(client, M);
      if (icon) {
        await client.DB.set(`${userId}_icon`, icon);
        return M.reply('✅ Your icon has been set.');
      }
    } else if (arg.startsWith('--reset')) {
      await client.DB.delete(`${userId}_icon`);
      return M.reply('✅ Your icon has been reset.');
    } else {
      return M.reply('❌ Invalid option. Use `--set` to set your icon or `--reset` to clear it.');
    }
  }
};

// Helper function to process media upload
async function makeImage(client, M) {
 const content = JSON.stringify(M.quoted)
        const isMedia = M.type === 'imageMessage' || M.type === 'videoMessage'
        const isQuoted =
            (M.type === 'extendedTextMessage' && content.includes('imageMessage')) ||
            (M.type === 'extendedTextMessage' && content.includes('videoMessage'))
        
  if (isMedia || isQuoted) {
    const buffer = isQuoted ? await M.quoted.download() : await M.download();
    try {
      const base64 = await bufferToBase64(buffer);
      const result = await getDisplayUrl(base64, M.pushName);
      return result;
    } catch (error) {
      console.error('Error uploading media:', error);
      M.reply('❌ An error occurred while processing your media. Please try again later.');
      return null;
    }
  } else {
    M.reply('❌ Please send or quote an image or video to set as an icon.');
    return null;
  }
}

const bufferToBase64 = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      const base64string = Buffer.from(buffer).toString('base64'); // Convert buffer to base64
      resolve(base64string);
    } catch (error) {
      reject(error); // Reject the promise if there is an error in conversion
    }
  });
};
