const ccxt = require('ccxt');
const moment = require('moment');
const delay = require('delay');

const binance = new ccxt.binance({
    apiKey: 'AXXNnAvxI0FjXOu1yz9katCypU27MZYXY728YYiotOo2QYpar2scNx3krOK7TKjB',
    secret: 'rWP5RgyswmJEMJ9c9tNTfvrh76VpXkRg0IOu2LEigWgduxFLQWl6QpzUq3HNnqLe',
});

binance.setSandboxMode(true)

async function printBalance(btcPrice){
    const balance = await binance.fetchBalance();
    const total = balance.total
    console.log(`balance: BTC ${total.BTC}, USDT: ${total.USDT}`);
    console.log(`Total USDT: ${(total.BTC - 1) * btcPrice + total.USDT}). \n`);
}

async function tick(){

    const price = await binance.fetchOHLCV('BTC/USDT',"1m", undefined, 10);
    const bPrice = price.map(price => {
        return {
            timestamp: moment(price[0]).format(),
            open: price[1] ,
            high: price[2] ,
            low: price[3], 
            close: price[4], 
            volume: price[5]
        }
    })

    const averagePrice = bPrice.reduce((acc, price) => acc + price.close, 0) / 10
    const lastPrice = bPrice[bPrice.length - 1].close

    console.log(bPrice.map(p => p.close), averagePrice, lastPrice);

    //
    const direction = lastPrice > averagePrice ? 'sell' : 'buy'

    const TRADE_SIZE = 100
    const quantiny = TRADE_SIZE / lastPrice

    console.log(`Average price: ${averagePrice}. last price ${lastPrice}`)
    const order = await binance.createMarketOrder('BTC/USDT', direction, quantiny)
    console.log(`${moment().format()}: ${direction}${quantiny} BTC at ${lastPrice}`)

    printBalance(lastPrice)
}

async function main(){
    while (true){
        await tick();
        await delay(60 * 1000);
    }
}
main()
//printBalance()