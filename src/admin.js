// ==============================================================
// PRÜFUNGSTORE PRO — ENTERPRISE ADMIN ENGINE (ADMIN.JS)
// ==============================================================

const DEFAULT_ORDERS = [
  {
    id: "CMD-2026-0801",
    customerName: "Yassine Mansouri",
    customerPhone: "+212 6 61 23 45 67",
    customerCity: "Casablanca",
    customerAddress: "Bd d'Anfa, Résidence Al Yassamine, Apt 14",
    items: [
      { id: "pack-b1-telc-2026", title: "Pack B1 TELC-Prüfung Deutsch (2026)", price: 235, qty: 1 }
    ],
    totalDh: 235,
    status: "livre",
    paymentMethod: "Paiement à la livraison (COD)",
    date: "2026-08-30 14:25",
    notes: "Client prépare l'examen telc B1 en octobre."
  },
  {
    id: "CMD-2026-0802",
    customerName: "Salma Benjelloun",
    customerPhone: "+212 6 72 88 99 10",
    customerCity: "Rabat",
    customerAddress: "Quartier Agdal, Rue Oukaimeden, N° 22",
    items: [
      { id: "pack-goethe-osd-b1-b2", title: "Pack GOETHE - ÖSD B1 & B2 (25 Tests)", price: 235, qty: 1 },
      { id: "telc-b1-sprechen-solo", title: "TELC Deutsch B1 - SPRECHEN", price: 120, qty: 1 }
    ],
    totalDh: 355,
    status: "expedie",
    paymentMethod: "Paiement à la livraison (COD)",
    date: "2026-08-30 18:40",
    notes: "Expédié via Amana Express / Suivi transmis sur WhatsApp."
  },
  {
    id: "CMD-2026-0803",
    customerName: "Othmane Tazi",
    customerPhone: "+212 6 63 44 55 66",
    customerCity: "Tanger",
    customerAddress: "Malabata, Résidence Les Jardins du Détroit",
    items: [
      { id: "pack-b2-telc-complet", title: "Pack B2 TELC-Prüfung Deutsch (Collection)", price: 260, qty: 1 }
    ],
    totalDh: 260,
    status: "preparation",
    paymentMethod: "Paiement à la livraison (COD)",
    date: "2026-08-31 09:15",
    notes: "Colis en cours d'emballage."
  },
  {
    id: "CMD-2026-0804",
    customerName: "Khadija El Idrissi",
    customerPhone: "+212 6 50 11 22 33",
    customerCity: "Marrakech",
    customerAddress: "Guéliz, Bd Mohammed V, Imm 45",
    items: [
      { id: "pack-b1-telc-2026", title: "Pack B1 TELC-Prüfung Deutsch (2026)", price: 235, qty: 2 }
    ],
    totalDh: 470,
    status: "nouveau",
    paymentMethod: "Paiement à la livraison (COD)",
    date: "2026-08-31 16:30",
    notes: "Commande reçue via WhatsApp."
  },
  {
    id: "CMD-2026-0805",
    customerName: "Mehdi Cherkaoui",
    customerPhone: "+212 6 14 99 88 77",
    customerCity: "Fès",
    customerAddress: "Route d'Imouzzer, Résidence Narjiss",
    items: [
      { id: "telc-b2-sprachbausteine-app", title: "TELC Deutsch B2 - SPRACHBAUSTEINE", price: 130, qty: 1 }
    ],
    totalDh: 130,
    status: "nouveau",
    paymentMethod: "Paiement à la livraison (COD)",
    date: "2026-08-31 17:50",
    notes: "Demande confirmation d'envoi rapide."
  }
];

