// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';


let currentProducts = [];
let show = 12;
let page = 1;
let brand = 'No';
let price = 'No';
let days = 'No';
let sort = 'Cheapest';
let favorite_products = [];
const current_date = Date.now();

// Selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const selectPrice = document.querySelector('#price-select');
const selectDays = document.querySelector('#days-select');
const selectSort = document.querySelector('#sort-select');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbBrands = document.querySelector('#nbBrands');
const spanNbRecentProducts = document.querySelector('#nbRecentProducts');
const spanPercentile50 = document.querySelector('#percentile50');
const spanPercentile90 = document.querySelector('#percentile90');
const spanPercentile95 = document.querySelector('#percentile95');
const spanLastReleasedDate = document.querySelector('#lastReleasedDate');
const spanNbSearchProducts = document.querySelector('#nbSearchProducts');
const sectionSearchProducts = document.querySelector('#searchProducts');
const spanNbFavoriteProducts = document.querySelector('#nbFavoriteProducts');
const sectionFavoriteProducts = document.querySelector('#favoriteProducts');


// Fetch


const fetchProducts = async (display, pageNum, make, cost, duration, orderBy) => {
  try {
    let endpoint = 'https://clear-fashion-delta-vert.vercel.app/products/search?show=${display}&page=${pageNum}';
    if (make && make != 'No') {
    endpoint += '&brand=${make}';
    }
    if (cost && cost != 'No') {
    endpoint += '&price=${cost}';
    }
    if (duration && duration != 'No') {
    endpoint += '&days=${duration}';
    }
    if (orderBy) {
    endpoint += '&sort=${orderBy}';
    }

    const res = await fetch(endpoint);
    const content = await res.json();
    
    console.log("ylg", content)
    
    const presentPage = content.currentPage;
    const totalPageNum = content.totalPages;
    spanNbSearchProducts.innerHTML = content.totalCount + ' products found';
    const choices = Array.from(
      {'length': totalPageNum},
      (val, idx) => `<option value="${idx + 1}">${idx + 1}</option>`
    ).join('');
    selectPage.innerHTML = choices;
    selectPage.selectedIndex = presentPage - 1;
    return content.data;
  } catch (err) {
    console.error(err);
    return currentProducts;
  }
};

const fetchAllProducts = async () => {
  try {
    const res = await fetch(
    'https://clear-fashion-delta-vert.vercel.app/products'
    );
    const content = await res.json();
    return content;
  } catch (err) {
    console.error(err);
    return currentProducts;
  }
};

const fetchBrands = async () => {
  try {
    const res = await fetch(
      `https://clear-fashion-delta-vert.vercel.app/brands`
    );
    const content = await res.json();
    return content;
  } catch (err) {
    console.error(err);
    return currentProducts;
  }
};


// Favoris


async function changeFavorite(productId) {
  if (favorite_products.find(element => element._id === productId)) {
    favorite_products = favorite_products.filter(item => item._id !== productId);
  }
  else {
    favorite_products.push(currentProducts.find(element => element._id === productId));
  }
  document.getElementById(productId).getElementsByTagName('button')[0].innerText = textFavorite(productId);
  renderFavoriteProducts();
}

function textFavorite(productId) {
  let favText = "";
  if (favorite_products.find(element => element._id === productId)) {
    favText = "Remove favorite";
  }
  else {
    favText = "Add favorite";
  }
  return favText;
}


//Render


const renderSearchProducts = items => {
  currentProducts = items;
  const tmpl = items
    .map(item => {
      return `
      <div class="product" id=${item._id}>
        <img class="productPhoto" src="${item.photo}">
        <span>${item.brand}</span>
        <a href="${item.url}" target="_blank">${item.name}</a>
        <span>${item.price}€</span>
        <span>${new Date(item.date).toLocaleDateString()}</span>
        <button onclick="changeFavorite('${item._id}')">${textFavorite(item._id)}</button>
      </div>
    `;
    })
    .join('');

  sectionSearchProducts.innerHTML = tmpl;
};

const renderFavoriteProducts = items => {
  const tmpl = favorite_products
    .map(item => {
      return `
      <div class="product" id=${item._id}>
        <img class="productPhoto" src="${item.photo}">
        <span>${item.brand}</span>
        <a href="${item.url}" target="_blank">${item.name}</a>
        <span>${item.price}€</span>
        <span>${new Date(item.date).toLocaleDateString()}</span>
        <button onclick="changeFavorite('${item._id}')">${textFavorite(item._id)}</button>
      </div>
    `;
    })
    .join('');
  
  spanNbFavoriteProducts.innerHTML = favorite_products.length + (favorite_products.length > 1 ? ' favorite products' : ' favorite product');
  sectionFavoriteProducts.innerHTML = tmpl;
};


// Listeners


selectShow.addEventListener('change', async (evt) => {
  show = evt.target.value;
  page = 1;
  let items = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(items);
});

selectPage.addEventListener('change', async (evt) => {
  page = evt.target.value;
  let items = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(items);
});

selectBrand.addEventListener('change', async (evt) => {
  brand = evt.target.value;
  page = 1;
  let items = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(items);
});

selectPrice.addEventListener('change', async (evt) => {
  price = evt.target.value;
  page = 1;
  let items = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(items);
});

selectDays.addEventListener('change', async (evt) => {
  days = evt.target.value;
  page = 1;
  let items = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(items);
});

selectSort.addEventListener('change', async (evt) => {
  sort = evt.target.value;
  page = 1;
  let items = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(items);
});


// Main


const quantile = (array, q) => {
  const sortedArr = array.sort((a, b) => a - b);
  const position = (sortedArr.length - 1) * q;
  const baseIndex = Math.floor(position);
  const remainder = position - baseIndex;
  if (sortedArr[baseIndex + 1] !== undefined) {
      return sortedArr[baseIndex] + remainder * (sortedArr[baseIndex + 1] - sortedArr[baseIndex]);
  } else {
      return sortedArr[baseIndex];
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const brandList = await fetchBrands();
  spanNbBrands.innerHTML = brandList.length;
  
  brandList.unshift("No");
  const brands = Array.from(
    brandList,
    value => `<option value="${value}">${value}</option>`
  ).join('');
  
  selectBrand.innerHTML = brands;
  
  let items = await fetchProducts();
  renderSearchProducts(items);

  const allItems = await fetchAllProducts();
  spanNbProducts.innerHTML = allItems.length;
  spanNbRecentProducts.innerHTML = allItems.filter(item => (current_date - new Date(item.date)) / (1000 * 60 * 60 * 24) <= 14).length;
  
  let itemPrices = [];
  let latestReleaseDate= new Date(allItems[0].date);
  for (let itemId in allItems) {
    itemPrices.push(allItems[itemId].price);
    if (new Date(allItems[itemId].date) > latestReleaseDate) {
      latestReleaseDate = new Date(allItems[itemId].date);
    }
  }
  spanPercentile50.innerHTML = Math.round(quantile(itemPrices, 0.50));
  spanPercentile90.innerHTML = Math.round(quantile(itemPrices, 0.90));
  spanPercentile95.innerHTML = Math.round(quantile(itemPrices, 0.95));
  spanLastReleasedDate.innerHTML = latestReleaseDate.toLocaleDateString();
});