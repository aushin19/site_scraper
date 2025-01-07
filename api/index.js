const express = require('express');
const Links = require('../utils/links');

const app = express();
const links = new Links();

app.get('/scrape', async (req, res) => {
    const inputURL = encodeURI(req.query.url);
    if (!inputURL) {
      return res.status(400).json({error: 'URL is required' });
    }
    console.log(inputURL);
  
    try {
      const data = await links.isLinkValid(inputURL);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({error: error.message });
    }
  });

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3000');
});