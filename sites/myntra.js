const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');

async function myntraData(url) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            channel: 'chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-http2',
                '--disable-gpu',
            ]
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        const content = await page.content();
        const $ = cheerio.load(content);

        const website_name = 'Myntra';
        const prod_name = $('h1.pdp-name').text().trim();
        const prod_affiliateURL = '';
        const prod_URL = url;
        let prod_currentPriceText = $('span.pdp-price').text().trim().replace("MRP", "").replace(" ", "");
        prod_currentPriceText = convertPrice(Number(prod_currentPriceText.replace(prod_currentPriceText.charAt(0), "")));
        
        const prod_currentPrice = convertToNumber(prod_currentPriceText)

        const prod_currencySymbol = $('span.pdp-price').text().trim().replace("MRP", "").replace(" ", "").charAt(0);

        let prod_maxPriceText = $('span.pdp-mrp > s:first-child').text().trim();
        prod_maxPriceText = convertPrice(Number(prod_maxPriceText.replace(prod_maxPriceText.charAt(0), "")))

        const prod_maxPrice = convertToNumber(prod_maxPriceText)

        let prod_rating = $('div.index-overallRating > div:first-child').text().trim();
        prod_rating = Number(prod_rating.length === 0 ? 0 : prod_rating);
        let prod_reviews = $('div.index-ratingsCount').text().trim();
        prod_reviews = prod_reviews.length === 0 ? "" : prod_reviews;

        const prod_image_style = $('div.image-grid-image').attr('style');
        let prod_image = '';

        if (prod_image_style) {
            const urlMatch = prod_image_style.match(/url\("(.+?)"\)/);
            prod_image = urlMatch ? urlMatch[1] : '';
        }

        await browser.close();

        const productData = {
            website_name,
            prod_name,
            prod_image,
            prod_URL,
            prod_currencySymbol,
            prod_currentPriceText,
            prod_currentPrice,
            prod_maxPriceText,
            prod_maxPrice,
            prod_rating,
            prod_reviews,
        };

        console.log(productData);
        return productData;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to scrape the data');
    }
}

function convertPrice(number) {
    const formattedNumber = number.toLocaleString('en-US');
    return formattedNumber
}

const convertToNumber = (str) => {
    if (!str) return 0;
    return Number(str.replace(/,/g, ''));
};

module.exports = myntraData;