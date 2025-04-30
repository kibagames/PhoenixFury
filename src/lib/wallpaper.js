const axios = require("axios");

const fetchWallpapers = async (query, amount = 10) => {
    const site = 'https://wallpaper-api-cyan.vercel.app/wallpaper?q=';

    try {
        const res = await axios.get(`${site}${query}&amount=${amount}`);
        return res.data.results.map((image) => image.url);
    } catch (error) {
        console.error('Error fetching wallpapers:', error.message);
        return [];
    }
};

module.exports = fetchWallpapers;
