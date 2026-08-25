/* ==========================================================================
   TARELCRAFT SHOPIFY POLARIS ADMIN CONTROLLER
   Full Product CRUD, Live Storefront Customizer, Real-Time Sync & Analytics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.StoreEngine) {
    console.error('StoreEngine not found! Please ensure store-data.js is loaded.');
    return;
  }

  // --- STATE ---
  let currentView = 'dashboard';
  let activeEditingProductId = 'mini-me';
  let selectedOrderId = null;

  // --- DOM ELEMENTS ---
  const htmlRoot = document.documentElement;
  const adminThemeToggle = document.getElementById('admin-theme-toggle');
  const navBtns = document.querySelectorAll('.nav-item-btn');
  const viewSections = document.querySelectorAll('.view-section');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const adminSidebar = document.getElementById('admin-sidebar');
  const toastContainer = document.getElementById('admin-toast-container');

  // Command Palette Elements
  const topbarSearchTrigger = document.getElementById('topbar-search-trigger');
  const commandPaletteBackdrop = document.getElementById('command-palette-backdrop');
  const commandPaletteInput = document.getElementById('command-palette-input');
  const commandResultsList = document.getElementById('command-results-list');

  // Product Elements
  const productsListTbody = document.getElementById('products-list-tbody');
  const productEditorCard = document.getElementById('product-editor-card');
  const productsSearchInput = document.getElementById('products-search-input');
  const productsStatusFilter = document.getElementById('products-status-filter');
  const prodAddNewBtn = document.getElementById('prod-add-new-btn');
  const editorCancelBtn = document.getElementById('editor-cancel-btn');
  const editorSaveBtn = document.getElementById('editor-save-btn');
  const btnAddImageUrl = document.getElementById('btn-add-image-url');
  const btnAddFigureVariant = document.getElementById('btn-add-figure-variant');
  const editorFigureVariantsList = document.getElementById('editor-figure-variants-list');
  const editorMediaGrid = document.getElementById('editor-media-grid');

  // Customizer Elements
  const customizerSaveAllBtn = document.getElementById('customizer-save-all-btn');
  const customizerReelsList = document.getElementById('customizer-reels-list');
  const customizerReviewsList = document.getElementById('customizer-reviews-list');
  const customizerFaqsList = document.getElementById('customizer-faqs-list');
  const btnAddReelModal = document.getElementById('btn-add-reel-modal');
  const btnAddReviewModal = document.getElementById('btn-add-review-modal');
  const btnAddFaqModal = document.getElementById('btn-add-faq-modal');

  // Orders Elements
  const ordersListTbody = document.getElementById('orders-list-tbody');
  const ordersSearchInput = document.getElementById('orders-search-input');
  const ordersStatusFilter = document.getElementById('orders-status-filter');
  const btnSimulateOrder = document.getElementById('btn-simulate-order');

  // Settings & Backup Elements
  const settingsSaveBtn = document.getElementById('settings-save-btn');
  const btnExportBackupJson = document.getElementById('btn-export-backup-json');
  const fileImportJson = document.getElementById('file-import-json');
  const btnFactoryReset = document.getElementById('btn-factory-reset');
  const quickResetDefaultsBtn = document.getElementById('quick-reset-defaults-btn');

  // ==========================================================================
  // 1. THEME SWITCHER & TOAST SYSTEM
  // ==========================================================================
  const savedAdminTheme = localStorage.getItem('tarelcraft-admin-theme') || 'light';
  applyAdminTheme(savedAdminTheme);

  function applyAdminTheme(theme) {
    htmlRoot.setAttribute('data-admin-theme', theme);
    localStorage.setItem('tarelcraft-admin-theme', theme);
    if (adminThemeToggle) {
      const icon = adminThemeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    }
  }

  if (adminThemeToggle) {
    adminThemeToggle.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-admin-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      applyAdminTheme(next);
      showToast(`Switched to ${next.toUpperCase()} mode!`, 'info');
    });
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    
    let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'warning') iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
    if (type === 'error') iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
    if (type === 'info') iconHtml = '<i class="fa-solid fa-circle-info" style="color:#3B82F6;"></i>';

    toast.innerHTML = `${iconHtml} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 10);
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // ==========================================================================
  // 2. NAVIGATION & ROUTING
  // ==========================================================================
  function switchView(viewId) {
    currentView = viewId;
    window.location.hash = viewId;

    // Update active nav button
    navBtns.forEach(btn => {
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update active section
    viewSections.forEach(section => {
      if (section.id === `view-${viewId}`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    if (adminSidebar.classList.contains('open')) {
      adminSidebar.classList.remove('open');
    }

    // Refresh view data
    renderCurrentView(viewId);
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      adminSidebar.classList.toggle('open');
    });
  }

  // Handle hash on load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(`view-${initialHash}`)) {
    switchView(initialHash);
  } else {
    switchView('dashboard');
  }

  // ==========================================================================
  // 3. VIEW RENDERERS DISPATCHER
  // ==========================================================================
  function renderCurrentView(viewId) {
    const data = StoreEngine.get();
    updateSidebarBadges(data);

    if (viewId === 'dashboard') {
      renderDashboard(data);
    } else if (viewId === 'products') {
      renderProductsList(data);
    } else if (viewId === 'customizer') {
      renderCustomizer(data);
    } else if (viewId === 'orders') {
      renderOrdersList(data);
    } else if (viewId === 'customers') {
      renderCustomersList(data);
    } else if (viewId === 'analytics') {
      renderAnalytics(data);
    } else if (viewId === 'discounts') {
      renderDiscountsList(data);
    } else if (viewId === 'settings') {
      renderSettings(data);
    }
  }

  function updateSidebarBadges(data) {
    const prodBadge = document.getElementById('sidebar-products-count');
    const orderBadge = document.getElementById('sidebar-orders-count');
    if (prodBadge) prodBadge.textContent = (data.products || []).length;
    if (orderBadge) {
      const unfulfilled = (data.orders || []).filter(o => o.status === 'Unfulfilled').length;
      orderBadge.textContent = unfulfilled || (data.orders || []).length;
    }
  }

  // Subscribe to real-time updates from other tabs
  StoreEngine.subscribe((updatedData) => {
    updateSidebarBadges(updatedData);
    renderCurrentView(currentView);
  });

  // ==========================================================================
  // 4. VIEW 1: DASHBOARD
  // ==========================================================================
  function renderDashboard(data) {
    const orders = data.orders || [];
    const products = data.products || [];
    const sym = data.settings.symbols[data.settings.currency] || 'CHF';

    // Calculate metrics
    let totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    document.getElementById('metric-today-revenue').textContent = `${sym} ${totalSales.toFixed(2)}`;
    document.getElementById('metric-today-orders').textContent = orders.length;

    // Render Recent Orders
    const recentTbody = document.getElementById('dash-recent-orders-tbody');
    recentTbody.innerHTML = '';
    const sliceOrders = orders.slice(0, 5);

    if (sliceOrders.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--p-text-subdued);">No orders placed yet.</td></tr>`;
    } else {
      sliceOrders.forEach(ord => {
        const tr = document.createElement('tr');
        const badgeClass = ord.status === 'Fulfilled' ? 'p-badge-success' : 'p-badge-warning';
        tr.innerHTML = `
          <td><strong>${ord.id}</strong></td>
          <td>${ord.customer}</td>
          <td><span style="font-size:0.78rem; color:var(--p-text-subdued);">${ord.items[0]?.variant || 'Custom Figure'}</span></td>
          <td><strong>${sym} ${(parseFloat(ord.total) || 0).toFixed(2)}</strong></td>
          <td><span class="p-badge ${badgeClass}">${ord.status}</span></td>
          <td><span class="p-badge p-badge-info"><i class="fa-brands fa-whatsapp"></i> ${ord.whatsappStatus || 'Pending'}</span></td>
          <td>
            <button class="p-btn p-btn-sm btn-open-order" data-order-id="${ord.id}">
              <i class="fa-solid fa-eye"></i>
            </button>
          </td>
        `;
        recentTbody.appendChild(tr);
      });
    }

    // Bind recent order buttons
    recentTbody.querySelectorAll('.btn-open-order').forEach(btn => {
      btn.addEventListener('click', () => {
        openOrderModal(btn.getAttribute('data-order-id'));
      });
    });

    // Draw Dashboard Chart
    drawSalesChart('sales-trend-canvas', data.analytics.salesTrend || [20, 28, 35, 42, 38, 55, 62, 70]);
  }

  document.getElementById('dash-quick-customizer-btn')?.addEventListener('click', () => switchView('customizer'));
  document.getElementById('dash-quick-new-product-btn')?.addEventListener('click', () => {
    switchView('products');
    openNewProductEditor();
  });
  document.getElementById('dash-view-all-orders-btn')?.addEventListener('click', () => switchView('orders'));

  // ==========================================================================
  // 5. VIEW 2: PRODUCTS CATALOG & FULL CRUD
  // ==========================================================================
  function renderProductsList(data) {
    const products = data.products || [];
    const sym = data.settings.symbols[data.settings.currency] || 'CHF';
    const searchQuery = (productsSearchInput.value || '').toLowerCase().trim();
    const statusFilter = productsStatusFilter.value;

    productsListTbody.innerHTML = '';

    const filtered = products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery) || (p.sku && p.sku.toLowerCase().includes(searchQuery));
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });

    document.getElementById('products-count-badge').textContent = `Showing ${filtered.length} of ${products.length} products`;

    if (filtered.length === 0) {
      productsListTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--p-text-subdued);">No products found matching filters.</td></tr>`;
      return;
    }

    filtered.forEach(prod => {
      const tr = document.createElement('tr');
      const thumb = prod.images && prod.images[0] ? prod.images[0].url : 'assets/images/hero-bobblehead.jpg';
      const statusBadge = prod.status === 'active' ? 'p-badge-success' : (prod.status === 'draft' ? 'p-badge-warning' : 'p-badge-neutral');
      const stockText = prod.trackQuantity ? `${prod.inventoryQty || 0} in stock` : 'Tracking off';

      tr.innerHTML = `
        <td><input type="checkbox" class="prod-check-row" value="${prod.id}"></td>
        <td>
          <div class="product-row-item">
            <img src="${thumb}" alt="${prod.title}" class="product-table-thumb" onerror="this.src='assets/images/hero-bobblehead.jpg'">
            <div class="product-title-cell">
              <h4>${prod.title}</h4>
              <span>SKU: ${prod.sku || 'N/A'} • ${prod.variants?.figureTypes?.length || 4} Figure Types</span>
            </div>
          </div>
        </td>
        <td><span class="p-badge ${statusBadge}">${prod.status}</span></td>
        <td><span style="font-weight:600; color:${prod.inventoryQty < 10 ? '#d72c0d' : 'inherit'};">${stockText}</span></td>
        <td>${prod.category || 'Custom Figures'}</td>
        <td><strong>${sym} ${(parseFloat(prod.basePrice) || 0).toFixed(2)}</strong></td>
        <td><span style="text-decoration:line-through; color:var(--p-text-subdued);">${sym} ${(parseFloat(prod.comparePrice) || 0).toFixed(2)}</span></td>
        <td style="text-align:right;">
          <button class="p-btn p-btn-sm btn-edit-prod" data-id="${prod.id}" title="Edit Product">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button class="p-btn p-btn-sm btn-dup-prod" data-id="${prod.id}" title="Duplicate Product">
            <i class="fa-solid fa-copy"></i>
          </button>
          <button class="p-btn p-btn-sm p-btn-danger btn-del-prod" data-id="${prod.id}" title="Delete Product">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;
      productsListTbody.appendChild(tr);
    });

    // Bind row action events
    productsListTbody.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', () => openProductEditor(btn.getAttribute('data-id')));
    });

    productsListTbody.querySelectorAll('.btn-dup-prod').forEach(btn => {
      btn.addEventListener('click', () => duplicateProduct(btn.getAttribute('data-id')));
    });

    productsListTbody.querySelectorAll('.btn-del-prod').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
    });
  }

  productsSearchInput?.addEventListener('input', () => renderProductsList(StoreEngine.get()));
  productsStatusFilter?.addEventListener('change', () => renderProductsList(StoreEngine.get()));

  // Open Product Editor Drawer
  function openProductEditor(productId) {
    const prod = StoreEngine.getProduct(productId);
    if (!prod) return;

    activeEditingProductId = prod.id;
    document.getElementById('edit-prod-id').value = prod.id;
    document.getElementById('editor-heading-title').textContent = `Edit Product: ${prod.title}`;
    document.getElementById('edit-prod-title').value = prod.title || '';
    document.getElementById('edit-prod-subtitle').value = prod.subtitle || '';
    document.getElementById('edit-prod-handle').value = prod.handle || '';
    document.getElementById('edit-prod-desc').value = prod.description || '';
    document.getElementById('edit-prod-price').value = prod.basePrice || 49.90;
    document.getElementById('edit-prod-compare-price').value = prod.comparePrice || 99.80;
    document.getElementById('edit-prod-cost').value = prod.costPrice || 18.50;
    document.getElementById('edit-prod-status').value = prod.status || 'active';
    document.getElementById('edit-prod-sku').value = prod.sku || '';
    document.getElementById('edit-prod-barcode').value = prod.barcode || '';
    document.getElementById('edit-prod-qty').value = prod.inventoryQty !== undefined ? prod.inventoryQty : 80;
    document.getElementById('edit-prod-track-qty').checked = prod.trackQuantity !== false;
    document.getElementById('edit-prod-category').value = prod.category || '';
    document.getElementById('edit-prod-vendor').value = prod.vendor || '';
    document.getElementById('edit-prod-rating').value = prod.rating || 5.0;
    document.getElementById('edit-prod-reviews-count').value = prod.reviewsCount || 1480;

    // SEO
    document.getElementById('edit-seo-title').value = prod.seo?.title || prod.title;
    document.getElementById('edit-seo-desc').value = prod.seo?.description || prod.subtitle;
    updateSerpPreview();

    // Calculate profit margin
    calculateProfitMargin();

    // Render Media Gallery
    renderEditorMediaGrid(prod.images || []);

    // Render Figure Variants
    renderEditorFigureVariants(prod.variants?.figureTypes || []);

    productEditorCard.style.display = 'block';
    productEditorCard.scrollIntoView({ behavior: 'smooth' });
  }

  function openNewProductEditor() {
    const newId = 'prod-' + Date.now();
    const newProd = {
      id: newId,
      title: 'New Bespoke Personalized Statue',
      handle: 'new-bespoke-statue',
      subtitle: 'Personalized artisan keepsake handcrafted from your photos.',
      status: 'active',
      category: 'Custom Statues',
      vendor: 'Tarelcraft Atelier Zurich',
      rating: 5.0,
      reviewsCount: 1,
      basePrice: 59.90,
      comparePrice: 119.80,
      costPrice: 20.00,
      sku: 'TC-NEW-' + Math.floor(100 + Math.random() * 900),
      barcode: '7640' + Math.floor(100000000 + Math.random() * 900000000),
      trackQuantity: true,
      inventoryQty: 50,
      description: 'Handcrafted master sculpture with lifelike resemblance.',
      images: [
        { id: 'img-1', url: 'assets/images/hero-bobblehead.jpg', alt: 'Hero', isPrimary: true }
      ],
      variants: {
        figureTypes: [
          { id: 'single', name: 'Single Person', subtitle: '1 Figurine', priceModifier: 0, badge: 'Popular', image: 'assets/images/hero-bobblehead.jpg' },
          { id: 'couple', name: 'Couple', subtitle: '2 Figurines', priceModifier: 30.0, badge: '', image: 'assets/images/couple-figure.jpg' }
        ],
        headStyles: [
          { id: 'bobblehead', name: 'Fun Bobblehead', desc: 'Spring-mounted head', priceModifier: 10.0 },
          { id: 'fixed', name: 'Classic Fixed', desc: 'Sculpted solid statue', priceModifier: 0.0 }
        ],
        heights: [
          { id: '18cm', label: '18 cm', subtitle: 'Standard', priceModifier: 0 },
          { id: '20cm', label: '20 cm', subtitle: 'Large', priceModifier: 10 }
        ],
        baseThemes: [
          { id: 'walnut', name: 'Walnut Wood', subtitle: 'Natural', priceModifier: 0 }
        ]
      },
      seo: {
        title: 'New Bespoke Personalized Statue | Tarelcraft',
        description: 'Personalized artisan keepsake handcrafted from your photos.'
      }
    };

    StoreEngine.addProduct(newProd);
    showToast('Created new product template! You can now edit its details.', 'success');
    renderProductsList(StoreEngine.get());
    openProductEditor(newId);
  }

  prodAddNewBtn?.addEventListener('click', openNewProductEditor);
  editorCancelBtn?.addEventListener('click', () => {
    productEditorCard.style.display = 'none';
  });

  // Profit Margin Calculator
  function calculateProfitMargin() {
    const price = parseFloat(document.getElementById('edit-prod-price').value) || 0;
    const cost = parseFloat(document.getElementById('edit-prod-cost').value) || 0;
    const curr = StoreEngine.get().settings.currency;

    if (price > 0) {
      const profit = price - cost;
      const margin = (profit / price) * 100;
      document.getElementById('calc-margin-val').textContent = `${margin.toFixed(1)}%`;
      document.getElementById('calc-profit-val').textContent = `${curr} ${profit.toFixed(2)}`;
    }
  }

  ['edit-prod-price', 'edit-prod-cost'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', calculateProfitMargin);
  });

  // SERP Preview Updates
  function updateSerpPreview() {
    const title = document.getElementById('edit-seo-title').value || document.getElementById('edit-prod-title').value || "Bespoke 'MINI ME'";
    const slug = document.getElementById('edit-prod-handle').value || "bespoke-mini-me-bobblehead";
    const desc = document.getElementById('edit-seo-desc').value || document.getElementById('edit-prod-subtitle').value || "";

    document.getElementById('serp-title-preview').textContent = title;
    document.getElementById('serp-slug-preview').textContent = slug;
    document.getElementById('serp-desc-preview').textContent = desc.substring(0, 150) + (desc.length > 150 ? '...' : '');
  }

  ['edit-prod-title', 'edit-prod-handle', 'edit-seo-title', 'edit-seo-desc', 'edit-prod-subtitle'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateSerpPreview);
  });

  // Render Editor Media Grid
  function renderEditorMediaGrid(images) {
    editorMediaGrid.innerHTML = '';
    images.forEach((img, idx) => {
      const card = document.createElement('div');
      card.className = 'media-thumb-card';
      card.innerHTML = `
        <img src="${img.url}" alt="${img.alt || 'Product Image'}" onerror="this.src='assets/images/hero-bobblehead.jpg'">
        ${img.isPrimary ? '<span class="media-thumb-badge">Primary</span>' : ''}
        <button type="button" class="media-delete-btn" data-img-idx="${idx}" title="Remove Image">&times;</button>
      `;
      editorMediaGrid.appendChild(card);
    });

    editorMediaGrid.querySelectorAll('.media-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-img-idx'), 10);
        const prod = StoreEngine.getProduct(activeEditingProductId);
        if (prod && prod.images.length > 1) {
          prod.images.splice(idx, 1);
          StoreEngine.updateProduct(activeEditingProductId, { images: prod.images });
          renderEditorMediaGrid(prod.images);
          showToast('Image removed.', 'info');
        } else {
          showToast('Product must have at least one media image.', 'warning');
        }
      });
    });
  }

  // Add Image URL
  btnAddImageUrl?.addEventListener('click', () => {
    const url = prompt('Enter the image URL or relative path (e.g. assets/images/hero-bobblehead.jpg):');
    if (url && url.trim()) {
      const prod = StoreEngine.getProduct(activeEditingProductId);
      if (prod) {
        prod.images = prod.images || [];
        prod.images.push({
          id: 'img-' + Date.now(),
          url: url.trim(),
          alt: prod.title,
          isPrimary: prod.images.length === 0
        });
        StoreEngine.updateProduct(activeEditingProductId, { images: prod.images });
        renderEditorMediaGrid(prod.images);
        showToast('Image added successfully!', 'success');
      }
    }
  });

  // Render Editor Figure Variants
  function renderEditorFigureVariants(figureTypes) {
    editorFigureVariantsList.innerHTML = '';
    const sym = StoreEngine.get().settings.symbols[StoreEngine.get().settings.currency] || 'CHF';

    figureTypes.forEach((fig, idx) => {
      const item = document.createElement('div');
      item.className = 'variant-edit-item';
      item.innerHTML = `
        <img src="${fig.image || 'assets/images/hero-bobblehead.jpg'}" alt="${fig.name}" class="variant-edit-thumb" onerror="this.src='assets/images/hero-bobblehead.jpg'">
        <div class="variant-info-fields">
          <input type="text" class="p-input v-name-input" value="${fig.name}" placeholder="Figure Name (e.g. Couple)">
          <div class="input-prefix-wrap">
            <span class="input-prefix">+${sym}</span>
            <input type="number" step="1" class="p-input v-price-input" value="${fig.priceModifier || 0}" placeholder="Extra Price">
          </div>
          <input type="text" class="p-input v-badge-input" value="${fig.badge || ''}" placeholder="Badge (e.g. Popular)">
        </div>
        <button type="button" class="p-btn p-btn-sm p-btn-danger btn-del-variant" data-idx="${idx}" title="Delete Variant">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
      editorFigureVariantsList.appendChild(item);
    });

    editorFigureVariantsList.querySelectorAll('.btn-del-variant').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const prod = StoreEngine.getProduct(activeEditingProductId);
        if (prod && prod.variants.figureTypes.length > 1) {
          prod.variants.figureTypes.splice(idx, 1);
          renderEditorFigureVariants(prod.variants.figureTypes);
          showToast('Variant removed.', 'info');
        } else {
          showToast('Product must have at least one figure type variant.', 'warning');
        }
      });
    });
  }

  // Add Figure Variant
  btnAddFigureVariant?.addEventListener('click', () => {
    const prod = StoreEngine.getProduct(activeEditingProductId);
    if (prod) {
      prod.variants = prod.variants || {};
      prod.variants.figureTypes = prod.variants.figureTypes || [];
      prod.variants.figureTypes.push({
        id: 'fig-' + Date.now(),
        name: 'New Figure Option',
        subtitle: 'Custom Figurines',
        priceModifier: 20.0,
        badge: '',
        image: 'assets/images/hero-bobblehead.jpg'
      });
      renderEditorFigureVariants(prod.variants.figureTypes);
      showToast('Added new figure variant slot.', 'info');
    }
  });

  // Save Product Changes
  editorSaveBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const prodId = document.getElementById('edit-prod-id').value;
    const prod = StoreEngine.getProduct(prodId);
    if (!prod) return;

    // Collect figure types from DOM inputs
    const updatedVariants = [];
    const variantRows = editorFigureVariantsList.querySelectorAll('.variant-edit-item');
    variantRows.forEach((row, i) => {
      const name = row.querySelector('.v-name-input').value;
      const priceModifier = parseFloat(row.querySelector('.v-price-input').value) || 0;
      const badge = row.querySelector('.v-badge-input').value;
      const existing = prod.variants.figureTypes[i] || {};
      updatedVariants.push({
        id: existing.id || 'fig-' + i,
        name: name,
        subtitle: existing.subtitle || 'Figurine Option',
        priceModifier: priceModifier,
        badge: badge,
        image: existing.image || 'assets/images/hero-bobblehead.jpg'
      });
    });

    const updates = {
      title: document.getElementById('edit-prod-title').value.trim(),
      subtitle: document.getElementById('edit-prod-subtitle').value.trim(),
      handle: document.getElementById('edit-prod-handle').value.trim(),
      description: document.getElementById('edit-prod-desc').value.trim(),
      basePrice: parseFloat(document.getElementById('edit-prod-price').value) || 49.90,
      comparePrice: parseFloat(document.getElementById('edit-prod-compare-price').value) || 99.80,
      costPrice: parseFloat(document.getElementById('edit-prod-cost').value) || 18.50,
      status: document.getElementById('edit-prod-status').value,
      sku: document.getElementById('edit-prod-sku').value.trim(),
      barcode: document.getElementById('edit-prod-barcode').value.trim(),
      inventoryQty: parseInt(document.getElementById('edit-prod-qty').value, 10) || 0,
      trackQuantity: document.getElementById('edit-prod-track-qty').checked,
      category: document.getElementById('edit-prod-category').value.trim(),
      vendor: document.getElementById('edit-prod-vendor').value.trim(),
      rating: parseFloat(document.getElementById('edit-prod-rating').value) || 5.0,
      reviewsCount: parseInt(document.getElementById('edit-prod-reviews-count').value, 10) || 1480,
      variants: Object.assign({}, prod.variants, { figureTypes: updatedVariants }),
      seo: {
        title: document.getElementById('edit-seo-title').value.trim(),
        description: document.getElementById('edit-seo-desc').value.trim()
      }
    };

    StoreEngine.updateProduct(prodId, updates);
    showToast(`Product '${updates.title}' updated successfully!`, 'success');
    renderProductsList(StoreEngine.get());
    productEditorCard.style.display = 'none';
  });

  // Duplicate Product Helper
  function duplicateProduct(prodId) {
    const prod = StoreEngine.getProduct(prodId);
    if (!prod) return;

    const dup = JSON.parse(JSON.stringify(prod));
    dup.id = 'prod-' + Date.now();
    dup.title = prod.title + ' (Copy)';
    dup.handle = prod.handle + '-copy';
    dup.sku = (prod.sku || 'TC-MINI') + '-CPY';
    dup.status = 'draft';

    StoreEngine.addProduct(dup);
    showToast(`Product duplicated as draft!`, 'success');
    renderProductsList(StoreEngine.get());
  }

  // Delete Product Helper
  function deleteProduct(prodId) {
    if (confirm('Are you sure you want to permanently delete this product?')) {
      try {
        StoreEngine.deleteProduct(prodId);
        showToast('Product deleted.', 'info');
        renderProductsList(StoreEngine.get());
        if (activeEditingProductId === prodId) {
          productEditorCard.style.display = 'none';
        }
      } catch (err) {
        showToast(err.message, 'warning');
      }
    }
  }

  // ==========================================================================
  // 6. VIEW 3: LIVE PAGE CUSTOMIZER
  // ==========================================================================
  function renderCustomizer(data) {
    // 1. Announcement Bar
    document.getElementById('cust-announce-badge').value = data.announcement.badge || 'LIMITED DEAL';
    document.getElementById('cust-announce-cta').value = data.announcement.ctaText || 'Learn How It Works →';
    document.getElementById('cust-announce-text').value = data.announcement.text || '';

    // 2. Video Reels List
    renderCustomizerReels(data.reels || []);

    // 3. Customer Reviews List
    renderCustomizerReviews(data.reviews || []);

    // 4. FAQs List
    renderCustomizerFaqs(data.faqs || []);
  }

  // Accordion toggle behavior
  document.querySelectorAll('.customizer-panel-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('expanded');
    });
  });

  // Render Customizer Reels
  function renderCustomizerReels(reels) {
    customizerReelsList.innerHTML = '';
    reels.forEach((reel, idx) => {
      const card = document.createElement('div');
      card.className = 'item-crud-card';
      card.innerHTML = `
        <div class="item-crud-header">
          <strong><i class="fa-solid fa-video" style="color:#f59e0b; margin-right:6px;"></i> Reel #${idx + 1}: ${reel.title}</strong>
          <div>
            <button type="button" class="p-btn p-btn-sm btn-edit-reel" data-id="${reel.id}">Edit</button>
            <button type="button" class="p-btn p-btn-sm p-btn-danger btn-del-reel" data-id="${reel.id}">&times;</button>
          </div>
        </div>
        <p style="font-size:0.82rem; color:var(--p-text-subdued); font-style:italic;">${reel.desc}</p>
        <span style="font-size:0.75rem; color:var(--p-text-disabled);"><i class="fa-solid fa-link"></i> ${reel.video}</span>
      `;
      customizerReelsList.appendChild(card);
    });

    customizerReelsList.querySelectorAll('.btn-edit-reel').forEach(btn => {
      btn.addEventListener('click', () => openEditReelModal(btn.getAttribute('data-id')));
    });

    customizerReelsList.querySelectorAll('.btn-del-reel').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this video reel?')) {
          StoreEngine.deleteReel(btn.getAttribute('data-id'));
          showToast('Reel deleted.', 'info');
          renderCustomizerReels(StoreEngine.getReels());
        }
      });
    });
  }

  // Render Customizer Reviews
  function renderCustomizerReviews(reviews) {
    customizerReviewsList.innerHTML = '';
    reviews.forEach((rev, idx) => {
      const card = document.createElement('div');
      card.className = 'item-crud-card';
      const stars = '★'.repeat(rev.rating || 5);
      card.innerHTML = `
        <div class="item-crud-header">
          <div>
            <strong style="color:var(--p-text);">${rev.name} (${rev.location || 'Switzerland'})</strong>
            <span style="color:#f59e0b; margin-left:6px;">${stars}</span>
          </div>
          <div>
            <button type="button" class="p-btn p-btn-sm btn-edit-rev" data-id="${rev.id}">Edit</button>
            <button type="button" class="p-btn p-btn-sm p-btn-danger btn-del-rev" data-id="${rev.id}">&times;</button>
          </div>
        </div>
        <h5 style="font-size:0.85rem; font-weight:700;">"${rev.title}"</h5>
        <p style="font-size:0.8rem; color:var(--p-text-subdued);">${rev.text}</p>
      `;
      customizerReviewsList.appendChild(card);
    });

    customizerReviewsList.querySelectorAll('.btn-edit-rev').forEach(btn => {
      btn.addEventListener('click', () => openEditReviewModal(btn.getAttribute('data-id')));
    });

    customizerReviewsList.querySelectorAll('.btn-del-rev').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this customer review?')) {
          StoreEngine.deleteReview(btn.getAttribute('data-id'));
          showToast('Review deleted.', 'info');
          renderCustomizerReviews(StoreEngine.getReviews());
        }
      });
    });
  }

  // Render Customizer FAQs
  function renderCustomizerFaqs(faqs) {
    customizerFaqsList.innerHTML = '';
    faqs.forEach((faq, idx) => {
      const card = document.createElement('div');
      card.className = 'item-crud-card';
      card.innerHTML = `
        <div class="item-crud-header">
          <strong>Q${idx + 1}: ${faq.question}</strong>
          <div>
            <button type="button" class="p-btn p-btn-sm btn-edit-faq" data-id="${faq.id}">Edit</button>
            <button type="button" class="p-btn p-btn-sm p-btn-danger btn-del-faq" data-id="${faq.id}">&times;</button>
          </div>
        </div>
        <p style="font-size:0.8rem; color:var(--p-text-subdued);">${faq.answer}</p>
      `;
      customizerFaqsList.appendChild(card);
    });

    customizerFaqsList.querySelectorAll('.btn-edit-faq').forEach(btn => {
      btn.addEventListener('click', () => openEditFaqModal(btn.getAttribute('data-id')));
    });

    customizerFaqsList.querySelectorAll('.btn-del-faq').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this FAQ question?')) {
          StoreEngine.deleteFaq(btn.getAttribute('data-id'));
          showToast('FAQ deleted.', 'info');
          renderCustomizerFaqs(StoreEngine.getFaqs());
        }
      });
    });
  }

  // Save All Customizer Changes
  customizerSaveAllBtn?.addEventListener('click', () => {
    const store = StoreEngine.get();
    store.announcement = {
      enabled: true,
      badge: document.getElementById('cust-announce-badge').value.trim(),
      ctaText: document.getElementById('cust-announce-cta').value.trim(),
      ctaLink: '#how-it-works',
      text: document.getElementById('cust-announce-text').value.trim()
    };

    StoreEngine.set(store);
    showToast('Landing page customizations saved! Storefront updated.', 'success');
  });

  // Modal Handlers for Reel, Review, FAQ
  function openModal(id) {
    document.getElementById(id)?.classList.add('active');
  }

  function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Reel Modal
  btnAddReelModal?.addEventListener('click', () => {
    document.getElementById('reel-edit-id').value = '';
    document.getElementById('modal-reel-title').textContent = 'Add UGC Video Reel';
    document.getElementById('reel-buyer-name').value = '';
    document.getElementById('reel-tag-label').value = 'Verified Buyer';
    document.getElementById('reel-quote').value = '';
    document.getElementById('reel-video-url').value = 'assets/videos/unboxing-1.mp4';
    document.getElementById('reel-poster-url').value = 'assets/images/unboxing-1.jpg';
    openModal('modal-reel-backdrop');
  });

  function openEditReelModal(id) {
    const reel = StoreEngine.getReels().find(r => r.id === id);
    if (!reel) return;
    document.getElementById('reel-edit-id').value = reel.id;
    document.getElementById('modal-reel-title').textContent = 'Edit UGC Video Reel';
    document.getElementById('reel-buyer-name').value = reel.title || '';
    document.getElementById('reel-tag-label').value = reel.tag || '';
    document.getElementById('reel-quote').value = reel.desc || '';
    document.getElementById('reel-video-url').value = reel.video || '';
    document.getElementById('reel-poster-url').value = reel.poster || '';
    openModal('modal-reel-backdrop');
  }

  document.getElementById('btn-save-reel')?.addEventListener('click', (e) => {
    e.preventDefault();
    const id = document.getElementById('reel-edit-id').value;
    const reelData = {
      title: document.getElementById('reel-buyer-name').value.trim(),
      tag: document.getElementById('reel-tag-label').value.trim(),
      desc: document.getElementById('reel-quote').value.trim(),
      video: document.getElementById('reel-video-url').value.trim(),
      cdnVideo: document.getElementById('reel-video-url').value.trim(),
      poster: document.getElementById('reel-poster-url').value.trim() || 'assets/images/unboxing-1.jpg',
      views: '12.4k',
      likes: '1.1k'
    };

    if (!reelData.title || !reelData.desc) {
      showToast('Please fill in buyer name and quote.', 'warning');
      return;
    }

    if (id) {
      StoreEngine.updateReel(id, reelData);
      showToast('Video reel updated!', 'success');
    } else {
      StoreEngine.addReel(reelData);
      showToast('New video reel added!', 'success');
    }
    closeModal('modal-reel-backdrop');
    renderCustomizerReels(StoreEngine.getReels());
  });

  // Review Modal
  btnAddReviewModal?.addEventListener('click', () => {
    document.getElementById('review-edit-id').value = '';
    document.getElementById('modal-review-title').textContent = 'Add Customer Review';
    document.getElementById('rev-author-name').value = '';
    document.getElementById('rev-location').value = 'Zurich, Switzerland';
    document.getElementById('rev-rating').value = '5';
    document.getElementById('rev-figure-type').value = 'Couple 20cm Bobblehead';
    document.getElementById('rev-headline').value = '';
    document.getElementById('rev-text').value = '';
    openModal('modal-review-backdrop');
  });

  function openEditReviewModal(id) {
    const rev = StoreEngine.getReviews().find(r => r.id === id);
    if (!rev) return;
    document.getElementById('review-edit-id').value = rev.id;
    document.getElementById('modal-review-title').textContent = 'Edit Customer Review';
    document.getElementById('rev-author-name').value = rev.name || '';
    document.getElementById('rev-location').value = rev.location || '';
    document.getElementById('rev-rating').value = String(rev.rating || 5);
    document.getElementById('rev-figure-type').value = rev.figureType || '';
    document.getElementById('rev-headline').value = rev.title || '';
    document.getElementById('rev-text').value = rev.text || '';
    openModal('modal-review-backdrop');
  }

  document.getElementById('btn-save-review')?.addEventListener('click', (e) => {
    e.preventDefault();
    const id = document.getElementById('review-edit-id').value;
    const revData = {
      name: document.getElementById('rev-author-name').value.trim(),
      location: document.getElementById('rev-location').value.trim(),
      rating: parseInt(document.getElementById('rev-rating').value, 10) || 5,
      figureType: document.getElementById('rev-figure-type').value.trim(),
      title: document.getElementById('rev-headline').value.trim(),
      text: document.getElementById('rev-text').value.trim(),
      date: 'Just now',
      verified: true,
      likes: Math.floor(10 + Math.random() * 30)
    };

    if (!revData.name || !revData.text) {
      showToast('Please fill in customer name and text.', 'warning');
      return;
    }

    if (id) {
      StoreEngine.updateReview(id, revData);
      showToast('Review updated!', 'success');
    } else {
      StoreEngine.addReview(revData);
      showToast('New customer review added!', 'success');
    }
    closeModal('modal-review-backdrop');
    renderCustomizerReviews(StoreEngine.getReviews());
  });

  // FAQ Modal
  btnAddFaqModal?.addEventListener('click', () => {
    document.getElementById('faq-edit-id').value = '';
    document.getElementById('modal-faq-title').textContent = 'Add FAQ Item';
    document.getElementById('faq-question').value = '';
    document.getElementById('faq-answer').value = '';
    openModal('modal-faq-backdrop');
  });

  function openEditFaqModal(id) {
    const faq = StoreEngine.getFaqs().find(f => f.id === id);
    if (!faq) return;
    document.getElementById('faq-edit-id').value = faq.id;
    document.getElementById('modal-faq-title').textContent = 'Edit FAQ Item';
    document.getElementById('faq-question').value = faq.question || '';
    document.getElementById('faq-answer').value = faq.answer || '';
    openModal('modal-faq-backdrop');
  }

  document.getElementById('btn-save-faq')?.addEventListener('click', (e) => {
    e.preventDefault();
    const id = document.getElementById('faq-edit-id').value;
    const faqData = {
      question: document.getElementById('faq-question').value.trim(),
      answer: document.getElementById('faq-answer').value.trim()
    };

    if (!faqData.question || !faqData.answer) {
      showToast('Please fill in question and answer.', 'warning');
      return;
    }

    if (id) {
      StoreEngine.updateFaq(id, faqData);
      showToast('FAQ updated!', 'success');
    } else {
      StoreEngine.addFaq(faqData);
      showToast('New FAQ added!', 'success');
    }
    closeModal('modal-faq-backdrop');
    renderCustomizerFaqs(StoreEngine.getFaqs());
  });

  // ==========================================================================
  // 7. VIEW 4: ORDERS MANAGER
  // ==========================================================================
  function renderOrdersList(data) {
    const orders = data.orders || [];
    const sym = data.settings.symbols[data.settings.currency] || 'CHF';
    const searchQuery = (ordersSearchInput.value || '').toLowerCase().trim();
    const statusFilter = ordersStatusFilter.value;

    ordersListTbody.innerHTML = '';

    const filtered = orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(searchQuery) || o.customer.toLowerCase().includes(searchQuery);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });

    document.getElementById('orders-count-label').textContent = `${filtered.length} orders`;

    if (filtered.length === 0) {
      ordersListTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--p-text-subdued);">No orders found.</td></tr>`;
      return;
    }

    filtered.forEach(ord => {
      const tr = document.createElement('tr');
      const fulfillBadge = ord.status === 'Fulfilled' ? 'p-badge-success' : 'p-badge-warning';

      tr.innerHTML = `
        <td><strong>${ord.id}</strong></td>
        <td><span style="font-size:0.78rem; color:var(--p-text-subdued);">${ord.date}</span></td>
        <td>
          <div style="font-weight:700;">${ord.customer}</div>
          <span style="font-size:0.75rem; color:var(--p-text-subdued);">${ord.phone || ''}</span>
        </td>
        <td><strong>${sym} ${(parseFloat(ord.total) || 0).toFixed(2)}</strong></td>
        <td><span class="p-badge p-badge-success">${ord.paymentStatus || 'Paid'}</span></td>
        <td><span class="p-badge ${fulfillBadge}">${ord.status}</span></td>
        <td><span class="p-badge p-badge-info"><i class="fa-brands fa-whatsapp"></i> ${ord.whatsappStatus || 'Pending'}</span></td>
        <td style="text-align:right;">
          <button class="p-btn p-btn-sm btn-view-ord" data-id="${ord.id}">
            <i class="fa-solid fa-eye"></i> View
          </button>
        </td>
      `;
      ordersListTbody.appendChild(tr);
    });

    ordersListTbody.querySelectorAll('.btn-view-ord').forEach(btn => {
      btn.addEventListener('click', () => openOrderModal(btn.getAttribute('data-id')));
    });
  }

  ordersSearchInput?.addEventListener('input', () => renderOrdersList(StoreEngine.get()));
  ordersStatusFilter?.addEventListener('change', () => renderOrdersList(StoreEngine.get()));

  function openOrderModal(orderId) {
    const ord = StoreEngine.getOrders().find(o => o.id === orderId);
    if (!ord) return;
    selectedOrderId = ord.id;
    const sym = StoreEngine.get().settings.symbols[StoreEngine.get().settings.currency] || 'CHF';

    document.getElementById('modal-order-title').textContent = `Order ${ord.id} Details`;
    document.getElementById('modal-order-body').innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--p-border-subdued);">
        <div>
          <h4 style="font-size:1rem; font-weight:700;">${ord.customer}</h4>
          <span style="font-size:0.8rem; color:var(--p-text-subdued);">${ord.email} • ${ord.phone}</span>
        </div>
        <div style="text-align:right;">
          <span class="p-badge ${ord.status === 'Fulfilled' ? 'p-badge-success' : 'p-badge-warning'}">${ord.status}</span>
          <div style="font-size:1.1rem; font-weight:800; color:var(--p-primary); margin-top:4px;">${sym} ${(parseFloat(ord.total) || 0).toFixed(2)}</div>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <h5 style="font-size:0.85rem; font-weight:700; margin-bottom:8px;">Ordered Items</h5>
        <div style="background:var(--p-surface-subdued); border:1px solid var(--p-border-subdued); border-radius:var(--p-radius-md); padding:12px;">
          ${(ord.items || []).map(it => `
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
              <span><strong>${it.qty}x</strong> ${it.title} (${it.variant})</span>
              <strong>${sym} ${(parseFloat(it.price) || 0).toFixed(2)}</strong>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <h5 style="font-size:0.85rem; font-weight:700; margin-bottom:6px;"><i class="fa-brands fa-whatsapp" style="color:#25d366;"></i> WhatsApp Concierge Tracking</h5>
        <p style="font-size:0.82rem; color:var(--p-text-subdued);">Status: <strong>${ord.whatsappStatus || 'Draft in progress'}</strong></p>
        <p style="font-size:0.82rem; color:var(--p-text-subdued);">Customer Engraving / Notes: <em>"${ord.notes || 'None'}"</em></p>
      </div>

      <div>
        <h5 style="font-size:0.85rem; font-weight:700; margin-bottom:6px;"><i class="fa-solid fa-location-dot" style="color:#008060;"></i> Shipping Address</h5>
        <p style="font-size:0.82rem; color:var(--p-text);">${ord.shippingAddress || 'Zurich, Switzerland'}</p>
      </div>
    `;

    openModal('modal-order-details');
  }

  document.getElementById('btn-order-fulfill-toggle')?.addEventListener('click', () => {
    if (!selectedOrderId) return;
    const ord = StoreEngine.getOrders().find(o => o.id === selectedOrderId);
    if (ord) {
      const nextStatus = ord.status === 'Fulfilled' ? 'Unfulfilled' : 'Fulfilled';
      const nextWa = nextStatus === 'Fulfilled' ? 'Approved & Shipped' : 'Proof Sent (Awaiting Approval)';
      StoreEngine.updateOrder(selectedOrderId, { status: nextStatus, whatsappStatus: nextWa });
      showToast(`Order ${selectedOrderId} marked as ${nextStatus}!`, 'success');
      closeModal('modal-order-details');
      renderOrdersList(StoreEngine.get());
    }
  });

  // Simulate New Order
  btnSimulateOrder?.addEventListener('click', () => {
    const names = ['Fabienne Keller', 'Nico Rossi', 'Laura Schmid', 'Reto Brunner', 'Camille Martin'];
    const cities = ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lugano'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const prod = StoreEngine.getProduct('mini-me');
    const price = prod ? prod.basePrice + 30.0 : 79.90;

    const newOrder = {
      customer: randomName,
      email: randomName.toLowerCase().replace(' ', '.') + '@swissmail.ch',
      phone: '+41 78 ' + Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(10 + Math.random() * 90) + ' ' + Math.floor(10 + Math.random() * 90),
      items: [
        { title: prod ? prod.title : "Bespoke 'MINI ME' Figurine", variant: 'Couple • 20cm • Bobblehead', qty: 1, price: price }
      ],
      total: price,
      currency: StoreEngine.get().settings.currency,
      status: 'Unfulfilled',
      paymentStatus: 'Paid',
      whatsappStatus: 'Photos Received (Atelier Sculpting)',
      notes: 'Gift order for birthday anniversary',
      shippingAddress: `Poststrasse ${Math.floor(1 + Math.random() * 80)}, ${randomCity}, Switzerland`
    };

    StoreEngine.addOrder(newOrder);
    showToast(`🎉 New order received from ${randomName} (${StoreEngine.get().settings.currency} ${price.toFixed(2)})!`, 'success');
    renderOrdersList(StoreEngine.get());
  });

  // ==========================================================================
  // 8. VIEW 5: CUSTOMERS CRM
  // ==========================================================================
  function renderCustomersList(data) {
    const tbody = document.getElementById('customers-list-tbody');
    const customers = data.customers || [];
    const sym = data.settings.symbols[data.settings.currency] || 'CHF';

    tbody.innerHTML = '';
    customers.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.name}</strong></td>
        <td>${c.email}</td>
        <td>${c.phone}</td>
        <td>${c.city}</td>
        <td><span class="p-badge p-badge-neutral">${c.ordersCount} orders</span></td>
        <td><strong>${sym} ${(parseFloat(c.totalSpent) || 0).toFixed(2)}</strong></td>
        <td><span class="p-badge ${c.status.includes('VIP') ? 'p-badge-info' : 'p-badge-success'}">${c.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================================================
  // 9. VIEW 6: ANALYTICS & CANVAS CHARTS
  // ==========================================================================
  function renderAnalytics(data) {
    drawSalesChart('analytics-full-canvas', data.analytics.salesTrend || [18, 24, 21, 35, 29, 44, 48, 52, 49, 61, 58, 68, 74, 82]);
  }

  function drawSalesChart(canvasId, trendData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio || 600;
    canvas.height = (rect.height || 240) * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = rect.width;
    const h = rect.height || 240;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(...trendData, 100);
    const minVal = 0;
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Draw gridlines
    ctx.strokeStyle = '#e1e3e5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
    }
    ctx.stroke();

    // Generate Points
    const points = trendData.map((val, idx) => {
      const x = padding.left + (chartW / (trendData.length - 1)) * idx;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      return { x, y };
    });

    // Draw Gradient Area
    const grad = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    grad.addColorStop(0, 'rgba(0, 128, 96, 0.25)');
    grad.addColorStop(1, 'rgba(0, 128, 96, 0.01)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = '#008060';
    ctx.lineWidth = 3;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();

    // Draw Point Dots
    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#008060';
      ctx.stroke();
    });
  }

  // ==========================================================================
  // 10. VIEW 7: DISCOUNTS
  // ==========================================================================
  function renderDiscountsList(data) {
    const tbody = document.getElementById('discounts-list-tbody');
    const discounts = data.discounts || [];
    tbody.innerHTML = '';

    discounts.forEach(d => {
      const tr = document.createElement('tr');
      const valText = d.type === 'percentage' ? `${d.value}% OFF` : (d.type === 'fixed' ? `${data.settings.currency} ${d.value} OFF` : 'Free Shipping');
      tr.innerHTML = `
        <td><strong style="font-family:monospace; background:var(--p-surface-subdued); padding:2px 8px; border-radius:4px;">${d.code}</strong></td>
        <td>${d.title}</td>
        <td><span class="p-badge p-badge-neutral">${d.type}</span></td>
        <td><strong>${valText}</strong></td>
        <td><span class="p-badge p-badge-success">${d.status}</span></td>
        <td>${d.uses || 0} times</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('btn-create-discount')?.addEventListener('click', () => {
    const code = prompt('Enter promo discount code (e.g. VIP20):');
    if (code && code.trim()) {
      const store = StoreEngine.get();
      store.discounts = store.discounts || [];
      store.discounts.push({
        id: 'disc-' + Date.now(),
        code: code.trim().toUpperCase(),
        type: 'percentage',
        value: 20,
        title: '20% Off Promotion',
        status: 'Active',
        uses: 0
      });
      StoreEngine.set(store);
      showToast(`Coupon ${code.toUpperCase()} created!`, 'success');
      renderDiscountsList(store);
    }
  });

  // ==========================================================================
  // 11. VIEW 8: SETTINGS, EXPORT / IMPORT, FACTORY RESET
  // ==========================================================================
  function renderSettings(data) {
    document.getElementById('set-store-name').value = data.settings.storeName || 'TARELCRAFT';
    document.getElementById('set-store-tagline').value = data.settings.storeTagline || '';
    document.getElementById('set-whatsapp-num').value = data.settings.whatsappNumber || '';
    document.getElementById('set-support-email').value = data.settings.supportEmail || '';
    document.getElementById('set-default-currency').value = data.settings.currency || 'CHF';
    document.getElementById('set-rate-eur').value = data.settings.rates?.EUR || 1.05;
    document.getElementById('set-rate-usd').value = data.settings.rates?.USD || 1.15;
  }

  settingsSaveBtn?.addEventListener('click', () => {
    const store = StoreEngine.get();
    store.settings.storeName = document.getElementById('set-store-name').value.trim();
    store.settings.storeTagline = document.getElementById('set-store-tagline').value.trim();
    store.settings.whatsappNumber = document.getElementById('set-whatsapp-num').value.trim();
    store.settings.supportEmail = document.getElementById('set-support-email').value.trim();
    store.settings.currency = document.getElementById('set-default-currency').value;
    store.settings.rates.EUR = parseFloat(document.getElementById('set-rate-eur').value) || 1.05;
    store.settings.rates.USD = parseFloat(document.getElementById('set-rate-usd').value) || 1.15;

    StoreEngine.set(store);
    showToast('Store settings saved successfully!', 'success');
  });

  // Export Store Data JSON
  btnExportBackupJson?.addEventListener('click', () => {
    const jsonStr = StoreEngine.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarelcraft-store-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Store JSON backup downloaded!', 'success');
  });

  // Import Store Data JSON
  fileImportJson?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = StoreEngine.importJSON(event.target.result);
      if (res.success) {
        showToast('Store data imported successfully!', 'success');
        renderCurrentView(currentView);
      } else {
        showToast(`Import failed: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
  });

  // Factory Reset
  function handleFactoryReset() {
    if (confirm('⚠️ WARNING: This will erase all customizations and restore the original store defaults. Continue?')) {
      StoreEngine.resetToDefaults();
      showToast('Store reset to factory demo data!', 'info');
      renderCurrentView(currentView);
    }
  }

  btnFactoryReset?.addEventListener('click', handleFactoryReset);
  quickResetDefaultsBtn?.addEventListener('click', handleFactoryReset);

  // ==========================================================================
  // 12. GLOBAL COMMAND PALETTE (CTRL+K)
  // ==========================================================================
  topbarSearchTrigger?.addEventListener('click', () => {
    commandPaletteBackdrop.classList.add('active');
    commandPaletteInput.focus();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      commandPaletteBackdrop.classList.toggle('active');
      if (commandPaletteBackdrop.classList.contains('active')) {
        commandPaletteInput.focus();
      }
    }
    if (e.key === 'Escape' && commandPaletteBackdrop.classList.contains('active')) {
      commandPaletteBackdrop.classList.remove('active');
    }
  });

  commandPaletteBackdrop?.addEventListener('click', (e) => {
    if (e.target === commandPaletteBackdrop) {
      commandPaletteBackdrop.classList.remove('active');
    }
  });

  commandResultsList?.querySelectorAll('.command-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      commandPaletteBackdrop.classList.remove('active');
      if (action.startsWith('view-')) {
        const targetView = action.replace('view-', '');
        switchView(targetView);
      } else if (action === 'open-storefront') {
        window.open('index.html', '_blank');
      }
    });
  });

  commandPaletteInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    commandResultsList.querySelectorAll('.command-result-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? 'flex' : 'none';
    });
  });

});
