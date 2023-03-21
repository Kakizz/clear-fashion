/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./eshops/dedicatedbrand');
const circlesportswear = require('./eshops/circlesportswear');
const montlimart = require('./eshops/montlimart');
const fs = require('fs');

async function scrape (eshop) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} eshop`);
    let products;

    if (eshop.includes('dedicatedbrand')) {
      products = await dedicatedbrand.scrape(eshop);
    }
    else if (eshop.includes('circlesportswear')) {
      products = await circlesportswear.scrape(eshop);
    }
    else if (eshop.includes('montlimart')) {
      products = await montlimart.scrape(eshop);
    }

    console.log('done');
    return products;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function main() {
  let sitesToScrape = ['https://shop.circlesportswear.com/collections/all', 'https://www.montlimart.com/99-vetements'];
  
  for (page = 1; page <= 16; page++) {
    sitesToScrape.push(`https://www.dedicatedbrand.com/en/men/all-men?p=${page}`)
    sitesToScrape.push(`https://www.dedicatedbrand.com/en/women/all-women?p=${page}`)
  }

  let products = [];

  for (const site of sitesToScrape) {
    const scrapedProducts = await scrape(site);
    products = products.concat(scrapedProducts);
  }
  console.log(products);
  const jsonData = JSON.stringify(products, null, 2);

  fs.unlink('products.json', (err) => {
    if (err && err.code !== 'ENOENT') throw err; // Ignore error if file doesn't exist
    fs.writeFile('products.json', jsonData, (err) => {
      if (err) throw err;
      console.log('Table saved to file!');
    });
  });
}

main();
