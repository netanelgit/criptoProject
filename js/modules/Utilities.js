const Utilities = (function () {

    return class Utilities{

        static AJAX = class Ajax {

            /** Fetch data from a given URL
             * @param {string} urlPath
             */
            static async pAjaxGetDataByURL(urlPath) {
                    const response = await fetch(urlPath);
                    if (!response.ok) throw new Error("API request failed");
                    return await response.json();
            }           

            /**Get Coin Market Data By ID
            * @param {string} coinID 
            * @returns{CoinMarketData}
            */
            static async getCoinMarketDataByID(coinID) {
                try {
                    // Get Coins Details:
                    let promiseCoinDetails = pAjaxGetDataByURL(`https://api.coingecko.com/api/v3/coins/${coinID}`);
                    let coinDetails = await promiseCoinDetails;

                    // Get coin Price & Market Capacity
                    let cPrice = coinDetails.market_data.current_price;
                    let cMarketCap = coinDetails.market_data.market_cap.usd;
                    let cMarketData = new CoinMarketData(cPrice.usd, cPrice.eur, cPrice.ils, cMarketCap)

                    return cMarketData;
                } catch (e) {
                    alert(e, message);
                }
            }
        }
    }
})();