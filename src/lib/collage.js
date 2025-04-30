const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const axios = require('axios'); // For downloading images

// Card positions on the canvas
const positions = [
  [0, 0],
  [350, 0],
  [700, 0],
  [0, 450],
  [350, 450],
  [700, 450],
  [0, 900],
  [350, 900],
  [700, 900],
  [0, 1350],
  [350, 1350],
  [700, 1350],
];

/**
 * Downloads an image from a URL and returns it as a buffer.
 * @param {string} url - The URL of the image.
 * @returns {Promise<Buffer>} - The image as a buffer.
 */
async function downloadImage(url) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
}

/**
 * Creates a collage of cards.
 * @param {string[]} cardLinks - Array of image URLs for the cards (1-12).
 * @param {string} outputPath - Path to save the generated collage.
 * @param {string} [backgroundLink] - Optional background image URL.
 */
async function createCollage(cardLinks, outputPath, backgroundLink) {
  try {
    const width = 1050;
    const height = 1800;

    // Create a base image (white background or from backgroundLink)
    let baseImage;
    if (backgroundLink) {
      const backgroundBuffer = await downloadImage(backgroundLink);
      baseImage = await sharp(backgroundBuffer).resize(width, height).toBuffer();
    } else {
      baseImage = await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }, // White background
        },
      })
        .png()
        .toBuffer();
    }

    // Composite all card images onto the base image
    const composites = [];

    for (let i = 0; i < Math.min(cardLinks.length, positions.length); i++) {
      const cardBuffer = await downloadImage(cardLinks[i]); // Fetch card image as a buffer
      const cardImage = await sharp(cardBuffer)
        .resize(350, 450) // Resize each card to fit the slot
        .toBuffer();

      composites.push({
        input: cardImage,
        top: positions[i][1],
        left: positions[i][0],
      });
    }

    // Generate the collage and save it to the output path
    const finalImage = await sharp(baseImage)
      .composite(composites)
      .toBuffer();

    await fs.writeFile(outputPath, finalImage);

    console.log(`Collage created successfully at ${outputPath}`);
  } catch (error) {
    console.error('Error creating collage:', error);
  }
}

const createBgShop = async (pictures) => {
    const canvasWidth = 960;
    const canvasHeight = 1120;
    const cardWidth = 300;
    const cardHeight = 500;
    const horizontalSpacing = (canvasWidth - (3 * cardWidth)) / 4;
    const verticalSpacing = (canvasHeight - (2 * cardHeight)) / 3;

    const positions = [
        [horizontalSpacing, verticalSpacing],
        [horizontalSpacing * 2 + cardWidth, verticalSpacing],
        [horizontalSpacing * 3 + cardWidth * 2, verticalSpacing],
        [horizontalSpacing, verticalSpacing * 2 + cardHeight],
        [horizontalSpacing * 2 + cardWidth, verticalSpacing * 2 + cardHeight],
        [horizontalSpacing * 3 + cardWidth * 2, verticalSpacing * 2 + cardHeight]
    ];

    const compositeOptions = [];

    for (let i = 0; i < Math.min(pictures.length, 6); i++) {
        const imageBuffer = await sharp(pictures[i]).resize(cardWidth, cardHeight).toBuffer();
        const [x, y] = positions[i];
        compositeOptions.push({ input: imageBuffer, top: y, left: x });
    }

    const resultBuffer = await sharp({
        create: {
            width: canvasWidth,
            height: canvasHeight,
            channels: 3,
            background: 'white'
        }
    })
        .composite(compositeOptions)
        .toBuffer();

    return resultBuffer;
};

const createCardShop = async (client, cards) => {
    const canvasSize = 1050;
    const cardSize = 350;
    const positions = [
        [0, 0], [350, 0], [700, 0],
        [0, 350], [350, 350], [700, 350],
        [0, 700], [350, 700], [700, 700]
    ];

    const compositeOptions = [];

    for (let i = 0; i < Math.min(cards.length, positions.length); i++) {
        const card = cards[i];
        const url = card.image;

        let imageBuffer;
        if (card.tier.includes('6') || card.tier.includes('S')) {
            imageBuffer = await client.utils.gifToPng(await client.utils.getBuffer(url));
        } else {
            imageBuffer = await client.utils.getBuffer(url);
        }

        const resizedBuffer = await sharp(imageBuffer).resize(cardSize, cardSize).toBuffer();
        const [x, y] = positions[i];
        compositeOptions.push({ input: resizedBuffer, top: y, left: x });
    }

    const resultBuffer = await sharp({
        create: {
            width: canvasSize,
            height: canvasSize,
            channels: 3,
            background: 'white'
        }
    })
        .composite(compositeOptions)
        .toBuffer();

    return resultBuffer;
};

module.exports = {
    createCollage,
    createBgShop,
    createCardShop
};
