
/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");

// Product search field for filtering by name/keyword
let productSearchInput = document.getElementById('productSearchInput');
if (!productSearchInput) {
  productSearchInput = document.createElement('input');
  productSearchInput.type = 'text';
  productSearchInput.id = 'productSearchInput';
  productSearchInput.placeholder = 'Search products by name or keyword...';
  productSearchInput.style.margin = '20px 0';
  productSearchInput.setAttribute('aria-label', 'Search products');
  categoryFilter.parentNode.insertBefore(productSearchInput, categoryFilter.nextSibling);
}

// RTL toggle button
let rtlToggle = document.getElementById('rtlToggle');
if (!rtlToggle) {
  rtlToggle = document.createElement('button');
  rtlToggle.id = 'rtlToggle';
  rtlToggle.textContent = 'Toggle RTL';
  rtlToggle.className = 'generate-btn';
  rtlToggle.style.margin = '10px 0';
  categoryFilter.parentNode.insertBefore(rtlToggle, productSearchInput.nextSibling);
}

// Store selected products in an array
let selectedProducts = [];

// Load selected products from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('selectedProducts');
  if (saved) {
    try {
      selectedProducts = JSON.parse(saved);
      updateSelectedProductsList();
    } catch (e) {
      selectedProducts = [];
    }
  }
  // Restore RTL mode if previously set
  if (localStorage.getItem('rtlMode') === 'true') {
    document.body.dir = 'rtl';
  } else {
    document.body.dir = 'ltr';
  }
});
// RTL toggle handler
rtlToggle.addEventListener('click', () => {
  const isRTL = document.body.dir === 'rtl';
  document.body.dir = isRTL ? 'ltr' : 'rtl';
  localStorage.setItem('rtlMode', !isRTL);
});

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  /* Create product cards with a Show Description button and a checkbox for selection */
  productsContainer.innerHTML = products
    .map(
      (product, idx) => `
    <div class="product-card">
      <input type="checkbox" class="select-product" data-idx="${idx}" id="select-${idx}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
        <button class="desc-btn" data-idx="${idx}" aria-expanded="false" aria-controls="desc-${idx}" tabindex="0">Show Description</button>
        <div class="product-desc" id="desc-${idx}" role="region" aria-live="polite" aria-hidden="true" style="display:none;">${product.description}</div>
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners to all description buttons
  const descButtons = document.querySelectorAll('.desc-btn');
  descButtons.forEach((btn) => {
    const idx = btn.getAttribute('data-idx');
    const descDiv = document.getElementById(`desc-${idx}`);

    // Toggle on click
    btn.addEventListener('click', function() {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      descDiv.setAttribute('aria-hidden', expanded);
      descDiv.style.display = expanded ? 'none' : 'block';
      btn.textContent = expanded ? 'Show Description' : 'Hide Description';
    });

    // Toggle on keyboard (Enter/Space)
    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });

    // Show description on hover/focus
    btn.addEventListener('mouseover', function() {
      descDiv.setAttribute('aria-hidden', false);
      descDiv.style.display = 'block';
    });
    btn.addEventListener('focus', function() {
      descDiv.setAttribute('aria-hidden', false);
      descDiv.style.display = 'block';
    });

    // Hide description on mouseout/blur if not expanded
    btn.addEventListener('mouseout', function() {
      if (btn.getAttribute('aria-expanded') === 'false') {
        descDiv.setAttribute('aria-hidden', true);
        descDiv.style.display = 'none';
      }
    });
    btn.addEventListener('blur', function() {
      if (btn.getAttribute('aria-expanded') === 'false') {
        descDiv.setAttribute('aria-hidden', true);
        descDiv.style.display = 'none';
      }
    });
  });

  // Add event listeners to all product checkboxes
  const checkboxes = document.querySelectorAll('.select-product');
  checkboxes.forEach((box) => {
    box.addEventListener('change', function() {
      const idx = parseInt(box.getAttribute('data-idx'));
      if (box.checked) {
        // Add product to selectedProducts
        selectedProducts.push(products[idx]);
      } else {
        // Remove product from selectedProducts
        selectedProducts = selectedProducts.filter(p => p.id !== products[idx].id);
      }
      updateSelectedProductsList();
    });
  });
  /* Each checkbox adds/removes product from selectedProducts array */
}

/* Show selected products in the Selected Products section */
function updateSelectedProductsList() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = '<p>No products selected.</p>';
    localStorage.setItem('selectedProducts', JSON.stringify([]));
    return;
  }
  // Save to localStorage
  localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));

  // Show each product with a remove button
  selectedProductsList.innerHTML = selectedProducts
    .map((product, i) => `
      <div>
        <strong>${product.name}</strong> (${product.brand})
        <button class="remove-product" data-idx="${i}" aria-label="Remove ${product.name}">Remove</button>
      </div>
    `)
    .join('');

  // Add Clear All button
  selectedProductsList.innerHTML += `<button id="clearAll" class="generate-btn" style="margin-top:10px;">Clear All</button>`;

  // Remove individual product
  document.querySelectorAll('.remove-product').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(btn.getAttribute('data-idx'));
      selectedProducts.splice(idx, 1);
      updateSelectedProductsList();
    });
  });

  // Clear all products
  document.getElementById('clearAll').addEventListener('click', function() {
    selectedProducts = [];
    updateSelectedProductsList();
  });
}
// --- Navigation Bar with Dropdown and Autoscroll ---
const navBar = document.createElement('nav');
navBar.className = 'site-navbar';
navBar.style.display = 'flex';
navBar.style.justifyContent = 'center';
navBar.style.alignItems = 'center';
navBar.style.background = '#000';
navBar.style.padding = '12px 0';
navBar.style.position = 'sticky';
navBar.style.top = '0';
navBar.style.zIndex = '100';

const menuBtn = document.createElement('button');
menuBtn.textContent = 'Menu ▾';
menuBtn.className = 'generate-btn';
menuBtn.style.background = '#C6A76B';
menuBtn.style.color = '#000';
menuBtn.style.marginRight = '16px';
menuBtn.setAttribute('aria-haspopup', 'true');
menuBtn.setAttribute('aria-expanded', 'false');

const dropdown = document.createElement('div');
dropdown.className = 'navbar-dropdown';
dropdown.style.display = 'none';
dropdown.style.position = 'absolute';
dropdown.style.background = '#fff';
dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
dropdown.style.borderRadius = '8px';
dropdown.style.top = '48px';
dropdown.style.left = '50%';
dropdown.style.transform = 'translateX(-50%)';
dropdown.style.minWidth = '220px';
dropdown.style.padding = '8px 0';
dropdown.style.zIndex = '101';

const sections = [
  { id: 'productsContainer', label: 'Products' },
  { id: 'selectedProductsList', label: 'Selected Products' },
  { id: 'chatWindow', label: 'Routine & Chat' },
  { id: 'productSearchInput', label: 'Product Search' },
  { id: 'rtlToggle', label: 'RTL Toggle' }
];

sections.forEach(section => {
  const btn = document.createElement('button');
  btn.textContent = section.label;
  btn.className = 'dropdown-item';
  btn.style.width = '100%';
  btn.style.padding = '12px';
  btn.style.background = 'none';
  btn.style.border = 'none';
  btn.style.textAlign = 'left';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '1rem';
  btn.addEventListener('click', () => {
    dropdown.style.display = 'none';
    menuBtn.setAttribute('aria-expanded', 'false');
    const el = document.getElementById(section.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  dropdown.appendChild(btn);
});

menuBtn.addEventListener('click', () => {
  const expanded = dropdown.style.display === 'block';
  dropdown.style.display = expanded ? 'none' : 'block';
  menuBtn.setAttribute('aria-expanded', !expanded);
});

navBar.appendChild(menuBtn);
navBar.appendChild(dropdown);
document.body.insertBefore(navBar, document.body.firstChild);

// --- Web Search Button ---
const webSearchBtn = document.createElement('button');
webSearchBtn.textContent = 'Web Search';
webSearchBtn.className = 'generate-btn';
webSearchBtn.style.background = '#C6A76B';
webSearchBtn.style.color = '#000';
webSearchBtn.style.marginLeft = '16px';
navBar.appendChild(webSearchBtn);

webSearchBtn.addEventListener('click', async () => {
  const query = prompt('Enter your web search query for L\'Oréal products or routines:');
  if (!query) return;
  chatWindow.innerHTML = '<div class="placeholder-message">Searching the web for current info...</div>';
  try {
    const response = await fetch('https://loreal.f8487199a4b359ba5ef0ed070a8273a5.workers.dev/web-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: query }],
        max_tokens: 500
      })
    });
    const data = await response.json();
    chatWindow.innerHTML = `<div>${data.choices && data.choices[0] ? data.choices[0].message.content : 'No results found.'}</div>`;
  } catch (error) {
    chatWindow.innerHTML = '<div class="placeholder-message">Web search failed.</div>';
  }
});


// Product search and category filter
let allProducts = [];
async function filterAndDisplayProducts() {
  if (allProducts.length === 0) {
    allProducts = await loadProducts();
  }
  const selectedCategory = categoryFilter.value;
  const searchTerm = productSearchInput.value.trim().toLowerCase();
  let filtered = allProducts;
  if (selectedCategory) {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }
  if (searchTerm) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm))
    );
  }
  displayProducts(filtered);
}

categoryFilter.addEventListener("change", filterAndDisplayProducts);
productSearchInput.addEventListener("input", filterAndDisplayProducts);

// Initial load
filterAndDisplayProducts();


/* Generate Routine button handler */
generateRoutineBtn.addEventListener('click', async () => {
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = '<div class="placeholder-message">Please select at least one product to generate a routine.</div>';
    return;
  }

  // Show loading message
  chatWindow.innerHTML = '<div class="placeholder-message">Generating your personalized routine...</div>';

  // Prepare data for OpenAI
  const productData = selectedProducts.map(p => ({
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: p.description
  }));

  // Create prompt for OpenAI
  const prompt = `You are a beauty expert. Create a personalized routine using ONLY the selected products below. For each step, clearly state which product to use, how and when to use it, and why it is important for the user's routine. Make sure your advice is specific and descriptive for each product, referencing its unique features and benefits from the description.\nSelected Products: ${JSON.stringify(productData, null, 2)}`;

  // Reset chat history for new routine
  chatHistory = [
    { role: 'system', content: `You are a helpful beauty expert. Only answer questions about the generated routine or topics like skincare, haircare, makeup, fragrance, and related areas. Always make your answers specific and relevant to the user's selected products and previous questions. Reference product features and benefits from the provided descriptions. If the user asks about a product, routine step, or ingredient, give a clear, detailed, and personalized answer based on their selections and context.` },
    { role: 'user', content: prompt }
  ];

  try {
    // Call Cloudflare Worker instead of OpenAI directly
    const response = await fetch('https://loreal.f8487199a4b359ba5ef0ed070a8273a5.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: chatHistory,
        max_tokens: 500
      })
    });
    const data = await response.json();
    // Add assistant's response to chat history
    chatHistory.push({ role: 'assistant', content: data.choices[0].message.content });
    // Display full chat history in chat window
    chatWindow.innerHTML = chatHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => `<div class="${msg.role}"><strong>${msg.role === 'user' ? 'You' : 'Expert'}:</strong> ${msg.content}</div>`)
      .join('');
  } catch (error) {
    chatWindow.innerHTML = '<div class="placeholder-message">Sorry, there was an error generating your routine.</div>';
  }
});
