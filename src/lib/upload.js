const imgbbUploader = require('imgbb-uploader');

const getDisplayUrl = async (buffer, name = 'Default-filename') => {
    try {
        const res = await imgbbUploader({
            apiKey: '12925d130c7959791e246719e1d29b6d',
            base64string: buffer,
            name
        });
        console.log(res)
        return res.display_url;
    } catch (e) {
        return 'http://placekitten.com/300/300';
    }
};

module.exports = { getDisplayUrl };