const CANDIDATES_DATA = [
  { id: "STU-2026-001", name: "Yassine Mansouri", phone: "212661234567", city: "Casablanca", level: "B1", exam: "telc", lesen: 82, hoeren: 78, schreiben: 75, sprechen: 80, readiness: "pret" },
  { id: "STU-2026-002", name: "Salma Benjelloun", phone: "212672889910", city: "Rabat", level: "B1", exam: "Goethe", lesen: 88, hoeren: 85, schreiben: 80, sprechen: 84, readiness: "pret" },
  { id: "STU-2026-003", name: "Othmane Tazi", phone: "212663445566", city: "Tanger", level: "B2", exam: "telc", lesen: 74, hoeren: 70, schreiben: 68, sprechen: 72, readiness: "cours" },
  { id: "STU-2026-004", name: "Khadija El Idrissi", phone: "212650112233", city: "Marrakech", level: "B1", exam: "telc", lesen: 92, hoeren: 90, schreiben: 88, sprechen: 91, readiness: "pret" },
  { id: "STU-2026-005", name: "Mehdi Cherkaoui", phone: "212614998877", city: "Fès", level: "B2", exam: "telc", lesen: 58, hoeren: 52, schreiben: 55, sprechen: 60, readiness: "renforcer" },
  { id: "STU-2026-006", name: "Imane Berrada", phone: "212661884422", city: "Casablanca", level: "B2", exam: "Goethe", lesen: 85, hoeren: 82, schreiben: 79, sprechen: 83, readiness: "pret" },
  { id: "STU-2026-007", name: "Anas Chraibi", phone: "212662331199", city: "Rabat", level: "B1", exam: "ÖSD", lesen: 70, hoeren: 65, schreiben: 64, sprechen: 68, readiness: "cours" }
];

const adminState = {
  activeTab: "overview",
  books: [],
  orders: [],
  candidates: [...CANDIDATES_DATA],
  settings: {
    whatsappNumber: "212632017446",
    storeName: "PrüfungStore Pro",
    currency: "DH",
    deliveryFee: 0
  },
  productFilter: "all",
  orderFilter: "all",
  searchQuery: "",
  editingProductId: null
};

// Initialize Data
function initAdmin() {
  const savedBooks = localStorage.getItem("pruefung_admin_books");
  if (savedBooks) {
    try { adminState.books = JSON.parse(savedBooks); } catch(e) { adminState.books = (typeof BOOKS !== "undefined") ? [...BOOKS] : []; }
  } else if (typeof BOOKS !== "undefined") {
    adminState.books = [...BOOKS];
    saveBooksToStorage();
  }

  const savedOrders = localStorage.getItem("pruefung_admin_orders");
  if (savedOrders) {
    try { adminState.orders = JSON.parse(savedOrders); } catch(e) { adminState.orders = [...DEFAULT_ORDERS]; }
  } else {
    adminState.orders = [...DEFAULT_ORDERS];
    saveOrdersToStorage();
  }

  const savedSettings = localStorage.getItem("pruefung_admin_settings");
  if (savedSettings) {
    try { adminState.settings = { ...adminState.settings, ...JSON.parse(savedSettings) }; } catch(e) {}
  }

  renderAll();
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function saveBooksToStorage() {
  localStorage.setItem("pruefung_admin_books", JSON.stringify(adminState.books));
}

function saveOrdersToStorage() {
  localStorage.setItem("pruefung_admin_orders", JSON.stringify(adminState.orders));
}

function saveSettingsToStorage() {
  localStorage.setItem("pruefung_admin_settings", JSON.stringify(adminState.settings));
}

// Navigation Tabs
function switchTab(tabId) {
  adminState.activeTab = tabId;

  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.className = "nav-tab-btn active flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 shadow-lg text-xs transition";
    } else {
      btn.className = "nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition";
    }
  });

  document.querySelectorAll(".dashboard-tab-panel").forEach(panel => {
    panel.classList.add("hidden");
  });

  const activePanel = document.getElementById("panel-" + tabId);
  if (activePanel) activePanel.classList.remove("hidden");

  if (tabId === "overview") {
    renderKPIs();
    setTimeout(renderCharts, 50);
  } else if (tabId === "products") {
    renderProductsTable();
  } else if (tabId === "orders") {
    renderOrdersTable();
  } else if (tabId === "clients") {
    renderClientsTable();
  } else if (tabId === "evaluations") {
    renderEvaluationsTable();
  } else if (tabId === "settings") {
    loadSettingsUI();
  }

  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ==========================================
