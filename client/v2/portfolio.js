// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-delta-vert.vercel.app/
Search for specific products
This endpoint accepts the following optional query string parameters:
- `page` - page of products to return
- `size` - number of products to return
GET https://clear-fashion-delta-vert.vercel.app/brands
Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};
let brand = "No";
let reasonable = "No";
let recent = "No";
let sort = "price-asc";
let favorite = "No";
let favorite_products = [];
const current_date = Date.now();

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const selectReasonable = document.querySelector('#reasonable-select');
const selectRecent = document.querySelector('#recent-select');
const selectSort = document.querySelector('#sort-select');
const selectFavorite = document.querySelector('#favorite-select');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbBrands = document.querySelector('#nbBrands');
const spanNbRecentProducts = document.querySelector('#nbRecentProducts');
const spanPercentile50 = document.querySelector('#percentile50');
const spanPercentile90 = document.querySelector('#percentile90');
const spanPercentile95 = document.querySelector('#percentile95');
const spanLastReleasedDate = document.querySelector('#lastReleasedDate');
const sectionProducts = document.querySelector('#products');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-delta-vert.vercel.app/products/search`
      //`https://clear-fashion-delta-vert.vercel.app?page=${page}&size=${size}`
      //`https://clear-fashion-api.vercel.app`
    );
    const body = await response.json();

    console.log("fetched product", body.result)
/*
    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
*/
    return body.result;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

