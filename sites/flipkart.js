const axios = require('axios');
const https = require('https');
const { URL } = require('url');

async function flipkartData(shortURL) {
    try {
        const originalURL = await expandShortURL(shortURL);
        const parsedUrl = new URL(originalURL);
        const pathname = parsedUrl.pathname + parsedUrl.search;

        const data = JSON.stringify({
            pageUri: pathname
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://2.rome.api.flipkart.com/api/4/page/fetch',
            headers: {
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Origin': 'https://www.flipkart.com',
                'Pragma': 'no-cache',
                'Referer': 'https://www.flipkart.com/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'X-User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 FKUA/website/42/website/Desktop',
                'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
            data
        };

        const response = await axios.request(config);
        const content = response.data.RESPONSE.pageData.pageContext;

        const productData = {
            website_name: 'Flipkart',
            prod_name: content.titles?.title || 'N/A',
            prod_image: transformImageUrl(content.imageUrl),
            prod_affiliateURL: '',
            prod_URL: shortURL,
            prod_currencySymbol: '₹',
            prod_currentPrice: convertPrice(content.pricing?.finalPrice?.value || 0),
            prod_maxPrice: convertPrice(content.pricing?.mrp || 0),
            prod_rating: content.fdpEventTracking.commonContext.pr?.rating || 'N/A',
            prod_reviews: content.fdpEventTracking.commonContext.pr?.reviewsCount || 0
        };

        return productData;
    } catch (error) {
        throw new Error('Failed to fetch Flipkart data');
    }
}

function convertPrice(number) {
    return number ? number.toLocaleString('en-US') : '0';
}

function transformImageUrl(imageUrl) {
    if (!imageUrl) return 'N/A';
    return imageUrl
        .replace('%7B@', '')
        .replace('%7D', '')
        .replace('{@quality}', '70&crop=false')
        .replace('{@width}', '1024')
        .replace('{@height}', '1024');
}

async function expandShortURL(shortURL) {
    try {
        const response = await axios.get(shortURL, {
            maxRedirects: 10,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Mimic a browser
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });

        const originalUrl = response.request.res.responseUrl;
        return originalUrl;
    } catch (error) {
        console.error('Error extracting original URL:');

        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error:', error.message);
        }

        return null;
    }
}

module.exports = flipkartData;