const axios = require('axios');

module.exports = {
  name: 'instagram',
  aliases: ['insta'],
  category: 'media',
  exp: 2,
  cool: 4,
  react: "✅",
  usage: 'Use :insta <Link>',
  description: 'Sends the content of a given Instagram URL',
  async execute(client, arg, M) {
    // Check if an argument is provided
    if (!arg || !arg.length) {
      return M.reply('❌ Please provide an Instagram URL');
    }

    const url = arg.trim();

    // Validate if the provided URL is an Instagram link
    if (!url.includes('instagram.com/')) {
      return M.reply('❌ Invalid link. Please provide a valid Instagram URL.');
    }

    try {
      M.reply("*Please wait, video or image is being downloaded...*");
      
      // Fetch media data from the API
      const res = await axios.get(`https://d-mail-api.vercel.app/insta?url=${url}`);
      
      // Retrieve buffer from the media URL
      const mediaUrl = res.data.data[0].url;
      const buffer = await client.utils.getBuffer(mediaUrl);
      const type = mediaUrl.startsWith('https://scontent') ? 'image' : 'video';

      await client.sendMessage(
        M.from,
        {
            [type]: buffer,
            caption: `Downloaded for you`,
        },
        {
            quoted: M,
        }
    );
    } catch (error) {
      console.error(error);
      return M.reply(`❌ Error while retrieving media data: ${error.message}`);
    }
  }
};