const fetchBrands = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-delta-vert.vercel.app/brands`
    );
    const body = await response.json();
 /*
    if (body.success !== true) {
      console.error(body);
      console.log("erreur 1")
      return {currentProducts, currentPagination};
    }
*/

    return body.result;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

function changeFavorite(_id) {
  if (favorite_products.includes(_id)) {
    favorite_products = favorite_products.filter(item => !(item == _id));
  }
  else {
    favorite_products.push(_id);
  }

  const products = [];
  products.result = currentProducts;
  products.meta = currentPagination;

  if (brand != "No") {
    products.result = products.result.filter(product => product.brand == brand);
  }

  if (reasonable == "Yes") {
    products.result = products.result.filter(product => product.price <= 50);
  }

  if (recent == "Yes") {
    products.result = products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100);
  }

  if (sort == "price-asc") {
    products.result = products.result.sort(PriceAsc);
  }
  else if (sort == "price-desc") {
    products.result = products.result.sort(PriceDesc);
  }
  else if (sort == "date-asc") {
    products.result = products.result.sort(DateAsc);
  }
  else if (sort == "date-desc") {
    products.result = products.result.sort(DateDesc);
  }

  if (favorite == "Yes") {
    products.result = products.result.filter(product => favorite_products.includes(product._id));
  }

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
}

function textFavorite(_id) {
  let text = "";
  if (favorite_products.includes(_id)) {
    text = "Remove favorite";
  }
  else {
    text = "Add favorite";
  }
  return text;
}

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product._id}>
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank">${product.name}</a>
        <span>${product.price}€</span>
        <span>${new Date(product.date).toDateString()}</span>
        <button onclick="changeFavorite('${product._id}')">${textFavorite(product._id)}</button>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  
  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};

function PriceAsc(a, b) {
  return parseFloat(a.price) - parseFloat(b.price);
}

function PriceDesc(a, b) {
  return parseFloat(b.price) - parseFloat(a.price);
}

function DateAsc(a, b) {
  return new Date(b.date) - new Date(a.date);
}

function DateDesc(a, b) {
  return new Date(a.date) - new Date(b.date);
}

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  if (brand != "No") {
    products.result = products.result.filter(product => product.brand == brand);
  }

  if (reasonable == "Yes") {
    products.result = products.result.filter(product => product.price <= 50);
  }

  if (recent == "Yes") {
    products.result = products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100);
  }

  if (sort == "price-asc") {
    products.result = products.result.sort(PriceAsc);
  }
  else if (sort == "price-desc") {
    products.result = products.result.sort(PriceDesc);
  }
  else if (sort == "date-asc") {
    products.result = products.result.sort(DateAsc);
  }
  else if (sort == "date-desc") {
    products.result = products.result.sort(DateDesc);
  }

  if (favorite == "Yes") {
    products.result = products.result.filter(product => favorite_products.includes(product._id));
  }

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize);

  if (brand != "No") {
    products.result = products.result.filter(product => product.brand == brand);
  }

  if (reasonable == "Yes") {
    products.result = products.result.filter(product => product.price <= 50);
  }

  if (recent == "Yes") {
    products.result = products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100);
  }

  if (sort == "price-asc") {
    products.result = products.result.sort(PriceAsc);
  }
  else if (sort == "price-desc") {
    products.result = products.result.sort(PriceDesc);
  }
  else if (sort == "date-asc") {
    products.result = products.result.sort(DateAsc);
  }
  else if (sort == "date-desc") {
    products.result = products.result.sort(DateDesc);
  }

  if (favorite == "Yes") {
    products.result = products.result.filter(product => favorite_products.includes(product._id));
  }

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  if (event.target.value != "No") {
    products.result = products.result.filter(product => product.brand == event.target.value);
  }

  if (reasonable == "Yes") {
    products.result = products.result.filter(product => product.price <= 50);
  }

  if (recent == "Yes") {
    products.result = products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100);
  }

  if (sort == "price-asc") {
    products.result = products.result.sort(PriceAsc);
  }
  else if (sort == "price-desc") {
    products.result = products.result.sort(PriceDesc);
  }
  else if (sort == "date-asc") {
    products.result = products.result.sort(DateAsc);
  }
  else if (sort == "date-desc") {
    products.result = products.result.sort(DateDesc);
  }

  if (favorite == "Yes") {
    products.result = products.result.filter(product => favorite_products.includes(product._id));
  }

  brand = event.target.value;

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectReasonable.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
  
  if (event.target.value == "Yes") {
    products.result = products.result.filter(product => product.price <= 50);
  }

  if (recent == "Yes") {
    products.result = products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100);
  }

  if (brand != "No") {
    products.result = products.result.filter(product => product.brand == brand);
  }

  if (sort == "price-asc") {
    products.result = products.result.sort(PriceAsc);
  }
  else if (sort == "price-desc") {
    products.result = products.result.sort(PriceDesc);
  }
  else if (sort == "date-asc") {
    products.result = products.result.sort(DateAsc);
  }
  else if (sort == "date-desc") {
    products.result = products.result.sort(DateDesc);
  }

  if (favorite == "Yes") {
    products.result = products.result.filter(product => favorite_products.includes(product._id));
  }

  reasonable = event.target.value;

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectRecent.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
  
  if (event.target.value == "Yes") {
    products.result = products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100);
  }

  if (brand != "No") {
    products.result = products.result.filter(product => product.brand == brand);
  }

  if (reasonable == "Yes") {
    products.result = products.result.filter(product => product.price <= 50);
  }

  if (sort == "price-asc") {
    products.result = products.result.sort(PriceAsc);
  }
  else if (sort == "price-desc") {
    products.result = products.result.sort(PriceDesc);
  }
  else if (sort == "date-asc") {
    products.result = products.result.sort(DateAsc);
  }
  else if (sort == "date-desc") {
    products.result = products.result.sort(DateDesc);
  }

  if (favorite == "Yes") {
    products.result = products.result.filter(product => favorite_products.includes(product._id));
  }

  recent = event.target.value;

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectSort.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
  
  if (event.target.value == "price-asc") {
    products.result = products.result.sort(PriceAsc);
  }
  else if (event.target.value == "price-desc") {
    products.result = products.result.sort(PriceDesc);
  }
  else if (event.target.value == "date-asc") {
    products.result = products.result.sort(DateAsc);
  }
  else if (event.target.value == "date-desc") {
    products.result = products.result.sort(DateDesc);
  }

  if (brand != "No") {
    products.result = products.result.filter(product => product.brand == brand);
  }

  if (reasonable == "Yes") {
    products.result = products.result.filter(product => product.price <= 50);
  }

  if (recent == "Yes") {
    products.result = products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100);
  }

  if (favorite == "Yes") {
    products.result = products.result.filter(product => favorite_products.includes(product._id));
  }

  sort = event.target.value;

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectFavorite.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  if (event.target.value == "Yes") {
    products.result = products.result.filter(product => favorite_products.includes(product._id));
  }

  if (brand != "No") {
    products.result = products.result.filter(product => product.brand == brand);
  }

  if (reasonable == "Yes") {
    products.result = products.result.filter(product => product.price <= 50);
  }

  if (recent == "Yes") {
    products.result = products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100);
  }

  if (sort == "price-asc") {
    products.result = products.result.sort(PriceAsc);
  }
  else if (sort == "price-desc") {
    products.result = products.result.sort(PriceDesc);
  }
  else if (sort == "date-asc") {
    products.result = products.result.sort(DateAsc);
  }
  else if (sort == "date-desc") {
    products.result = products.result.sort(DateDesc);
  }

  favorite = event.target.value;

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

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
  
  const products = await fetchProducts();
  products = products.sort(PriceAsc);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);

  const all_products = await fetchProducts(1, currentPagination.count);
  spanNbRecentProducts.innerHTML = all_products.result.filter(product => (current_date - new Date(product.date)) / (1000 * 60 * 60 * 24) <= 100).length;
  
  let prices = [];
  let lastReleasedDate = new Date(all_products.result[0].date);
  for (let product_id in all_products.result) {
    prices.push(all_products.result[product_id].price);
    if (new Date(all_products.result[product_id].date) > new Date(lastReleasedDate)) {
      lastReleasedDate = new Date(all_products.result[product_id].date);
    }
  }
  spanPercentile50.innerHTML = Math.round(quantile(prices, 0.50));
  spanPercentile90.innerHTML = Math.round(quantile(prices, 0.90));
  spanPercentile95.innerHTML = Math.round(quantile(prices, 0.95));
  spanLastReleasedDate.innerHTML = lastReleasedDate.toDateString();
});