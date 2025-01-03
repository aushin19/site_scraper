const axios = require('axios');

async function flipkartData(url) {
    try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname;
        let data = JSON.stringify({
            "pageUri": pathname
        });

        let config = {
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
            data: data
        };

        const response = await axios.request(config);

        const content = response.data;

        const website_name = 'Flipkart';
        const prod_name = content.RESPONSE.pageData.pageContext.titles.title;
        let prod_image = content.RESPONSE.pageData.pageContext.imageUrl + "";
        prod_image = prod_image.replace("%7B@", "").replace("%7D", "").replace("{@quality}", "70&crop=false").replace("{@width}", "1024").replace("{@height}", "1024")
        const prod_affiliateURL = '';
        const prod_URL = url;
        const prod_currencySymbol = "₹";
        const prod_currentPrice = convertPrice(Number(content.RESPONSE.pageData.pageContext.pricing.finalPrice.value));
        const prod_maxPrice = convertPrice(Number(content.RESPONSE.pageData.pageContext.pricing.finalPrice.value));
        const prod_rating = content.RESPONSE.pageData.pageContext.rating.average;
        const prod_reviews = content.RESPONSE.pageData.pageContext.rating.reviewCount;

        const productData = {
            website_name,
            prod_name,
            prod_image,
            prod_affiliateURL,
            prod_URL,
            prod_currencySymbol,
            prod_currentPrice,
            prod_maxPrice,
            prod_rating,
            prod_reviews
        };

        return productData;
    } catch (error) {
        console.error('Scraping error:', error);
        throw new Error('Failed to scrape the data');
    }
}

function convertPrice(number) {
    const formattedNumber = number.toLocaleString('en-US');
    return formattedNumber
}

module.exports = flipkartData;
