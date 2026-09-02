
function getBookPageUrl(bookId) {
  const map = {
    'pack-b1-telc-2026': 'pack-b1-telc.html',
    'pack-goethe-osd-b1-b2': 'pack-goethe-osd.html',
    'pack-b2-telc-complet': 'pack-b2-telc.html',
    'telc-b1-sprechen-solo': 'telc-b1-sprechen.html',
    'telc-b2-sprachbausteine-app': 'telc-b2-sprachbausteine.html',
    'goethe-b1-25-modelltests': 'goethe-osd-b1.html',
    'goethe-b2-25-modelltests': 'goethe-osd-b2.html'
  };
  return map[bookId] || (bookId + '.html');
}

/**
 * PrüfungStore - Apple Pro Experience & 3D Interactive Engine (Three.js)
 */

const state = {
  activeLevel: "all",
  cart: JSON.parse(localStorage.getItem("pv_cart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("pv_wishlist") || "[]"),
  selectedBook: null,
  active3DBookId: "pack-b1-telc-2026"
};

// ==========================================
// 1. THREE.JS 3D INTERACTIVE BOOK ENGINE
// ==========================================
let scene, camera, renderer, bookMesh, spiralMesh, pointLight, spotLight;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationY = 0.4;
let targetRotationX = 0.15;

function init3DStudio() {
  const container = document.getElementById("canvas-3d-container");
  if (!container || typeof THREE === "undefined") return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 7.5);

  // Renderer with Antialiasing
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Lighting - Apple Keynote Studio Rig
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  spotLight = new THREE.SpotLight(0xfff3d6, 3.5);
  spotLight.position.set(5, 8, 8);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.8;
  spotLight.castShadow = true;
  scene.add(spotLight);

  const cyanRimLight = new THREE.PointLight(0x00f2ff, 2.0, 15);
  cyanRimLight.position.set(-6, 3, -4);
  scene.add(cyanRimLight);

  const goldRimLight = new THREE.PointLight(0xff9900, 2.5, 15);
  goldRimLight.position.set(6, -3, 3);
  scene.add(goldRimLight);

  // Load Book Mesh
  create3DBook('assets/products/pack-b1.png');

  // Interactive Drag & Touch controls
  const dom = renderer.domElement;

  dom.addEventListener("mousedown", (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) {
      // Subtle auto parallax follow
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = 0.4 + nx * 0.8;
      targetRotationX = 0.15 - ny * 0.5;
      return;
    }

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    targetRotationY += deltaX * 0.008;
    targetRotationX += deltaY * 0.008;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch Support
  dom.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener("touchend", () => { isDragging = false; });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    targetRotationY += deltaX * 0.01;
    targetRotationX += deltaY * 0.01;

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  // Handle Resize
  window.addEventListener("resize", () => {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  animate3D();
}

function create3DBook(imageTexturePath) {
  if (!scene) return;

  if (bookMesh) scene.remove(bookMesh);
  if (spiralMesh) scene.remove(spiralMesh);

  const textureLoader = new THREE.TextureLoader();
  const coverTexture = textureLoader.load(imageTexturePath);
  coverTexture.anisotropy = 16;

  // Book Dimensions
  const bookWidth = 3.2;
  const bookHeight = 4.4;
  const bookDepth = 0.45;

  const geometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);

  // Materials for each 6 faces
  const pagePaperMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f3ea,
    roughness: 0.9,
    metalness: 0.05
  });

  const coverMaterial = new THREE.MeshStandardMaterial({
    map: coverTexture,
    roughness: 0.35,
    metalness: 0.25,
  });

  const spineBackMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.6,
    metalness: 0.3
  });

  const materials = [
    pagePaperMaterial,   // Right (Pages)
    spineBackMaterial,   // Left (Spine)
    pagePaperMaterial,   // Top
    pagePaperMaterial,   // Bottom
    coverMaterial,       // Front Cover
    spineBackMaterial    // Back Cover
  ];

  bookMesh = new THREE.Mesh(geometry, materials);
  bookMesh.castShadow = true;
  bookMesh.receiveShadow = true;
  scene.add(bookMesh);

  // Metallic Pro Spiral Ring Spine
  const spiralGroup = new THREE.Group();
  const ringCount = 22;
  const ringRadius = 0.16;
  const ringTube = 0.035;

  const ringGeo = new THREE.TorusGeometry(ringRadius, ringTube, 12, 24);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.95,
    roughness: 0.2
  });

  const startY = -(bookHeight / 2) + 0.3;
  const stepY = (bookHeight - 0.6) / ringCount;

  for (let i = 0; i <= ringCount; i++) {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(-(bookWidth / 2) + 0.05, startY + (i * stepY), 0);
    ring.rotation.y = Math.PI / 2;
    spiralGroup.add(ring);
  }

  spiralMesh = spiralGroup;
  scene.add(spiralMesh);
}

