// Activation du mode strict https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

let presentProducts = [];
let display = 12;
let pageNumber = 1;
let brandFilter = 'No';
let priceFilter = 'No';
let daysFilter = 'No';
let sortOrder = 'Cheapest';
let favoriteItems = [];
const currentDate = Date.now();

// Selecteurs
const selectDisplay = document.querySelector('#show-select');
const selectPageNumber = document.querySelector('#page-select');
const selectBrandFilter = document.querySelector('#brand-select');
const selectPriceFilter = document.querySelector('#price-select');
const selectDaysFilter = document.querySelector('#days-select');
const selectSortOrder = document.querySelector('#sort-select');
const spanTotalProducts = document.querySelector('#nbProducts');
const spanTotalBrands = document.querySelector('#nbBrands');
const spanTotalRecentProducts = document.querySelector('#nbRecentProducts');
const spanQuantile50 = document.querySelector('#percentile50');
const spanQuantile90 = document.querySelector('#percentile90');
const spanQuantile95 = document.querySelector('#percentile95');
const spanLatestReleasedDate = document.querySelector('#lastReleasedDate');
const spanTotalSearchProducts = document.querySelector('#nbSearchProducts');
const sectionSearchedProducts = document.querySelector('#searchProducts');
const spanTotalFavoriteProducts = document.querySelector('#nbFavoriteProducts');
const sectionFavProducts = document.querySelector('#favoriteProducts');

// Appel API

const retrieveProducts = async (display, pageNumber, brandFilter, priceFilter, daysFilter, sortOrder) => {
  try {
    let url = `https://clear-fashion-delta-vert.vercel.app/products/search?show=${display}&page=${pageNumber}`;
    if (brandFilter && brandFilter != 'No') {
      url += `&brand=${brandFilter}`;
    }
    if (priceFilter && priceFilter != 'No') {
      url += `&price=${priceFilter}`;
    }
    if (daysFilter && daysFilter != 'No') {
      url += `&days=${daysFilter}`;
    }
    if (sortOrder) {
      url += `&sort=${sortOrder}`;
    }

    const response = await fetch(url);
    const body = await response.json();

    console.log("ylg", body)

    const currentPage = body.currentPage;
    const totalPages = body.totalPages;
    spanTotalSearchProducts.innerHTML = body.totalCount + ' produits trouvés';
    const options = Array.from(
      {'length': totalPages},
      (value, index) => `<option value="${index + 1}">${index + 1}</option>`
    ).join('');
    selectPageNumber.innerHTML = options;
    selectPageNumber.selectedIndex = currentPage - 1;
    return body.data;
  } catch (error) {
    console.error(error);
    return presentProducts;
  }
};

const retrieveAllProducts = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-delta-vert.vercel.app/products`
    );
    const body = await response.json();
    return body;
  } catch (error) {
    console.error(error);
    return presentProducts;
  }
};

const retrieveBrands = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-delta-vert.vercel.app/brands`
    );
    const body = await response.json();
    return body;
  } catch (error) {
    console.error(error);
    return presentProducts;
  }
};


// Favoris

async function modifyFavorite(id) {
  if (favoriteItems.find(element => element._id === id)) {
    favoriteItems = favoriteItems.filter(item => item._id !== id);
  }
  else {
    favoriteItems.push(presentProducts.find(element => element._id === id));
  }
  document.getElementById(id).getElementsByTagName('button')[0].innerText = favoriteText(id);
  displayFavoriteProducts();
}

