const axios = require('axios');

module.exports = {
    name: 'tiktok',
    aliases: ['tik'],
    category: 'media',
    exp: 2,
    cool: 4,
    react: "✅",
    usage: 'Use :tiktok <tiktok_link> [--quality=<720|low|high|1080>]',
    description: 'Downloads the given TikTok video and sends it as a video file. Optionally specify the video quality.',
    async execute(client, arg, M) {
        try {
            if (!arg) return M.reply('Please provide a TikTok link.');
            
            const url = arg.split(' ')[0];
            const flags = arg.split(' ').filter(f => f.startsWith('--'));

            if (url.includes('tiktok.com')) {
                M.reply("*Please wait, video is being downloaded...*");

                const res = await axios.get(`https://d-mail-api.vercel.app/tiktok?url=${url}`);
                let videoURL = res.data.videoData.downloadLinks[2];
                
                const quality = flags.find(f => f.startsWith('--quality=') && ['720', 'low', 'high', '1080'].includes(f.split('=')[1]))?.split('=')[1] || '1080';
                if (quality === '720' || quality === 'low') videoURL = res.data.videoData.downloadLinks[1];

                const headRes = await axios.get(videoURL.link, { headers: { 'Range': 'bytes=0-0' } });
                const videoSizeMB = (headRes.headers['content-range'].split('/')[1] / (1024 * 1024)).toFixed(2);

                if (videoSizeMB > 100) return M.reply(`The video size is *${videoSizeMB} MB*, which is too large to download.`);
                
                const buffer = await client.utils.getBuffer(videoURL.link);
                
                client.sendMessage(M.from, {
                    video: buffer,
                    caption: res.data.videoData.title
                })
            } else {
                M.reply('Please provide a valid TikTok link.');
            }
        
        } catch (error) {
            console.error(error);
            M.reply('An error occurred while downloading the TikTok video.');
        }
    }
};