function switch3DModel(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;
  state.active3DBookId = bookId;

  document.querySelectorAll(".switcher-3d-btn").forEach(btn => {
    if (btn.dataset.id === bookId) {
      btn.className = "switcher-3d-btn active px-4 py-2 rounded-full text-xs font-bold bg-white text-black shadow-glow-apple transition-all";
    } else {
      btn.className = "switcher-3d-btn px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-slate-300 hover:bg-white/20 transition-all";
    }
  });

  const titleEl = document.getElementById("hero-3d-title");
  const priceEl = document.getElementById("hero-3d-price");
  const tagEl = document.getElementById("hero-3d-tag");
  const ctaBtn = document.getElementById("hero-3d-cta");

  if (titleEl) titleEl.textContent = book.title;
  if (priceEl) priceEl.textContent = book.priceDh + " DH";
  if (tagEl) tagEl.textContent = book.tagline || book.subtitle;
  if (ctaBtn) {
    ctaBtn.onclick = () => orderOnWhatsApp(book.id);
  }

  create3DBook(book.image);
}

function animate3D() {
  requestAnimationFrame(animate3D);

  if (bookMesh && spiralMesh) {
    // Smooth damping rotation
    bookMesh.rotation.y += (targetRotationY - bookMesh.rotation.y) * 0.05;
    bookMesh.rotation.x += (targetRotationX - bookMesh.rotation.x) * 0.05;

    spiralMesh.rotation.y = bookMesh.rotation.y;
    spiralMesh.rotation.x = bookMesh.rotation.x;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ==========================================
// 2. 3D TILT EFFECT ON CARDS (Apple Pro Style)
// ==========================================
function apply3DTiltCards() {
  document.querySelectorAll(".apple-tilt-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
      
      const sheen = card.querySelector(".card-sheen");
      if (sheen) {
        sheen.style.opacity = "1";
        sheen.style.background = "radial-gradient(circle at " + x + "px " + y + "px, rgba(255,255,255,0.15) 0%, transparent 60%)";
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      const sheen = card.querySelector(".card-sheen");
      if (sheen) sheen.style.opacity = "0";
    });
  });
}

