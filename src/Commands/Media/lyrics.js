const axios = require('axios');

module.exports = {
  name: 'lyrics',
  aliases: ['lyr'],
  category: 'media',
  exp: 2,
  cool: 4,
  react: "✅",
  usage: 'Use :lyrics <song_name>',
  description: 'Sends the lyrics of a given song',
  
  async execute(client, arg, M) { 
    if (!arg) return M.reply('🟥 *Provide the name of the song to search for lyrics*');

    const term = arg.trim();
    
    try {
      const data = await getLyrics(term);
      if (!data) return M.reply(`🟨 *Couldn't find lyrics for* "${term}"`);

      // Extracting necessary information
      const { lyrics, title, artist } = data;
      let caption = `🎶 *Title:* ${title}\n🖋️ *Artist:* ${artist || "Unknown"}\n\n${lyrics.substring(0, 4000)}`;

      // Sending the lyrics
      await client.sendMessage(M.from, { text: caption }, { quoted: M });

    } catch (error) {
      console.error(error);
      M.reply('🟥 *An error occurred while fetching lyrics.*');
    }
  }
};

async function getLyrics(song) {
    try {
        let artist = "";
        let title = song;
        let response;
            // Search for song details using API
            const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&limit=1&entity=song`;
            const searchRes = await axios.get(searchUrl);

            if (!searchRes.data.results.length) return null;

            artist = searchRes.data.results[0].artistName;
            title = searchRes.data.results[0].trackName;

            // Fetch lyrics again with detected artist
            response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);

        if (!response.data.lyrics) return null;

        return { lyrics: response.data.lyrics, title, artist };
    } catch (error) {
        console.error("Lyrics API error:", error.message);
        return null;
    }
}
