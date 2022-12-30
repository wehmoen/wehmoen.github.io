async function listTransactions(address) {
    const url = `https://go.ronin.rest/archive/listSentTransactions/${address}`;
    return (await fetch(url)).json();
}

async function getTransaction(hash) {
    const url = `https://go.ronin.rest/ronin/getTransaction/${hash}`;
    return (await fetch(url)).json();
}
async function getTransactionReceipt(hash) {
    const url = `https://go.ronin.rest/ronin/getTransactionReceipt/${hash}`;
    return (await fetch(url)).json();
}

async function getPrice() {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=ronin&vs_currencies=usd`;
    const data = await (await fetch(url)).json();
    return data.ronin.usd
}

function gweiToUsd(ron, price) {
    return price * ron;
}

async function scrape(address, price) {

    let trxs = await listTransactions(address);
    const p = new PB(trxs.length, document.getElementById("progress"));
    let totalGwei = 0;
    let txCount = 0;
    for (let trx of trxs) {
        let tx = await getTransaction(trx);
        let receipt = await getTransactionReceipt(trx);
        let txPrice = (receipt.GasUsed * tx.GasPrice) * 1e-18;
        totalGwei += txPrice;
        txCount++;
        p.next();
        document.getElementById("result").innerHTML = `You paid ${gweiToUsd(totalGwei, price).toFixed(4)} USD (${totalGwei.toFixed(4)} RON) in fees for ${txCount} transactions.`;
    }

    setTimeout(() => {
        p.complete();
    }, 5000);

    return gweiToUsd(totalGwei, price);
}