// ==========================================
// 3. CATALOG RENDERING & WHATSAPP ORDERS
// ==========================================
function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid || typeof BOOKS === "undefined") return;

  const filtered = BOOKS.filter(b => {
    if (state.activeLevel === "packs" && !b.isPack) return false;
    if (state.activeLevel === "B1" && !b.level.includes("B1")) return false;
    if (state.activeLevel === "B2" && !b.level.includes("B2")) return false;
    if (state.activeLevel === "telc") {
      const isTelc = (b.examType && b.examType.toLowerCase().includes("telc")) || b.title.toLowerCase().includes("telc") || b.id.includes("telc");
      if (!isTelc) return false;
    }
    if (state.activeLevel === "goethe") {
      const isGoethe = (b.examType && (b.examType.toLowerCase().includes("goethe") || b.examType.toLowerCase().includes("ösd"))) || b.title.toLowerCase().includes("goethe") || b.title.toLowerCase().includes("ösd") || b.id.includes("goethe");
      if (!isGoethe) return false;
    }
    return true;
  });

  grid.innerHTML = filtered.map(book => {
    const isWishlisted = state.wishlist.includes(book.id);

    return `
      <div class="apple-tilt-card group relative themed-card rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden border hover:shadow-2xl">
        <div>
          <!-- Header Tag -->
          <div class="flex items-center justify-between gap-2 mb-4">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-500/40">
                ${book.level}
              </span>
              ${book.isPack ? `
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                  ★ PACK COMPLET
                </span>
              ` : ''}
            </div>

            <button onclick="toggleWishlist('${book.id}')" class="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-red-500 transition">
              <i data-lucide="heart" class="w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}"></i>
            </button>
          </div>

          <!-- Book Real Image Showcase -->
          <div onclick="window.location.href=getBookPageUrl('${book.id}')" class="cursor-pointer relative w-full h-64 bg-black/60 rounded-2xl flex items-center justify-center p-3 mb-5 border border-blue-900/40 group-hover:border-blue-500/60 transition-all overflow-hidden">
            <img src="${book.image}" alt="${book.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500">
            <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-slate-300 border border-white/10">
              <span class="text-blue-600 font-bold">${book.examType}</span>
              <span class="text-emerald-600 font-bold">✓ Audio + Corrigés</span>
            </div>
          </div>

          <!-- Titles & Description -->
          <div class="space-y-1 mb-3">
            <h3 onclick="window.location.href=getBookPageUrl('${book.id}')" class="cursor-pointer font-outfit font-extrabold text-lg themed-text-heading group-hover:text-blue-500 transition-colors leading-snug line-clamp-2">
              ${book.title}
            </h3>
            <p class="text-xs text-slate-400 font-medium line-clamp-2">${book.subtitle}</p>
          </div>

          <!-- Specs List -->
          <div class="py-3 border-y border-white/10 space-y-1.5 text-xs text-slate-300 mb-4">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Format :</span>
              <span class="font-bold themed-text-heading truncate max-w-[170px]">${book.format}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Audio :</span>
              <span class="font-bold text-blue-600">Drive MP3 & QR Codes</span>
            </div>
          </div>
        </div>

        <!-- Pricing & Actions -->
        <div class="space-y-3 pt-2">
          <div class="flex items-baseline justify-between">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Prix Préférentiel</span>
              <div class="flex items-baseline gap-2">
                <span class="font-outfit font-black text-2xl themed-price">${book.priceDh} DH</span>
                ${book.originalPriceDh ? `<span class="text-xs text-slate-400 line-through">${book.originalPriceDh} DH</span>` : ''}
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
              Livraison Gratuite
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button onclick="addToCart('${book.id}')" class="py-2.5 px-3 rounded-xl themed-quickview-btn font-bold text-xs transition flex items-center justify-center gap-1.5 border border-blue-500/20 rounded-xl py-2.5">
              <i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>Panier</span>
            </button>

            <button onclick="orderOnWhatsApp('${book.id}')" class="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-outfit font-extrabold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-1.5">
              <span>Commander</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');

  apply3DTiltCards();
  if (typeof window !== "undefined" && window.lucide) lucide.createIcons();
}

function filterCatalog(level) {
  state.activeLevel = level;
  document.querySelectorAll(".level-filter-btn").forEach(btn => {
    if (btn.dataset.level === level) {
      btn.className = "level-filter-btn active px-4 py-2 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/30 transition-all";
    } else {
      btn.className = "level-filter-btn px-4 py-2 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all";
    }
  });
  renderCatalog();
}

// ==========================================
// 4. WHATSAPP DISPATCH & CART SYSTEM
// ==========================================
function orderOnWhatsApp(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  const msg = "*COMMANDE - PrüfungStore* 📚\n\n" +
    "Bonjour, je souhaite commander :\n" +
    "• *Livre/Pack* : " + book.title + "\n" +
    "• *Format* : " + book.format + "\n" +
    "• *Prix Spécial* : " + book.priceDh + " DH (Livraison Gratuite)\n\n" +
    "Merci de me confirmer la procédure d'envoi et de paiement à la réception !";

  window.open("https://api.whatsapp.com/send?phone=212632017446&text=" + encodeURIComponent(msg), "_blank");
}

function orderCartOnWhatsApp() {
  if (state.cart.length === 0) {
    window.open("https://api.whatsapp.com/send?phone=212632017446&text=" + encodeURIComponent("Bonjour, je souhaite me renseigner sur vos packs de préparation B1 et B2."), "_blank");
    return;
  }

  let msg = "*NOUVELLE COMMANDE - PrüfungStore* 📚\n\nBonjour, je souhaite commander les articles suivants :\n\n";
  let total = 0;

  state.cart.forEach(item => {
    const book = BOOKS.find(b => b.id === item.id);
    if (book) {
      total += book.priceDh * item.quantity;
      msg += "• *" + book.title + "* (x" + item.quantity + ") : " + (book.priceDh * item.quantity) + " DH\n";
    }
  });

  msg += "\n💰 *Total Net (Livraison Gratuite partout au Maroc)* : " + total + " DH\n\nPaiement à la livraison. Pouvez-vous confirmer ma commande ?";
  window.open("https://api.whatsapp.com/send?phone=212632017446&text=" + encodeURIComponent(msg), "_blank");
}

function openBookModal(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  const modal = document.getElementById("book-modal");
  const content = document.getElementById("modal-content");
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="space-y-6 text-slate-800">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div class="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center">
          <img src="${book.image}" class="max-h-80 object-contain">
        </div>
        <div class="md:col-span-7 space-y-3">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-blue-600 text-white shadow-sm">${book.level} • ${book.examType}</span>
          <h2 class="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900">${book.title}</h2>
          <p class="text-xs text-slate-500">${book.subtitle}</p>
          <div class="flex items-baseline gap-3 pt-1">
            <span class="font-outfit font-black text-3xl text-blue-700">${book.priceDh} DH</span>
            ${book.originalPriceDh ? `<span class="text-sm text-slate-400 line-through">${book.originalPriceDh} DH</span>` : ''}
            <span class="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">-${book.discountPercent}%</span>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            ✓ <strong>Livraison Gratuite</strong> en 24/48h • Paiement en espèces à la livraison
          </div>
        </div>
      </div>

      <div class="space-y-3 border-t border-slate-100 pt-4">
        <h4 class="font-bold text-sm text-slate-900 font-outfit">Caractéristiques & Contenu :</h4>
        <ul class="space-y-2 text-xs text-slate-600">
          ${book.features.map(f => `
            <li class="flex items-start gap-2">
              <i data-lucide="check-circle" class="w-4 h-4 text-blue-600 shrink-0 mt-0.5"></i>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        <button onclick="addToCart('${book.id}'); closeBookModal();" class="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-200">
          + Ajouter au Panier
        </button>
        <button onclick="orderOnWhatsApp('${book.id}')" class="flex-1 py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-outfit font-extrabold text-sm shadow-md flex items-center justify-center gap-2">
          <svg class="w-5 h-5 fill-white shrink-0" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
          <span>Commander sur WhatsApp (${book.priceDh} DH)</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  if (typeof window !== "undefined" && window.lucide) lucide.createIcons();
}

function closeBookModal() {
  const modal = document.getElementById("book-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Cart & Wishlist
function addToCart(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  const existing = state.cart.find(i => i.id === bookId);
  if (existing) existing.quantity += 1;
  else state.cart.push({ id: bookId, quantity: 1 });

  localStorage.setItem("pv_cart", JSON.stringify(state.cart));
  updateCartUI();
  showToast(book.title + " ajouté au panier");
}

function updateCartQuantity(bookId, delta) {
  const item = state.cart.find(i => i.id === bookId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) state.cart = state.cart.filter(i => i.id !== bookId);

  localStorage.setItem("pv_cart", JSON.stringify(state.cart));
  updateCartUI();
}

function removeFromCart(bookId) {
  state.cart = state.cart.filter(i => i.id !== bookId);
  localStorage.setItem("pv_cart", JSON.stringify(state.cart));
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById("cart-count");
  const badgeEl = document.getElementById("cart-drawer-badge");
  const listEl = document.getElementById("cart-items-list");
  const totalEl = document.getElementById("cart-total-price");

  const totalCount = state.cart.reduce((s, i) => s + i.quantity, 0);
  if (countEl) countEl.textContent = totalCount;
  if (badgeEl) badgeEl.textContent = totalCount;

  let totalDh = 0;

  if (listEl) {
    if (state.cart.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-16 text-slate-500">
          <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto mb-3 opacity-30"></i>
          <p class="text-sm font-medium">Votre panier est vide</p>
        </div>
      `;
    } else {
      listEl.innerHTML = state.cart.map(item => {
        const book = BOOKS.find(b => b.id === item.id);
        if (!book) return "";
        totalDh += book.priceDh * item.quantity;

        return `
          <div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-white">
            <div class="w-12 h-12 bg-black/60 rounded-xl p-1 flex items-center justify-center border border-white/10 shrink-0">
              <img src="${book.image}" class="max-h-full max-w-full object-contain">
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-outfit font-bold text-xs text-white truncate">${book.title}</h4>
              <span class="text-xs font-black text-amber-400">${book.priceDh * item.quantity} DH</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="updateCartQuantity('${book.id}', -1)" class="w-6 h-6 rounded-md bg-white/10 text-xs font-bold hover:bg-white/20">-</button>
              <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
              <button onclick="updateCartQuantity('${book.id}', 1)" class="w-6 h-6 rounded-md bg-white/10 text-xs font-bold hover:bg-white/20">+</button>
              <button onclick="removeFromCart('${book.id}')" class="text-red-400 hover:text-red-300 p-1 ml-1">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (totalEl) totalEl.textContent = totalDh + " DH";
  if (typeof window !== "undefined" && window.lucide) lucide.createIcons();
}

function toggleWishlist(bookId) {
  const index = state.wishlist.indexOf(bookId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast("Retiré des favoris");
  } else {
    state.wishlist.push(bookId);
    showToast("Ajouté aux favoris !");
  }
  localStorage.setItem("pv_wishlist", JSON.stringify(state.wishlist));
  renderCatalog();
}

function openCartDrawer() {
  const overlay = document.getElementById("cart-drawer-overlay");
  const drawer = document.getElementById("cart-drawer");
  if (!overlay || !drawer) return;
  overlay.classList.remove("hidden");
  setTimeout(() => drawer.classList.remove("translate-x-full"), 10);
  updateCartUI();
}

function closeCartDrawer() {
  const overlay = document.getElementById("cart-drawer-overlay");
  const drawer = document.getElementById("cart-drawer");
  if (!overlay || !drawer) return;
  drawer.classList.add("translate-x-full");
  setTimeout(() => overlay.classList.add("hidden"), 300);
}

function showToast(msg) {
  let toast = document.getElementById("apple-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "apple-toast";
    toast.className = "fixed bottom-8 right-8 z-50 px-5 py-3 rounded-full bg-white text-black font-outfit font-bold text-xs shadow-2xl flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300";
    document.body.appendChild(toast);
  }
  toast.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500"></span> ' + msg;
  toast.classList.remove("translate-y-20", "opacity-0");
  setTimeout(() => toast.classList.add("translate-y-20", "opacity-0"), 2500);
}

// Dom Ready
document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  updateCartUI();

  const cartBtn = document.getElementById("cart-drawer-btn");
  if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
});
