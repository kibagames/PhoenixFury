const { getDisplayUrl } = require('../../lib/upload');

module.exports = {
  name: "upload",
  aliases: ["tourl"],
  exp: 5,
  cool: 4,
  react: "✨",
  category: "utils",
  usage: 'up',
  description: "upload images and gives link",
  
  async execute(client, arg, M) {
    const content = JSON.stringify(M.quoted);
    const isMedia = M.type === 'imageMessage' || M.type === 'videoMessage';
    const isQuotedMedia = (M.type === 'extendedTextMessage' && content.includes('imageMessage')) ||
                          (M.type === 'extendedTextMessage' && content.includes('videoMessage'));

    if (isMedia || isQuotedMedia) {
      // Download the media
      const buffer = isQuotedMedia ? await M.quoted.download() : await M.download();
      try {
        const base64 = await bufferToBase64(buffer);
        const result = await getDisplayUrl(base64, M.pushName);
        await M.reply(`*Media Uploaded To Telegraph* \n\n*Link:* ${result}`);
      } catch (error) {
        console.log(error);
        await M.reply('An error occurred. Try again later.');
      }
    } else {
      await M.reply('No media found to upload.');
    }
  }
};

const bufferToBase64 = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      const base64string = Buffer.from(buffer).toString('base64'); // Convert buffer to base64
      resolve(base64string);
    } catch (error) {
      reject(error); // If there is any error in conversion, reject the promise
    }
  });
};
