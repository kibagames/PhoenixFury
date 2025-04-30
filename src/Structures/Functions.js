const axios = require('axios')
const { tmpdir } = require('os')
const { promisify } = require('util')
const FormData = require('form-data')
const { load } = require('cheerio')
const { exec } = require('child_process')
const { sizeFormatter } = require('human-readable')
const { readFile, unlink, writeFile } = require('fs-extra')
const path = require('path');


const fetch = async (url) => (await axios.get(url)).data
/**
 * @param {string} url
 * @returns {Promise<Buffer>}
 */

const getBuffer = async (url) =>
    (
        await axios.get(url, {
            responseType: 'arraybuffer'
        })
    ).data

/**
 * Capitalizes the first letter of a string or all words in a string.
 * @param {string} content - The text to capitalize.
 * @param {boolean} [all=false] - Whether to capitalize all words.
 * @returns {string}
 */
const capitalize = (content, all = false) => {
    if (!content) return ''; // Handle empty strings
    if (!all) return content.charAt(0).toUpperCase() + content.slice(1);

    return content
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

const greetings = () => {
    const now = new Date();
const hour = now.getHours();
let greetmsg = "";

if (hour >= 0 && hour < 12) {
    greetmsg = "🌅 Ohayou gozaimasu"; //good morning
} else if (hour >= 12 && hour < 18) {
    greetmsg = "🌞 Konnichiwa"; //good afternoon
} else {
    greetmsg = "🌇 Konbanwa"; //good evening
}
return greetmsg
}

const errorChan = () => {
    let chan = "https://telegra.ph/file/88c239a70a4b74b0e62f8.jpg"
    return chan
}

/**
 * @returns {string}
 */

const generateRandomHex = () => `#${(~~(Math.random() * (1 << 24))).toString(16)}`

/**
 * @param {string} content
 * @returns {number[]}
 */

const extractNumbers = (content) => {
    const search = content.match(/(-\d+|\d+)/g)
    if (search !== null) return search.map((string) => parseInt(string)) || []
    return []
}

/**
 * @param {string} url
 */

const extractUrls = (content) => linkify.find(content).map((url) => url.value)

/**
 * @param {Buffer} webp
 * @returns {Promise<Buffer>}
 */

const webpToPng = async (webp) => {
    const filename = `${tmpdir()}/${Math.random().toString(36)}`
    await writeFile(`${filename}.webp`, webp)
    await execute(`dwebp "${filename}.webp" -o "${filename}.png"`)
    const buffer = await readFile(`${filename}.png`)
    Promise.all([unlink(`${filename}.png`), unlink(`${filename}.webp`)])
    return buffer
}

/**
 * @param {Buffer} webp
 * @returns {Promise<Buffer>}
 */

const webpToMp4 = async (webp) => {
    const responseFile = async (form, buffer = '') => {
        return axios.post(buffer ? `https://ezgif.com/webp-to-mp4/${buffer}` : 'https://ezgif.com/webp-to-mp4', form, {
            headers: { 'Content-Type': `multipart/form-data; boundary=${form._boundary}` }
        })
    }
    return new Promise(async (resolve, reject) => {
        const form = new FormData()
        form.append('new-image-url', '')
        form.append('new-image', webp, { filename: 'blob' })
        responseFile(form)
            .then(({ data }) => {
                const datafrom = new FormData()
                const $ = load(data)
                const file = $('input[name="file"]').attr('value')
                datafrom.append('file', file)
                datafrom.append('convert', 'Convert WebP to MP4!')
                responseFile(datafrom, file)
                    .then(async ({ data }) => {
                        const $ = load(data)
                        const result = await getBuffer(
                            `https:${$('div#output > p.outfile > video > source').attr('src')}`
                        )
                        resolve(result)
                    })
                    .catch(reject)
            })
            .catch(reject)
    })
}

/**
 * @param {Buffer} gif
 * @param {boolean} write
 * @returns {Promise<Buffer | string>}
 */

const gifToMp4 = async (gif, write = false) => {
    const filename = `${tmpdir()}/${Math.random().toString(36)}`
    await writeFile(`${filename}.gif`, gif)
    await execute(
        `ffmpeg -f gif -i ${filename}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${filename}.mp4`
    )
    if (write) return `${filename}.mp4`
    const buffer = await readFile(`${filename}.mp4`)
    Promise.all([unlink(`${filename}.gif`), unlink(`${filename}.mp4`)])
    return buffer
}

const execute = promisify(exec)

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)]

const calculatePing = (timestamp, now) => (now - timestamp) / 1000

const formatSize = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: '2',
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

const term = (param) =>
    new Promise((resolve, reject) => {
        console.log('Run terminal =>', param)
        exec(param, (error, stdout, stderr) => {
            if (error) {
                console.log(error.message)
                resolve(error.message)
            }
            if (stderr) {
                console.log(stderr)
                resolve(stderr)
            }
            console.log(stdout)
            resolve(stdout)
        })
    })

