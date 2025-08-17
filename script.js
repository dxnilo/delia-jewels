(function() {
  const CATEGORIES = ["collares", "pulseras", "aretes", "anillos"];
  const STORAGE_KEY = "deliaJewelsCategorias";
  const CART_KEY = "deliaJewelsCart";

  // Listas por carpeta según tu organización
  const FILES_COLLARES = [
    "collares/WhatsApp Image 2025-08-16 at 6.30.56 PM (3).jpeg",
    "collares/WhatsApp Image 2025-08-16 at 6.30.56 PM (1).jpeg",
    "collares/WhatsApp Image 2025-08-16 at 6.30.55 PM (1).jpeg",
    "collares/WhatsApp Image 2025-08-16 at 6.30.54 PM (2).jpeg",
    "collares/WhatsApp Image 2025-08-16 at 6.30.54 PM (1).jpeg",
    "collares/WhatsApp Image 2025-08-16 at 6.30.53 PM (1).jpeg",
    "collares/WhatsApp Image 2025-08-16 at 6.30.52 PM (1).jpeg",
    "collares/WhatsApp Image 2025-08-16 at 6.30.51 PM (2).jpeg",
  ];
  const FILES_PULSERAS = [
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.58 PM (2).jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.58 PM (1).jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.58 PM.jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.57 PM (3).jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.57 PM (2).jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.57 PM (1).jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.57 PM.jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.56 PM.jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.55 PM (3).jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.55 PM (2).jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.54 PM (3).jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.54 PM.jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.53 PM.jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.52 PM.jpeg",
    "pulseras/WhatsApp Image 2025-08-16 at 6.30.51 PM.jpeg",
  ];
  const FILES_ARETES = [
    "aretes/WhatsApp Image 2025-08-16 at 6.30.59 PM (2).jpeg",
    "aretes/WhatsApp Image 2025-08-16 at 6.30.59 PM (1).jpeg",
    "aretes/WhatsApp Image 2025-08-16 at 6.30.59 PM.jpeg",
    "aretes/WhatsApp Image 2025-08-16 at 6.30.58 PM (3).jpeg",
    "aretes/WhatsApp Image 2025-08-16 at 6.30.56 PM (2).jpeg",
    "aretes/WhatsApp Image 2025-08-16 at 6.30.55 PM.jpeg",
  ];
  const FILES_ANILLOS = [
    "anillos/WhatsApp Image 2025-08-16 at 6.30.51 PM (1).jpeg",
  ];

  const FILES = [
    ...FILES_COLLARES,
    ...FILES_PULSERAS,
    ...FILES_ARETES,
    ...FILES_ANILLOS,
  ];

  // Precios de ejemplo por archivo (si no está, se genera)
  const prices = {};
  function getPrice(filename) {
    if (!prices[filename]) {
      const base = 30 + (Math.abs(hashString(filename)) % 70); // 30–99
      prices[filename] = roundTo(base * 1000, 100); // miles en COP aproximado
    }
    return prices[filename];
  }

  function roundTo(n, step) { return Math.round(n / step) * step; }
  function hashString(s) { let h = 0; for (let i=0; i<s.length; i++) { h = (h<<5)-h + s.charCodeAt(i); h|=0; } return h; }
  function formatCurrency(n) { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n); }

  // Estado
  let selectedFilter = "todos";
  let cart = loadCart();
  let searchQuery = "";

  const grid = document.getElementById("catalogoGrid");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");
  const cartBody = document.getElementById("cartBody");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");
  const clearCartBtn = document.getElementById("clearCart");
  const drawer = document.getElementById("cartDrawer");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const searchInput = document.getElementById("searchInput");
  // Checkout modal refs
  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutClose = document.getElementById("checkoutClose");
  const checkoutCancel = document.getElementById("checkoutCancel");
  const checkoutForm = document.getElementById("checkoutForm");
  const inputName = document.getElementById("checkoutName");
  const inputPhone = document.getElementById("checkoutPhone");
  const inputPostal = document.getElementById("checkoutPostal");
  const inputCountry = document.getElementById("checkoutCountry");
  const inputCity = document.getElementById("checkoutCity");
  const inputAddress = document.getElementById("checkoutAddress");
  const inputPayment = document.getElementById("checkoutPayment");
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Modal refs
  const productModal = document.getElementById("productModal");
  const productModalClose = document.getElementById("productModalClose");
  const modalImg = document.getElementById("modalImg");
  const modalBadge = document.getElementById("modalBadge");
  const modalTitle = document.getElementById("modalTitle");
  const modalPrice = document.getElementById("modalPrice");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const qtyInput = document.getElementById("qtyInput");
  const addToCartBtn = document.getElementById("addToCartBtn");

  // Detalle del producto actual
  let currentProduct = null; // { file, category, price }

  function setBodyFlag(flag, isOn) {
    document.body.classList.toggle(flag, !!isOn);
    updateUiBlockingState();
  }
  function updateUiBlockingState() {
    const c = document.body.classList;
    const blocking = c.contains("modal-open") || c.contains("drawer-open") || c.contains("checkout-open");
    document.body.classList.toggle("ui-blocking", blocking);
  }

  function getQtyValue() {
    const n = parseInt(qtyInput.value || "1", 10);
    return isNaN(n) ? 1 : Math.max(1, n);
  }
  function updateModalSubtotal() {
    if (!currentProduct) return;
    const qty = getQtyValue();
    const subtotal = currentProduct.price * qty;
    modalPrice.textContent = formatCurrency(subtotal);
  }

  // Persistencia de categorías por archivo
  function loadMapping() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const currentKeys = new Set(FILES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedKeys = Object.keys(parsed);
        const same = savedKeys.length === FILES.length && savedKeys.every(k => currentKeys.has(k));
        if (same) return parsed;
      } catch(_) {}
    }
    // Inicial por carpeta
    const mapping = {};
    FILES_COLLARES.forEach(f => mapping[f] = "collares");
    FILES_PULSERAS.forEach(f => mapping[f] = "pulseras");
    FILES_ARETES.forEach(f => mapping[f] = "aretes");
    FILES_ANILLOS.forEach(f => mapping[f] = "anillos");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
    return mapping;
  }

  function saveMapping(mapping) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
  }

  function loadCart() {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) { try { return JSON.parse(saved); } catch(_) {} }
    return [];
  }
  function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  let fileToCategory = loadMapping();

  // Render catálogo
  function render() {
    grid.innerHTML = "";

    let rendered = 0;
    FILES.forEach((file) => {
      const category = fileToCategory[file] || guessCategoryFromPath(file);
      if (selectedFilter !== "todos" && selectedFilter !== category) return;
      if (!matchesSearch(file, category, searchQuery)) return;

      const card = document.createElement("article");
      card.className = "card";
      card.setAttribute("role", "listitem");

      const img = document.createElement("img");
      img.src = file;
      img.alt = `Pieza de joyería Delia Jewels — ${category}`;
      img.loading = "lazy";

      const badge = document.createElement("div");
      badge.className = "badge";
      badge.textContent = prettyCategory(category);

      card.appendChild(img);
      card.appendChild(badge);

      // Apertura de modal al click en tarjeta
      card.addEventListener("click", () => {
        openProductModal({ file, category, price: getPrice(file) });
      });

      grid.appendChild(card);
      rendered++;
    });

    if (rendered === 0) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "No hay resultados para tu búsqueda.";
      grid.appendChild(empty);
    }
  }

  function prettyCategory(key) {
    switch(key) {
      case "collares": return "Collares";
      case "pulseras": return "Pulseras";
      case "aretes": return "Aretes";
      case "anillos": return "Anillos";
      default: return key;
    }
  }
  function guessCategoryFromPath(path) {
    if (path.startsWith("collares/")) return "collares";
    if (path.startsWith("pulseras/")) return "pulseras";
    if (path.startsWith("aretes/")) return "aretes";
    if (path.startsWith("anillos/")) return "anillos";
    return "collares";
  }

  function matchesSearch(file, category, query) {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    const name = `Pieza ${prettyCategory(category)}`.toLowerCase();
    const fileName = file.toLowerCase();
    return name.includes(q) || fileName.includes(q) || prettyCategory(category).toLowerCase().includes(q);
  }

  // Modal de producto
  function openProductModal(product) {
    currentProduct = product;
    modalImg.src = product.file;
    modalImg.alt = `Producto Delia Jewels — ${prettyCategory(product.category)}`;
    modalBadge.textContent = prettyCategory(product.category);
    modalTitle.textContent = `Pieza artesanal (${prettyCategory(product.category)})`;
    modalPrice.textContent = formatCurrency(product.price);
    qtyInput.value = "1";

    productModal.setAttribute("aria-hidden", "false");
    setBodyFlag("modal-open", true);
    updateModalSubtotal();
  }
  function closeProductModal() {
    productModal.setAttribute("aria-hidden", "true");
    setBodyFlag("modal-open", false);
  }

  productModal.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof Element && (target.dataset.close === "modal")) {
      closeProductModal();
    }
  });
  productModalClose.addEventListener("click", closeProductModal);

  qtyMinus.addEventListener("click", () => {
    const val = Math.max(1, parseInt(qtyInput.value || "1", 10) - 1);
    qtyInput.value = String(val);
    updateModalSubtotal();
  });
  qtyPlus.addEventListener("click", () => {
    const val = Math.max(1, parseInt(qtyInput.value || "1", 10) + 1);
    qtyInput.value = String(val);
    updateModalSubtotal();
  });
  qtyInput.addEventListener("input", () => {
    // Sanitiza en tiempo real
    const val = getQtyValue();
    qtyInput.value = String(val);
    updateModalSubtotal();
  });

  addToCartBtn.addEventListener("click", () => {
    const qty = Math.max(1, parseInt(qtyInput.value || "1", 10));
    if (!currentProduct) return;
    addToCart(currentProduct, qty);
    closeProductModal();
    openCart();
  });

  // Carrito
  function addToCart(product, quantity) {
    const id = product.file;
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id, file: product.file, category: product.category, price: product.price, quantity });
    }
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  }

  function updateQuantity(id, nextQty) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity = Math.max(1, nextQty);
    saveCart();
    renderCart();
  }

  function emptyCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function renderCart() {
    cartBody.innerHTML = "";
    let total = 0;
    cart.forEach((item) => {
      const line = item.price * item.quantity;
      total += line;

      const row = document.createElement("div");
      row.className = "cart-item";

      const img = document.createElement("img");
      img.src = item.file;
      img.alt = `Producto en carrito — ${prettyCategory(item.category)}`;

      const info = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = `Pieza (${prettyCategory(item.category)})`;
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = formatCurrency(item.price);
      info.appendChild(title);
      info.appendChild(meta);

      const controls = document.createElement("div");
      controls.className = "row";

      const qty = document.createElement("div");
      qty.className = "qty";
      const minus = document.createElement("button");
      minus.className = "btn btn-ghost btn-icon";
      minus.textContent = "−";
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.value = String(item.quantity);
      input.className = "qty-input";
      const plus = document.createElement("button");
      plus.className = "btn btn-ghost btn-icon";
      plus.textContent = "＋";

      minus.addEventListener("click", () => updateQuantity(item.id, item.quantity - 1));
      plus.addEventListener("click", () => updateQuantity(item.id, item.quantity + 1));
      input.addEventListener("change", () => updateQuantity(item.id, parseInt(input.value || "1", 10)));

      qty.appendChild(minus); qty.appendChild(input); qty.appendChild(plus);

      const price = document.createElement("div");
      price.className = "price";
      price.textContent = formatCurrency(line);

      const removeBtn = document.createElement("button");
      removeBtn.className = "cart-remove";
      removeBtn.textContent = "Eliminar";
      removeBtn.addEventListener("click", () => removeFromCart(item.id));

      controls.appendChild(qty);
      controls.appendChild(price);
      controls.appendChild(removeBtn);

      row.appendChild(img);
      row.appendChild(info);
      row.appendChild(controls);

      cartBody.appendChild(row);
    });

    cartTotal.textContent = formatCurrency(total);
    cartCount.textContent = String(cart.reduce((n, i) => n + i.quantity, 0));
  }

  function buildWhatsAppMessage(cartItems, total) {
    let lines = [
      "Hola Delia Jewels, quiero hacer este pedido:",
      "",
    ];
    cartItems.forEach((i, idx) => {
      lines.push(`${idx+1}. Pieza ${prettyCategory(i.category)} × ${i.quantity} — ${formatCurrency(i.price * i.quantity)}`);
    });
    lines.push("", `Total: ${formatCurrency(total)}`);
    return lines.join("\n");
  }

  function buildCheckoutMessage(details, cartItems, total) {
    const header = [
      `Nombre: ${details.name}`,
      `Teléfono: ${details.phone}`,
      `País: ${details.country}`,
      `Ciudad: ${details.city}`,
      `Dirección: ${details.address}`,
      `Código postal: ${details.postal}`,
      `Método de pago: ${details.payment}`,
      "",
    ];
    return header.join("\n") + buildWhatsAppMessage(cartItems, total);
  }

  function openCheckout() {
    checkoutModal.setAttribute("aria-hidden", "false");
    setBodyFlag("checkout-open", true);
  }
  function closeCheckout() {
    checkoutModal.setAttribute("aria-hidden", "true");
    setBodyFlag("checkout-open", false);
  }

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) { openCart(); return; }
    openCheckout();
  });
  checkoutClose.addEventListener("click", closeCheckout);
  checkoutCancel.addEventListener("click", closeCheckout);
  checkoutModal.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof Element && target.dataset.close === "checkout") closeCheckout();
  });

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const details = {
      name: inputName.value.trim(),
      phone: inputPhone.value.trim(),
      postal: inputPostal.value.trim(),
      country: inputCountry.value.trim(),
      city: inputCity.value.trim(),
      address: inputAddress.value.trim(),
      payment: inputPayment.value,
    };
    // Validación mínima
    if (!details.name || !details.phone || !details.postal || !details.country || !details.city || !details.address || !details.payment) {
      alert("Por favor completa todos los campos.");
      return;
    }
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const message = buildCheckoutMessage(details, cart, total);
    const phone = "57XXXXXXXXXX"; // Reemplaza por tu número
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });

  function openCart() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    drawerOverlay.classList.add("is-open");
    setBodyFlag("drawer-open", true);
  }
  function closeCart() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    drawerOverlay.classList.remove("is-open");
    setBodyFlag("drawer-open", false);
  }

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  drawerOverlay.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof Element && target.dataset.close === "drawer") {
      closeCart();
    }
  });
  clearCartBtn.addEventListener("click", emptyCart);

  // Cerrar drawer con scroll rápido hacia abajo en móvil
  let lastY = 0;
  window.addEventListener("touchstart", (e) => { lastY = e.touches[0]?.clientY || 0; }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    const currentY = e.touches[0]?.clientY || 0;
    const dy = currentY - lastY;
    if (dy < -35 && drawer.classList.contains("is-open")) {
      // swipe rápido hacia arriba (scroll hacia abajo contenido)
      closeCart();
    }
  }, { passive: true });

  // Filtros
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedFilter = btn.dataset.filter || "todos";
      render();
    });
  });

  // Búsqueda
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value || "";
    render();
  });

  // Inicialización
  render();
  renderCart();

  // Enlaces sociales flotantes
  const phoneFloat = "57XXXXXXXXXX"; // Reemplaza por tu número si quieres usar otro
  const waUniverse = document.getElementById("waUniverse");
  const igUniverse = document.getElementById("igUniverse");
  const fbUniverse = document.getElementById("fbUniverse");
  if (waUniverse) waUniverse.href = `https://wa.me/${phoneFloat}`;
  if (igUniverse) igUniverse.href = "https://instagram.com/tu_usuario"; // TODO: cambia por el tuyo
  if (fbUniverse) fbUniverse.href = "https://facebook.com/tu_pagina"; // TODO: cambia por el tuyo
})(); 