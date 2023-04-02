// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let show = 12;
let page = 1;
let brand = 'No';
let price = 'No';
let days = 'No';
let sort = 'Cheapest';
let favorite_products = [];
const current_date = Date.now();

// instantiate the selectors
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

/**
 * Fetch API
 */

//`https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
//`https://clear-fashion-delta-vert.vercel.app/products/search`

const fetchProducts = async (show, page, brand, price, days, sort) => {
  try {
    let url = `https://clear-fashion-delta-vert.vercel.app/products/search?show=${show}&page=${page}`;
    if (brand && brand != 'No') {
      url += `&brand=${brand}`;
    }
    if (price && price != 'No') {
      url += `&price=${price}`;
    }
    if (days && days != 'No') {
      url += `&days=${days}`;
    }
    if (sort) {
      url += `&sort=${sort}`;
    }
    
    const response = await fetch(url);
    const body = await response.json();

    const currentPage = body.currentPage;
    const totalPages = body.totalPages;
    spanNbSearchProducts.innerHTML = body.totalCount + ' products found';
    const options = Array.from(
      {'length': totalPages},
      (value, index) => `<option value="${index + 1}">${index + 1}</option>`
    ).join('');
    selectPage.innerHTML = options;
    selectPage.selectedIndex = currentPage - 1;
    return body.data;
  } catch (error) {
    console.error(error);
    return currentProducts;
  }
};

const fetchAllProducts = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-delta-vert.vercel.app/products`
    );
    const body = await response.json();
    return body;
  } catch (error) {
    console.error(error);
    return currentProducts;
  }
};

const fetchBrands = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-delta-vert.vercel.app/brands`
    );
    const body = await response.json();
    return body;
  } catch (error) {
    console.error(error);
    return currentProducts;
  }
};

/**
 * Favorite products
 */

async function changeFavorite(id) {
  if (favorite_products.find(element => element._id === id)) {
    favorite_products = favorite_products.filter(item => item._id !== id);
  }
  else {
    favorite_products.push(currentProducts.find(element => element._id === id));
  }
  document.getElementById(id).getElementsByTagName('button')[0].innerText = textFavorite(id);
  renderFavoriteProducts();
}

function textFavorite(id) {
  let text = "";
  if (favorite_products.find(element => element._id === id)) {
    text = "Remove favorite";
  }
  else {
    text = "Add favorite";
  }
  return text;
}

/**
 * Render list of products
 */

const renderSearchProducts = products => {
  currentProducts = products;
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product._id}>
        <img class="productPhoto" src="${product.photo}">
        <span>${product.brand}</span>
        <a href="${product.url}" target="_blank">${product.name}</a>
        <span>${product.price}€</span>
        <span>${new Date(product.date).toLocaleDateString()}</span>
        <button onclick="changeFavorite('${product._id}')">${textFavorite(product._id)}</button>
      </div>
    `;
    })
    .join('');

  sectionSearchProducts.innerHTML = template;
};

const renderFavoriteProducts = products => {
  const template = favorite_products
    .map(product => {
      return `
      <div class="product" id=${product._id}>
        <img class="productPhoto" src="${product.photo}">
        <span>${product.brand}</span>
        <a href="${product.url}" target="_blank">${product.name}</a>
        <span>${product.price}€</span>
        <span>${new Date(product.date).toLocaleDateString()}</span>
        <button onclick="changeFavorite('${product._id}')">${textFavorite(product._id)}</button>
      </div>
    `;
    })
    .join('');
  
  spanNbFavoriteProducts.innerHTML = favorite_products.length + (favorite_products.length > 1 ? ' favorite products' : ' favorite product');
  sectionFavoriteProducts.innerHTML = template;
};

/**
 * Declaration of all Listeners
 */

selectShow.addEventListener('change', async (event) => {
  show = event.target.value;
  page = 1;
  let products = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(products);
});

selectPage.addEventListener('change', async (event) => {
  page = event.target.value;
  let products = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(products);
});

selectBrand.addEventListener('change', async (event) => {
  brand = event.target.value;
  page = 1;
  let products = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(products);
});

selectPrice.addEventListener('change', async (event) => {
  price = event.target.value;
  page = 1;
  let products = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(products);
});

selectDays.addEventListener('change', async (event) => {
  days = event.target.value;
  page = 1;
  let products = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(products);
});

selectSort.addEventListener('change', async (event) => {
  sort = event.target.value;
  page = 1;
  let products = await fetchProducts(show=show, page=page, brand=brand, price=price, days=days, sort=sort)
  renderSearchProducts(products);
});

/**
 * Launched on page load
 */

const quantile = (arr, q) => {
  const sorted = arr.sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
      return sorted[base];
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const brand_names = await fetchBrands();
  spanNbBrands.innerHTML = brand_names.length;
  
  brand_names.unshift("No");
  const brands = Array.from(
    brand_names,
    value => `<option value="${value}">${value}</option>`
  ).join('');
  
  selectBrand.innerHTML = brands;
  
  let products = await fetchProducts();
  renderSearchProducts(products);

  const all_products = await fetchAllProducts();
  spanNbProducts.innerHTML = all_products.length;
  spanNbRecentProducts.innerHTML = all_products.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 14).length;
  
  let prices = [];
  let lastReleasedDate= new Date(all_products[0].date);
  for (let product_id in all_products) {
    prices.push(all_products[product_id].price);
    if (new Date(all_products[product_id].date) > lastReleasedDate) {
      lastReleasedDate = new Date(all_products[product_id].date);
    }
  }
  spanPercentile50.innerHTML = Math.round(quantile(prices, 0.50));
  spanPercentile90.innerHTML = Math.round(quantile(prices, 0.90));
  spanPercentile95.innerHTML = Math.round(quantile(prices, 0.95));
  spanLastReleasedDate.innerHTML = lastReleasedDate.toLocaleDateString();
});