const restart = () => {
    exec('pm2 start src/aurora.js', (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
    })
}
const convertMs = (ms, to = 'seconds') => {
    let seconds = parseInt(
        Math.floor(ms / 1000)
            .toString()
            .split('.')[0]
    )
    let minutes = parseInt(
        Math.floor(seconds / 60)
            .toString()
            .split('.')[0]
    )
    let hours = parseInt(
        Math.floor(minutes / 60)
            .toString()
            .split('.')[0]
    )
    let days = parseInt(
        Math.floor(hours / 24)
            .toString()
            .split('.')[0]
    )
    if (to === 'seconds') return seconds
    if (to === 'minutes') return minutes
    if (to === 'hours') return hours
    if (to === 'days') return days
    seconds = parseInt((seconds % 60).toString().split('.')[0])
    minutes = parseInt((minutes % 60).toString().split('.')[0])
    hours = parseInt((hours % 24).toString().split('.')[0])
    return {
        days,
        seconds,
        minutes,
        hours
    }
}

/**
     * @param {string} tier
     * @returns {number}
     */

   const calculatePrice = (tier) => {
        let price = 0

        switch (tier) {
            case '1':
                price = Math.floor(Math.random() * (3000 - 2000) + 2000);
                break;
            case '2':
                price = Math.floor(Math.random() * (5000 - 3500) + 3500);
                break;
            case '3':
                price = Math.floor(Math.random() * (7000 - 5900) + 5900);
                break;
            case '4':
                price = Math.floor(Math.random() * (9000 - 7000) + 7000);
                break;
            case '5':
                price = Math.floor(Math.random() * (15000 - 1300) + 13000);
                break;
            case '6':
                price = Math.floor(Math.random() * (50000 - 35000) + 35000);
                break;
            case 'S':
                price = Math.floor(Math.random() * (100000 - 60000) + 60000);
                break;
        }
        return price;
    }
    
    
/**
 * Scrapes card data from the provided card ID.
 * 
 * @param {string} id - The card ID to scrape the data from.
 * @returns {Promise<{id: string, title: string, imageUrl: string, tier: string, source: string, isGif: boolean}>} - An object containing the card's ID, title, image URL, tier, source, and a boolean indicating if the image is a GIF.
 */
/* const spawnCard = async (id) => {
    const link = `https://shoob.gg/cards/info/${id}`;
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(link);

    await page.waitForSelector('div > .cardData');
    const title = await page.$eval('.img-fluid', img => img.title);
    const imageUrl = await page.$eval('.img-fluid', img => img.src);
    const det = await page.$eval('.breadcrumb-new', el => {
        const innerText = el.innerText.toLowerCase();
        if (innerText.includes('tier')) {
            return innerText.split('\n');
        } else {
            return null;
        }
    });

    const tier = det ? det[1].replace('tier', '').trim() : null;
    const source = det ? det[2].trim() : null;
    const isGif = imageUrl.endsWith('.gif');

    await browser.close();

    return { id, title, imageUrl, tier, source, isGif };
}
*/

   /**
 * Converts a GIF to PNG, with the first appearance of the GIF as an image.
 * @param {Buffer} gif - The GIF buffer to convert.
 * @returns {Promise<Buffer>} A promise that resolves to a buffer containing the generated PNG.
 */
const gifToPng = async (gif) => {
    const filename = `${tmpdir()}/${Math.random().toString(36)}`;
    await writeFile(`${filename}.gif`, gif);
    await execute(`ffmpeg -i "${filename}.gif" -vframes 1 "${filename}.png"`);
    const buffer = await readFile(`${filename}.png`);
    await Promise.all([unlink(`${filename}.gif`), unlink(`${filename}.png`)]);
    return buffer;
};

/**
 * Generates a random unique tag with the specified number of digits.
 * 
 * @param {number} n - The number of digits for the unique tag.
 * @returns {string} The generated unique tag.
 */
const generateRandomUniqueTag = (n = 4) => {
    const maxDigits = 11;
    if (n > maxDigits) {
        return `${generateRandomUniqueTag(maxDigits)}${generateRandomUniqueTag(n - maxDigits)}`;
    }
    const max = Math.pow(10, n);
    const min = Math.pow(10, n - 1);
    return (Math.floor(Math.random() * (max - min)) + min).toString();
};

module.exports = {
    fetch,
    calculatePing,
    capitalize,
    execute,
    extractNumbers,
    formatSize,
    generateRandomHex,
    getBuffer,
    errorChan,
    getRandomItem,
    gifToMp4,
    restart,
    term,
    webpToMp4,
    webpToPng,
    greetings,
    getRandomInt,
    convertMs,
    extractUrls,
    gifToPng,
    calculatePrice,
    gifToPng,
    generateRandomUniqueTag
}
                