function favoriteText(id) {
  let text = "";
  if (favoriteItems.find(element => element._id === id)) {
  text = "Retirer des favoris";
  }
  else {
  text = "Ajouter aux favoris";
  }
  return text;
}
  
  // Affichage
  
  const displaySearchedProducts = products => {
  presentProducts = products;
  const template = products
  .map(product => {
  return `<div class="product" id=${product._id}> <img class="productPhoto" src="${product.photo}"> <span>${product.brand}</span> <a href="${product.url}" target="_blank">${product.name}</a> <span>${product.price}€</span> <span>${new Date(product.date).toLocaleDateString()}</span> <button onclick="modifyFavorite('${product._id}')">${favoriteText(product._id)}</button> </div> `;
  })
  .join('');
  
  sectionSearchedProducts.innerHTML = template;
  };
  
  const displayFavoriteProducts = products => {
  const template = favoriteItems
  .map(product => {
  return `<div class="product" id=${product._id}> <img class="productPhoto" src="${product.photo}"> <span>${product.brand}</span> <a href="${product.url}" target="_blank">${product.name}</a> <span>${product.price}€</span> <span>${new Date(product.date).toLocaleDateString()}</span> <button onclick="modifyFavorite('${product._id}')">${favoriteText(product._id)}</button> </div> `;
  })
  .join('');
  
  spanTotalFavoriteProducts.innerHTML = favoriteItems.length + (favoriteItems.length > 1 ? ' produits favoris' : ' produit favori');
  sectionFavProducts.innerHTML = template;
  };
  
  // Ecouteurs d'événements
  
  selectDisplay.addEventListener('change', async (event) => {
  display = event.target.value;
  pageNumber = 1;
  let products = await retrieveProducts(display=display, pageNumber=pageNumber, brandFilter=brandFilter, priceFilter=priceFilter, daysFilter=daysFilter, sortOrder=sortOrder)
  displaySearchedProducts(products);
  });
  
  selectPageNumber.addEventListener('change', async (event) => {
  pageNumber = event.target.value;
  let products = await retrieveProducts(display=display, pageNumber=pageNumber, brandFilter=brandFilter, priceFilter=priceFilter, daysFilter=daysFilter, sortOrder=sortOrder)
  displaySearchedProducts(products);
  });
  
  selectBrandFilter.addEventListener('change', async (event) => {
  brandFilter = event.target.value;
  pageNumber = 1;
  let products = await retrieveProducts(display=display, pageNumber=pageNumber, brandFilter=brandFilter, priceFilter=priceFilter, daysFilter=daysFilter, sortOrder=sortOrder)
  displaySearchedProducts(products);
  });
  
  selectPriceFilter.addEventListener('change', async (event) => {
  priceFilter = event.target.value;
  pageNumber = 1;
  let products = await retrieveProducts(display=display, pageNumber=pageNumber, brandFilter=brandFilter, priceFilter=priceFilter, daysFilter=daysFilter, sortOrder=sortOrder)
  displaySearchedProducts(products);
  });

  selectDaysFilter.addEventListener('change', async (event) => {
    daysFilter = event.target.value;
    pageNumber = 1;
    let products = await retrieveProducts(display=display, pageNumber=pageNumber, brandFilter=brandFilter, priceFilter=priceFilter, daysFilter=daysFilter, sortOrder=sortOrder)
    displaySearchedProducts(products);
});

selectSortOrder.addEventListener('change', async (event) => {
  sortOrder = event.target.value;
  pageNumber = 1;
  let products = await retrieveProducts(display=display, pageNumber=pageNumber, brandFilter=brandFilter, priceFilter=priceFilter, daysFilter=daysFilter, sortOrder=sortOrder)
  displaySearchedProducts(products);
  });
  
  // Fonction principale
  
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
  const brandNames = await getBrands();
  spanTotalBrands.innerHTML = brandNames.length;
  
  brandNames.unshift("Aucun");
  const brands = Array.from(
  brandNames,
  value => <option value="${value}">${value}</option>
  ).join('');
  
  selectBrandFilter.innerHTML = brands;
  
  let products = await retrieveProducts();
  displaySearchedProducts(products);
  
  const allProducts = await getAllProducts();
  spanTotalProducts.innerHTML = allProducts.length;
  spanTotalRecentProducts.innerHTML = allProducts.filter(product => (currentDate - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 14).length;
  
  let prices = [];
  let mostRecentReleaseDate = new Date(allProducts[0].date);
  for (let productId in allProducts) {
  prices.push(allProducts[productId].price);
  if (new Date(allProducts[productId].date) > mostRecentReleaseDate) {
  mostRecentReleaseDate = new Date(allProducts[productId].date);
  }
  }
  spanPercentile50.innerHTML = Math.round(quantile(prices, 0.50));
  spanPercentile90.innerHTML = Math.round(quantile(prices, 0.90));
  spanPercentile95.innerHTML = Math.round(quantile(prices, 0.95));
  spanMostRecentReleaseDate.innerHTML = mostRecentReleaseDate.toLocaleDateString();
  });