// 1. OVERVIEW & KPIS & CHARTS
// ==========================================
function renderKPIs() {
  const totalRevenue = adminState.orders
    .filter(o => o.status === "livre" || o.status === "expedie" || o.status === "preparation")
    .reduce((sum, o) => sum + o.totalDh, 0);

  const totalOrders = adminState.orders.length;
  const newOrdersCount = adminState.orders.filter(o => o.status === "nouveau").length;
  const lowStockCount = adminState.books.filter(b => (b.stockCount || 0) < 5).length;
  const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;

  const revEl = document.getElementById("kpi-total-revenue");
  const ordEl = document.getElementById("kpi-total-orders");
  const newEl = document.getElementById("kpi-new-orders");
  const stocEl = document.getElementById("kpi-low-stock");
  const avgEl = document.getElementById("kpi-avg-order");

  if (revEl) revEl.textContent = totalRevenue.toLocaleString() + " DH";
  if (ordEl) ordEl.textContent = totalOrders;
  if (newEl) newEl.textContent = newOrdersCount;
  if (stocEl) stocEl.textContent = lowStockCount;
  if (avgEl) avgEl.textContent = avgOrder + " DH";

  // Render Recent Orders List
  const recentList = document.getElementById("recent-orders-list");
  if (recentList) {
    const recent = [...adminState.orders].reverse().slice(0, 5);
    recentList.innerHTML = recent.map(o => `
      <div class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition group">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-outfit font-black text-xs">
            ${o.id.slice(-4)}
          </div>
          <div>
            <h4 class="font-outfit font-bold text-sm text-white group-hover:text-amber-400 transition">${o.customerName}</h4>
            <p class="text-[11px] text-slate-400 font-medium">${o.customerCity} • ${o.items.length} article(s) • ${o.date.split(' ')[0]}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="font-outfit font-black text-sm text-white block">${o.totalDh} DH</span>
            <span class="text-[10px] font-bold ${getStatusBadgeClass(o.status)} px-2 py-0.5 rounded-full inline-block">
              ${getStatusLabel(o.status)}
            </span>
          </div>
          <button onclick="openWhatsAppCustomer('${o.id}')" class="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 transition" title="WhatsApp Client">
            <svg class="w-4 h-4 fill-emerald-400" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }
}

let chartInstanceRevenue = null;
let chartInstanceLevels = null;

function renderCharts() {
  const ctxRevenue = document.getElementById("chartRevenue");
  if (ctxRevenue && typeof Chart !== "undefined") {
    if (chartInstanceRevenue) chartInstanceRevenue.destroy();

    chartInstanceRevenue = new Chart(ctxRevenue, {
      type: "line",
      data: {
        labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        datasets: [{
          label: "Ventes (DH)",
          data: [470, 705, 940, 1175, 1410, 1880, 2350],
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.12)",
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#f59e0b",
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8", font: { size: 10 } } }
        }
      }
    });
  }

  const ctxLevels = document.getElementById("chartLevels");
  if (ctxLevels && typeof Chart !== "undefined") {
    if (chartInstanceLevels) chartInstanceLevels.destroy();

    const b1Count = adminState.books.filter(b => b.level.includes("B1")).length;
    const b2Count = adminState.books.filter(b => b.level.includes("B2")).length;

    chartInstanceLevels = new Chart(ctxLevels, {
      type: "doughnut",
      data: {
        labels: ["Niveau B1", "Niveau B2"],
        datasets: [{
          data: [b1Count || 4, b2Count || 3],
          backgroundColor: ["#f59e0b", "#3b82f6"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#cbd5e1", font: { size: 11 } } }
        },
        cutout: "70%"
      }
    });
  }
}

// ==========================================
// 2. PRODUCTS MANAGEMENT
// ==========================================
function filterProductsByLevel(level) {
  adminState.productFilter = level;
  document.querySelectorAll(".prod-filter-btn").forEach(btn => {
    if (btn.dataset.filter === level) {
      btn.className = "prod-filter-btn px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-md transition";
    } else {
      btn.className = "prod-filter-btn px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition";
    }
  });
  renderProductsTable();
}

function renderProductsTable() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  const filter = adminState.productFilter;
  const query = adminState.searchQuery.toLowerCase();

  let list = adminState.books.filter(b => {
    const matchFilter = filter === "all" || 
      (filter === "B1" && b.level.includes("B1")) || 
      (filter === "B2" && b.level.includes("B2")) || 
      (filter === "pack" && b.isPack);
    const matchQuery = !query || b.title.toLowerCase().includes(query) || b.id.toLowerCase().includes(query) || b.examType.toLowerCase().includes(query);
    return matchFilter && matchQuery;
  });

  tbody.innerHTML = list.map(b => `
    <tr class="border-b border-white/5 hover:bg-white/5 transition">
      <td class="p-4">
        <div class="flex items-center gap-3.5">
          <img src="${b.image}" alt="${b.title}" class="w-12 h-12 object-contain bg-black/60 rounded-xl p-1 border border-white/10 shrink-0">
          <div>
            <h4 class="font-outfit font-bold text-white text-sm line-clamp-1">${b.title}</h4>
            <span class="text-[11px] text-slate-400 font-mono">${b.id} • ${b.examType}</span>
          </div>
        </div>
      </td>
      <td class="p-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${b.level.includes('B1') ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'} border border-white/10">
          ${b.level}
        </span>
      </td>
      <td class="p-4">
        <span class="font-outfit font-black text-white text-sm">${b.priceDh} DH</span>
        ${b.originalPriceDh ? `<span class="text-xs text-slate-500 line-through block">${b.originalPriceDh} DH</span>` : ''}
      </td>
      <td class="p-4">
        <div class="flex items-center gap-2">
          <button onclick="quickStockChange('${b.id}', -1)" class="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center">-</button>
          <span class="font-bold text-xs ${b.stockCount < 5 ? 'text-red-400' : 'text-emerald-400'}">${b.stockCount || 0}</span>
          <button onclick="quickStockChange('${b.id}', 1)" class="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center">+</button>
        </div>
      </td>
      <td class="p-4">
        <button onclick="toggleProductPack('${b.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold ${b.isPack ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400'}">
          ${b.isPack ? '★ Pack' : 'Solo'}
        </button>
      </td>
      <td class="p-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="openProductModal('${b.id}')" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition" title="Modifier">
            <i data-lucide="edit" class="w-4 h-4 text-amber-400"></i>
          </button>
          <button onclick="deleteProduct('${b.id}')" class="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition" title="Supprimer">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (typeof lucide !== "undefined") lucide.createIcons();
}

function quickStockChange(bookId, delta) {
  const book = adminState.books.find(b => b.id === bookId);
  if (book) {
    book.stockCount = Math.max(0, (book.stockCount || 0) + delta);
    saveBooksToStorage();
    renderProductsTable();
    showToast("Stock mis à jour (" + book.stockCount + " restants)");
  }
}

function toggleProductPack(bookId) {
  const book = adminState.books.find(b => b.id === bookId);
  if (book) {
    book.isPack = !book.isPack;
    saveBooksToStorage();
    renderProductsTable();
    showToast("Statut Pack modifié !");
  }
}

function openProductModal(bookId = null) {
  adminState.editingProductId = bookId;
  const modal = document.getElementById("product-modal");
  const modalTitle = document.getElementById("product-modal-title");

  if (bookId) {
    const book = adminState.books.find(b => b.id === bookId);
    if (!book) return;
    modalTitle.textContent = "Modifier le livre : " + book.title;
    document.getElementById("prod-id").value = book.id;
    document.getElementById("prod-title").value = book.title;
    document.getElementById("prod-subtitle").value = book.subtitle || "";
    document.getElementById("prod-level").value = book.level;
    document.getElementById("prod-exam").value = book.examType;
    document.getElementById("prod-price").value = book.priceDh;
    document.getElementById("prod-orig-price").value = book.originalPriceDh || "";
    document.getElementById("prod-stock").value = book.stockCount || 10;
    document.getElementById("prod-format").value = book.format || "";
    document.getElementById("prod-image").value = book.image || "";
  } else {
    modalTitle.textContent = "Ajouter un nouveau livre / pack";
    document.getElementById("prod-id").value = "livre-" + Date.now().toString().slice(-4);
    document.getElementById("prod-title").value = "";
    document.getElementById("prod-subtitle").value = "";
    document.getElementById("prod-level").value = "B1";
    document.getElementById("prod-exam").value = "telc";
    document.getElementById("prod-price").value = "235";
    document.getElementById("prod-orig-price").value = "350";
    document.getElementById("prod-stock").value = "10";
    document.getElementById("prod-format").value = "Livre Spirale • 320 Pages";
    document.getElementById("prod-image").value = "assets/products/pack-b1.png";
  }

  modal.classList.remove("hidden");
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function closeProductModal() {
  document.getElementById("product-modal").classList.add("hidden");
}

function saveProductFromForm(event) {
  event.preventDefault();
  const id = document.getElementById("prod-id").value.trim();
  const title = document.getElementById("prod-title").value.trim();
  const subtitle = document.getElementById("prod-subtitle").value.trim();
  const level = document.getElementById("prod-level").value;
  const examType = document.getElementById("prod-exam").value;
  const priceDh = parseInt(document.getElementById("prod-price").value) || 235;
  const originalPriceDh = parseInt(document.getElementById("prod-orig-price").value) || null;
  const stockCount = parseInt(document.getElementById("prod-stock").value) || 0;
  const format = document.getElementById("prod-format").value.trim();
  const image = document.getElementById("prod-image").value.trim();

  if (!title) { alert("Veuillez saisir un titre valide."); return; }
  const existingIndex = adminState.books.findIndex(b => b.id === id);
  const productData = { id, title, subtitle, level, examType, priceDh, originalPriceDh, stockCount, format, image: image || "assets/products/pack-b1.png", isPack: level.includes("&") || title.toLowerCase().includes("pack"), features: ["Manuel officiel 2026", "Solutions incluses", "Audios QR-Codes"] };
  
  if (existingIndex >= 0) {
    adminState.books[existingIndex] = { ...adminState.books[existingIndex], ...productData };
    showToast("Produit modifié avec succès !");
  } else {
    adminState.books.push(productData);
    showToast("Nouveau produit ajouté !");
  }
  saveBooksToStorage();
  closeProductModal();
  renderProductsTable();
  renderKPIs();
}

function deleteProduct(bookId) {
  if (confirm("Supprimer définitivement ce livre ?")) {
    adminState.books = adminState.books.filter(b => b.id !== bookId);
    saveBooksToStorage();
    renderProductsTable();
    renderKPIs();
    showToast("Produit supprimé.");
  }
}

// ==========================================
// 3. ORDERS MANAGEMENT
// ==========================================
function filterOrdersByStatus(status) {
  adminState.orderFilter = status;
  document.querySelectorAll(".order-filter-btn").forEach(btn => {
    if (btn.dataset.status === status) {
      btn.className = "order-filter-btn px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-md transition";
    } else {
      btn.className = "order-filter-btn px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition";
    }
  });
  renderOrdersTable();
}

function renderOrdersTable() {
  const tbody = document.getElementById("orders-table-body");
  if (!tbody) return;

  const filter = adminState.orderFilter;
  const query = adminState.searchQuery.toLowerCase();

  let list = adminState.orders.filter(o => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchQuery = !query || o.customerName.toLowerCase().includes(query) || o.customerCity.toLowerCase().includes(query) || o.id.toLowerCase().includes(query) || o.customerPhone.includes(query);
    return matchFilter && matchQuery;
  });

  tbody.innerHTML = list.map(o => `
    <tr class="border-b border-white/5 hover:bg-white/5 transition">
      <td class="p-4">
        <span class="font-outfit font-black text-white text-xs">${o.id}</span>
        <span class="text-[11px] text-slate-400 block font-mono">${o.date}</span>
      </td>
      <td class="p-4">
        <h4 class="font-outfit font-bold text-white text-sm">${o.customerName}</h4>
        <span class="text-[11px] text-slate-400 font-medium">${o.customerCity}</span>
      </td>
      <td class="p-4">
        <span class="text-xs text-slate-300 font-medium block truncate max-w-xs">${o.items.map(i => i.title).join(", ")}</span>
        <span class="text-[11px] text-amber-400 font-bold">${o.items.length} article(s)</span>
      </td>
      <td class="p-4">
        <span class="font-outfit font-black text-white text-sm">${o.totalDh} DH</span>
        <span class="text-[10px] text-emerald-400 font-semibold block">Livraison Gratuite</span>
      </td>
      <td class="p-4">
        <select onchange="updateOrderStatus('${o.id}', this.value)" class="bg-black/60 border border-white/15 text-xs rounded-xl px-2.5 py-1.5 font-bold text-white focus:outline-none focus:border-amber-500">
          <option value="nouveau" ${o.status === 'nouveau' ? 'selected' : ''}>🟡 Nouvelle</option>
          <option value="preparation" ${o.status === 'preparation' ? 'selected' : ''}>🔵 En Préparation</option>
          <option value="expedie" ${o.status === 'expedie' ? 'selected' : ''}>🟣 Expédiée</option>
          <option value="livre" ${o.status === 'livre' ? 'selected' : ''}>🟢 Livrée & Payée</option>
          <option value="annule" ${o.status === 'annule' ? 'selected' : ''}>🔴 Annulée</option>
        </select>
      </td>
      <td class="p-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="openWhatsAppCustomer('${o.id}')" class="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 transition" title="Discuter sur WhatsApp">
            <svg class="w-4 h-4 fill-emerald-400" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
          </button>
          <button onclick="deleteOrder('${o.id}')" class="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition" title="Supprimer">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (typeof lucide !== "undefined") lucide.createIcons();
}

function updateOrderStatus(orderId, newStatus) {
  const order = adminState.orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrdersToStorage();
    renderKPIs();
    showToast("Statut mis à jour (" + getStatusLabel(newStatus) + ")");
  }
}

function deleteOrder(orderId) {
  if (confirm("Supprimer la commande " + orderId + " ?")) {
    adminState.orders = adminState.orders.filter(o => o.id !== orderId);
    saveOrdersToStorage();
    renderOrdersTable();
    renderKPIs();
    showToast("Commande supprimée.");
  }
}

function openWhatsAppCustomer(orderId) {
  const order = adminState.orders.find(o => o.id === orderId);
  if (!order) return;
  const phone = order.customerPhone.replace(/[^0-9]/g, "");
  const msg = encodeURIComponent("Bonjour " + order.customerName + " ! Suivi de votre commande " + order.id + " chez PrüfungStore.");
  window.open("https://api.whatsapp.com/send?phone=" + phone + "&text=" + msg, "_blank");
}

function openNewOrderModal() {
  document.getElementById("new-order-modal").classList.remove("hidden");
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function closeNewOrderModal() {
  document.getElementById("new-order-modal").classList.add("hidden");
}

function saveNewOrder(event) {
  event.preventDefault();
  const name = document.getElementById("order-client-name").value.trim();
  const phone = document.getElementById("order-client-phone").value.trim();
  const city = document.getElementById("order-client-city").value.trim();
  const address = document.getElementById("order-client-address").value.trim();
  const bookId = document.getElementById("order-book-select").value;
  const notes = document.getElementById("order-notes").value.trim();
  const book = adminState.books.find(b => b.id === bookId) || adminState.books[0];

  const newOrder = {
    id: "CMD-" + Date.now().toString().slice(-6),
    customerName: name,
    customerPhone: phone,
    customerCity: city,
    customerAddress: address,
    items: [{ id: book.id, title: book.title, price: book.priceDh, qty: 1 }],
    totalDh: book.priceDh,
    status: "nouveau",
    paymentMethod: "Paiement à la livraison (COD)",
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
    notes: notes || "Commande manuelle ajoutée via Dashboard"
  };

  adminState.orders.unshift(newOrder);
  saveOrdersToStorage();
  closeNewOrderModal();
  renderOrdersTable();
  renderKPIs();
  showToast("Nouvelle commande créée !");
}

// ==========================================
// 4. CLIENTS & CONTACTS LEADS
// ==========================================
function renderClientsTable() {
  const tbody = document.getElementById("clients-table-body");
  if (!tbody) return;

  const clientsMap = {};
  adminState.orders.forEach(o => {
    if (!clientsMap[o.customerPhone]) {
      clientsMap[o.customerPhone] = { name: o.customerName, phone: o.customerPhone, city: o.customerCity, totalOrders: 1, totalSpent: o.totalDh };
    } else {
      clientsMap[o.customerPhone].totalOrders++;
      clientsMap[o.customerPhone].totalSpent += o.totalDh;
    }
  });

  const clients = Object.values(clientsMap);
  tbody.innerHTML = clients.map(c => `
    <tr class="border-b border-white/5 hover:bg-white/5 transition">
      <td class="p-4">
        <h4 class="font-outfit font-bold text-white text-sm">${c.name}</h4>
        <span class="text-[11px] text-slate-400 font-mono">${c.phone}</span>
      </td>
      <td class="p-4"><span class="text-xs text-slate-300 font-medium">${c.city}</span></td>
      <td class="p-4"><span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300">${c.totalOrders} commande(s)</span></td>
      <td class="p-4"><span class="font-outfit font-black text-white text-sm">${c.totalSpent} DH</span></td>
      <td class="p-4 text-right">
        <a href="https://api.whatsapp.com/send?phone=${c.phone.replace(/[^0-9]/g, "")}&text=Bonjour%20${encodeURIComponent(c.name)}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs transition">
          <svg class="w-3.5 h-3.5 fill-emerald-400" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
          <span>WhatsApp</span>
        </a>
      </td>
    </tr>
  `).join('');
}

// ==========================================
// 5. EVALUATIONS CANDIDATS (TAB 5)
// ==========================================
function renderEvaluationsTable() {
  const tbody = document.getElementById("evaluations-table-body");
  if (!tbody) return;

  tbody.innerHTML = adminState.candidates.map(c => {
    const avg = ((c.lesen + c.hoeren + c.schreiben + c.sprechen) / 4).toFixed(1);
    let badgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    let badgeText = "🟢 Prêt (>75%)";
    if (c.readiness === "cours") {
      badgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/30";
      badgeText = "🟡 En cours";
    } else if (c.readiness === "renforcer") {
      badgeClass = "bg-red-500/20 text-red-300 border-red-500/30";
      badgeText = "🔴 À renforcer";
    }

    return `
      <tr class="border-b border-white/5 hover:bg-white/5 transition">
        <td class="p-4">
          <h4 class="font-outfit font-bold text-white text-sm">${c.name}</h4>
          <span class="text-[11px] text-slate-400 font-mono">${c.id} • ${c.city}</span>
        </td>
        <td class="p-4">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${c.level === 'B1' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'} border border-white/10">
            ${c.level}
          </span>
          <span class="text-xs text-slate-300 font-bold ml-1">${c.exam}</span>
        </td>
        <td class="p-4 text-center font-bold text-slate-200">${c.lesen}%</td>
        <td class="p-4 text-center font-bold text-slate-200">${c.hoeren}%</td>
        <td class="p-4 text-center font-bold text-slate-200">${c.schreiben}%</td>
        <td class="p-4 text-center font-bold text-slate-200">${c.sprechen}%</td>
        <td class="p-4 text-center font-outfit font-black text-sm ${avg >= 75 ? 'text-emerald-400' : (avg >= 60 ? 'text-amber-400' : 'text-red-400')}">
          ${avg}%
        </td>
        <td class="p-4">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeClass}">
            ${badgeText}
          </span>
        </td>
        <td class="p-4 text-right">
          <a href="https://api.whatsapp.com/send?phone=${c.phone}&text=Bonjour%20${encodeURIComponent(c.name)},%20suivi%20de%20votre%20pr%C3%A9paration%20${c.level}%20chez%20Pr%C3%BCfungStore%20!" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs transition">
            <span>💬 Suivi</span>
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 6. SETTINGS & EXPORTS
// ==========================================
function loadSettingsUI() {
  document.getElementById("set-whatsapp").value = adminState.settings.whatsappNumber;
  document.getElementById("set-store-name").value = adminState.settings.storeName;
}

function saveSettingsForm(event) {
  event.preventDefault();
  adminState.settings.whatsappNumber = document.getElementById("set-whatsapp").value.trim();
  adminState.settings.storeName = document.getElementById("set-store-name").value.trim();
  saveSettingsToStorage();
  showToast("Paramètres enregistrés !");
}

function exportOrdersCSV() {
  let csv = "ID Commande,Date,Client,Telephone,Ville,Articles,Total DH,Statut,Notes\n";
  adminState.orders.forEach(o => {
    const itemsStr = o.items.map(i => i.title + " (x" + i.qty + ")").join("; ");
    csv += "\"" + o.id + "\",\"" + o.date + "\",\"" + o.customerName + "\",\"" + o.customerPhone + "\",\"" + o.customerCity + "\",\"" + itemsStr + "\"," + o.totalDh + ",\"" + o.status + "\",\"" + (o.notes || "") + "\"\n";
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "commandes_pruefungstore_" + new Date().toISOString().slice(0, 10) + ".csv";
  link.click();
  showToast("Fichier CSV exporté !");
}

function exportDataJSON() {
  const data = { books: adminState.books, orders: adminState.orders, candidates: adminState.candidates, settings: adminState.settings, exportDate: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "sauvegarde_pruefungstore_" + new Date().toISOString().slice(0, 10) + ".json";
  link.click();
  showToast("Sauvegarde JSON exportée !");
}

function resetAllData() {
  if (confirm("Réinitialiser les données aux valeurs par défaut ?")) {
    localStorage.removeItem("pruefung_admin_books");
    localStorage.removeItem("pruefung_admin_orders");
    localStorage.removeItem("pruefung_admin_settings");
    initAdmin();
    showToast("Données réinitialisées.");
  }
}

function getStatusBadgeClass(status) {
  const map = { 
    nouveau: "bg-amber-500/20 text-amber-300 border border-amber-500/30", 
    preparation: "bg-blue-500/20 text-blue-300 border border-blue-500/30", 
    expedie: "bg-purple-500/20 text-purple-300 border border-purple-500/30", 
    livre: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", 
    annule: "bg-red-500/20 text-red-300 border border-red-500/30" 
  };
  return map[status] || "bg-white/10 text-white";
}

function getStatusLabel(status) {
  const map = { 
    nouveau: "🟡 Nouvelle", 
    preparation: "🔵 En Préparation", 
    expedie: "🟣 Expédiée", 
    livre: "🟢 Livrée & Payée", 
    annule: "🔴 Annulée" 
  };
  return map[status] || status;
}

function showToast(message) {
  const toast = document.getElementById("admin-toast");
  const toastMsg = document.getElementById("admin-toast-msg");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove("translate-y-20", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
    toast.classList.remove("translate-y-0", "opacity-100");
  }, 3000);
}

function renderAll() {
  renderKPIs();
  renderCharts();
  renderProductsTable();
  renderOrdersTable();
  renderClientsTable();
  renderEvaluationsTable();
}

document.addEventListener("DOMContentLoaded", () => {
  initAdmin();
  const searchInput = document.getElementById("admin-global-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      adminState.searchQuery = e.target.value;
      if (adminState.activeTab === "products") renderProductsTable();
      if (adminState.activeTab === "orders") renderOrdersTable();
    });
  }
});
