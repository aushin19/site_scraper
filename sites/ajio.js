const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function ajioData(url) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-http2',
                '--disable-gpu',
            ],
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        const content = await page.content();
        const $ = cheerio.load(content);

        const website_name = 'Ajio';
        const prod_name = $('h1.prod-name').text().trim();
        const prod_affiliateURL = '';
        const prod_URL = url;
        const prod_currentPrice = $('div.prod-sp').text().trim();
        const prod_currencySymbol = $('div.prod-sp').text().trim().charAt(0);
        const prod_maxPrice = $('span.prod-cp').text().trim();
        const prod_rating = $('span._3c5q0').text().trim();
        const prod_reviews = $('span._38RNg').text().trim();

        const prod_image = $('img.rilrtl-lazy-img.img-alignment.zoom-cursor.rilrtl-lazy-img-loaded').attr('src');

        await browser.close();

        return {
            website_name,
            prod_name,
            prod_image,
            prod_affiliateURL,
            prod_URL,
            prod_currencySymbol,
            prod_currentPrice,
            prod_maxPrice,
            prod_rating,
            prod_reviews,
        };
    } catch (error) {
        console.error('Scraping error:', error);
        throw new Error('Failed to scrape the data');
    }
};

module.exports = ajioData;