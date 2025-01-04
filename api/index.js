const express = require('express');
const scrapeAjio = require('../sites/ajio');
const scrapeMyntra = require('../sites/myntra');
const scrapeFlipkart = require('../sites/flipkart');

const app = express();
const port = 3000;

app.get('/scrape/ajio', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const data = await scrapeAjio(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/scrape/myntra', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const data = await scrapeMyntra(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/scrape/flipkart', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const data = await scrapeFlipkart(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3000');
});