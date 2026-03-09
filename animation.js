const PRODUCTS_PER_CYCLE = 1;

let PRODUCTS = [];
let currentBatch = 0;

async function loadProducts() {
  try {
    const response = await fetch('./products.json');
    const data = await response.json();
    PRODUCTS = data.products || [];
  } catch (error) {
    console.error('Failed to load products.json:', error);
    PRODUCTS = [];
  }

  if(PRODUCTS.length > 0) {
    initScene();
    startCycle();
  }
}

function initScene() {
  // Constant ambient animation for the background X
  gsap.to('#brand-x, #brand-x-blur', {
    rotation: 5,
    scale: 1.05,
    duration: 20,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // Ambient pan on the background to make it feel alive
  gsap.to('#background', {
    scale: 1.1,
    x: -20,
    y: 10,
    duration: 30,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

function getBatch(batchIndex) {
  const start = (batchIndex * PRODUCTS_PER_CYCLE) % Math.max(PRODUCTS.length, 1);
  const batch = [];
  for (let i = 0; i < PRODUCTS_PER_CYCLE; i++) {
    if (PRODUCTS.length > 0) {
      batch.push(PRODUCTS[(start + i) % PRODUCTS.length]);
    }
  }
  return batch;
}

function renderBatch(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  products.forEach((product, index) => {
    const productEl = document.createElement('div');
    productEl.className = 'product';
    productEl.dataset.index = index;

    // Use discounted price if available and > 0, else just base price without discount
    const hasDiscount = product.discounted_price && product.discounted_price > 0 && product.discounted_price < parseFloat(product.price);

    let priceHTML = '';
    if (hasDiscount) {
      priceHTML = `
        <div class="product-pricing">
          <div class="original-price">$${parseFloat(product.price).toFixed(2)}</div>
          <div class="discounted-price">$${parseFloat(product.discounted_price).toFixed(2)}</div>
        </div>
      `;
    } else {
      priceHTML = `
        <div class="product-pricing">
          <div class="discounted-price">$${parseFloat(product.price).toFixed(2)}</div>
        </div>
      `;
    }

    productEl.innerHTML = `
      <div class="product-image-container">
        <img class="product-image" src="${product.image_url}" alt="${product.name}">
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand || 'MPX NJ'}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-strain">${product.strain || ''}</div>
        ${priceHTML}
      </div>
    `;

    container.appendChild(productEl);
  });
}

function animateCycle(batchIndex) {
  const batch = getBatch(batchIndex);
  renderBatch(batch);

  const productEls = document.querySelectorAll('.product');
  const imageContainers = document.querySelectorAll('.product-image');
  const brands = document.querySelectorAll('.product-brand');
  const names = document.querySelectorAll('.product-name');
  const strains = document.querySelectorAll('.product-strain');
  const originalPrices = document.querySelectorAll('.original-price');
  const discountedPrices = document.querySelectorAll('.discounted-price');

  // SplitText for names
  const splitNames = new SplitText(names, {type: "words,chars"});

  const tl = gsap.timeline({
    onComplete: () => {
      splitNames.revert();
      animateCycle(batchIndex + 1);
    }
  });

  // Reset opacity
  gsap.set(productEls, { opacity: 1 });
  gsap.set([brands, strains, originalPrices, discountedPrices], { opacity: 0 });
  gsap.set(imageContainers, { scale: 0.8, opacity: 0, y: 50, rotation: -5 });
  gsap.set(splitNames.chars, { opacity: 0, y: 20 });

  // Phase 1: Entrance
  tl.to(imageContainers, {
    scale: 1,
    opacity: 1,
    y: 0,
    rotation: 0,
    duration: 2.5,
    ease: "power3.out",
    stagger: 0.2
  }, 0)
  // Continuous slow rotation for the object worship feel
  .to(imageContainers, {
    y: -20,
    rotation: 2,
    duration: 4,
    ease: "sine.inOut",
    yoyo: true,
    repeat: 1
  }, 1)

  // Text entrance
  .to(brands, { opacity: 1, y: -10, duration: 1, ease: "power2.out" }, 1)
  .to(splitNames.chars, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.02,
    ease: "power3.out"
  }, 1.2)
  .to(strains, { opacity: 1, x: 10, duration: 1, ease: "power2.out" }, 1.5)

  // Pricing
  if(originalPrices.length > 0) {
    tl.to(originalPrices, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, 2)
      .to(discountedPrices, { opacity: 1, scale: 1.2, duration: 0.8, ease: "elastic.out(1, 0.5)" }, 2.5)
      .to(discountedPrices, { scale: 1, duration: 0.5, ease: "power2.out" }, 3.3);
  } else {
    tl.to(discountedPrices, { opacity: 1, scale: 1.2, duration: 0.8, ease: "elastic.out(1, 0.5)" }, 2)
      .to(discountedPrices, { scale: 1, duration: 0.5, ease: "power2.out" }, 2.8);
  }

  // Phase 2: Living Moment (just waiting for the sine ease above)

  // Phase 3: Exit
  tl.to(imageContainers, {
    opacity: 0,
    scale: 1.1,
    y: -50,
    duration: 1.5,
    ease: "power2.in"
  }, 7.5)
  .to([brands, splitNames.chars, strains, originalPrices, discountedPrices], {
    opacity: 0,
    y: -20,
    duration: 1,
    stagger: 0.05,
    ease: "power2.in"
  }, 7.5);
}

function startCycle() {
  animateCycle(0);
}

window.addEventListener('DOMContentLoaded', loadProducts);

