/* ==========================================================================
   TARELCRAFT STORE DATA ENGINE & REACTIVE STORE
   Single Source of Truth with Real-Time LocalStorage Sync
   ========================================================================== */

(function(window) {
  const STORAGE_KEY = 'tarelcraft_store_data';

  const DEFAULT_STORE_DATA = {
    settings: {
      storeName: 'TARELCRAFT',
      storeTagline: 'Bespoke Handmade Artisan Figurines & Bobbleheads',
      currency: 'CHF',
      rates: { CHF: 1.0, EUR: 1.05, USD: 1.15 },
      symbols: { CHF: 'CHF', EUR: '€', USD: '$' },
      whatsappNumber: '+41 79 123 45 67',
      supportEmail: 'concierge@tarelcraft.com',
      liveVisitorsCount: 38,
      theme: 'light',
      freeShippingThreshold: 75.0,
      vatPercent: 7.7
    },

    announcement: {
      enabled: true,
      badge: 'LIMITED DEAL',
      text: '2-For-1 Offer Active + 100% Free WhatsApp Preview & Unlimited Revisions Included!',
      ctaText: 'Learn How It Works →',
      ctaLink: '#how-it-works'
    },

    products: [
      {
        id: 'mini-me',
        title: "Handcrafted Custom 'MINI ME' Figurine & Bobblehead",
        handle: 'bespoke-mini-me-bobblehead',
        subtitle: 'Turn any photo into a detailed, museum-quality personalized figurine. Made by master artisans with lifelike expressions and premium materials.',
        status: 'active', // active, draft, archived
        category: 'Custom Bobbleheads',
        vendor: 'Tarelcraft Atelier Zurich',
        rating: 5.0,
        reviewsCount: 1480,
        basePrice: 49.90,
        comparePrice: 99.80,
        costPrice: 18.50,
        sku: 'TC-MINI-001',
        barcode: '7640123456789',
        trackQuantity: true,
        inventoryQty: 84,
        description: 'Every bespoke figurine is hand-sculpted using premium polymer clay and high-grade resin. We capture distinct facial features, hairstyles, clothing, and poses directly from your reference photos.',
        images: [
          { id: 'img-1', url: 'assets/images/hero-bobblehead.jpg', alt: 'Single Custom Bobblehead', type: 'single', isPrimary: true },
          { id: 'img-2', url: 'assets/images/couple-figure.jpg', alt: 'Couple Custom Figurine', type: 'couple', isPrimary: false },
          { id: 'img-3', url: 'assets/images/pet-figure.jpg', alt: 'With Pet Custom Figurine', type: 'pet', isPrimary: false },
          { id: 'img-4', url: 'assets/images/family-figure.jpg', alt: 'Family Group Custom Figurine', type: 'family', isPrimary: false }
        ],
        variants: {
          figureTypes: [
            { id: 'single', name: 'Single Person', subtitle: '1 Figurine', priceModifier: 0, badge: 'Popular', image: 'assets/images/hero-bobblehead.jpg' },
            { id: 'couple', name: 'Couple', subtitle: '2 Figurines', priceModifier: 30.0, badge: '', image: 'assets/images/couple-figure.jpg' },
            { id: 'pet', name: 'With Pet', subtitle: 'Person + Pet', priceModifier: 15.0, badge: '', image: 'assets/images/pet-figure.jpg' },
            { id: 'family', name: 'Family/Group', subtitle: '3+ Figurines', priceModifier: 60.0, badge: 'Family Pack', image: 'assets/images/family-figure.jpg' }
          ],
          headStyles: [
            { id: 'fixed', name: 'Fixed Head', desc: 'Head stays fixed.', priceModifier: 0.0, badge: '', icon: 'fa-monument' },
            { id: 'bobblehead', name: 'BobbleHead', desc: 'Moves naturally when touched.', priceModifier: 12.0, badge: '★ CUSTOMER FAVORITE', icon: 'fa-face-laugh-beam' }
          ],
          heights: [
            { id: '18cm', label: '18cm', subtitle: 'Included', priceModifier: 0, badge: '' },
            { id: '20cm', label: '20cm', subtitle: '+ $12', priceModifier: 12.0, badge: 'POPULAR' },
            { id: '22cm', label: '22cm', subtitle: '+ $24', priceModifier: 24.0, badge: 'Most lifelike' }
          ],
          baseThemes: [
            { id: 'walnut', name: 'Walnut Wood', subtitle: 'Warm Natural', priceModifier: 0 },
            { id: 'acrylic', name: 'Black Crystal', subtitle: 'Modern Gloss', priceModifier: 5.0 },
            { id: 'heart', name: 'Romantic Heart', subtitle: 'Love Edition', priceModifier: 5.0 },
            { id: 'soccer', name: 'Sports / Soccer', subtitle: 'Pitch Field', priceModifier: 5.0 }
          ]
        },
        seo: {
          title: "Bespoke 'MINI ME' Custom Bobblehead & Figurine | Tarelcraft",
          description: 'Handcrafted personalized Mini Me bobbleheads and figurines made from your photos. Free WhatsApp preview before production, unlimited revisions, and stress-free photo upload after checkout.',
          keywords: 'custom bobblehead, personalized figurine, mini me, handmade clay figure, wedding cake topper'
        }
      }
    ],

    reels: [
      {
        id: 'reel-1',
        video: 'assets/videos/unboxing-1.mp4',
        cdnVideo: 'https://tarelcraft.com/cdn/shop/videos/c/vp/60f6bbcf350f44228c57ce5410424d05/60f6bbcf350f44228c57ce5410424d05.HD-1080p-7.2Mbps-50901326.mp4?v=0',
        poster: 'assets/images/unboxing-1.jpg',
        title: 'Emily R. • Zurich',
        tag: 'Verified Buyer',
        desc: '"The WhatsApp preview was so reassuring! Resemblance blew me away! 😭✨"',
        views: '14.2k',
        likes: '1.2k'
      },
      {
        id: 'reel-2',
        video: 'assets/videos/unboxing-2.mp4',
        cdnVideo: 'https://tarelcraft.com/cdn/shop/videos/c/vp/ea4909b6b23b4e46875a3cc0b2c6970a/ea4909b6b23b4e46875a3cc0b2c6970a.HD-1080p-7.2Mbps-83368704.mp4?v=0',
        poster: 'assets/images/unboxing-2.jpg',
        title: 'Liam & Sarah • Bern',
        tag: 'Anniversary Gift',
        desc: '"Uploaded photos on WhatsApp after order. Best anniversary keepsake ever!"',
        views: '28.9k',
        likes: '3.4k'
      },
      {
        id: 'reel-3',
        video: 'assets/videos/unboxing-3.mp4',
        cdnVideo: 'https://tarelcraft.com/cdn/shop/videos/c/vp/ea8367eefbb84d70925e3c9160f73a6a/ea8367eefbb84d70925e3c9160f73a6a.HD-1080p-7.2Mbps-86226255.mp4?v=0',
        poster: 'assets/images/unboxing-3.jpg',
        title: 'Sarah for Dad Arthur • Geneva',
        tag: 'Retirement Keepsake',
        desc: '"Dad cried tears of joy! Artist made 2 hair tweaks on WhatsApp for free."',
        views: '19.5k',
        likes: '2.1k'
      }
    ],

    reviews: [
      {
        id: 'rev-1',
        name: 'Marc & Elena S.',
        location: 'Zurich, Switzerland',
        rating: 5,
        date: '2 days ago',
        verified: true,
        figureType: 'Couple 20cm',
        title: 'Brought tears of pure joy to our wedding anniversary!',
        text: 'The sculptor captured my wife\'s exact smile and dimples from our vacation photo! Being able to approve the clay model on WhatsApp before it was baked gave us 100% peace of mind.',
        likes: 34
      },
      {
        id: 'rev-2',
        name: 'Pascal B.',
        location: 'Geneva, Switzerland',
        rating: 5,
        date: '1 week ago',
        verified: true,
        figureType: 'Single 18cm Bobblehead',
        title: 'Super smooth WhatsApp preview process!',
        text: 'I was hesitant about ordering without uploading photos first, but it was so easy. I ordered during my commute and sent 3 photos on WhatsApp that evening. Master sculptor replied within 48h with HD photos.',
        likes: 19
      },
      {
        id: 'rev-3',
        name: 'Corinne M.',
        location: 'Lucerne, Switzerland',
        rating: 5,
        date: '2 weeks ago',
        verified: true,
        figureType: 'With Golden Retriever Pet',
        title: 'My dog\'s fur texture and bandana are identical!',
        text: 'I requested one small revision on my dog\'s ears on WhatsApp, and the artist adjusted it within 12 hours with zero extra fees. Arrived in a luxury gift box ready to wrap.',
        likes: 27
      },
      {
        id: 'rev-4',
        name: 'David W.',
        location: 'Basel, Switzerland',
        rating: 5,
        date: '3 weeks ago',
        verified: true,
        figureType: 'Family Group 22cm',
        title: 'Worth every single Swiss Franc. Pure artistry.',
        text: 'The weight, hand-painted details, and walnut base feel like a luxury art piece. Everyone visiting our home asks where we got it made. Highly recommended!',
        likes: 42
      }
    ],

    faqs: [
      {
        id: 'faq-1',
        question: 'How and when do I send my photos for the figurine?',
        answer: 'You do not need to rush or upload photos during checkout! Once your order is placed, you immediately receive a confirmation with your dedicated WhatsApp concierge link and secure upload portal. You can take your time to pick your favorite photos and send them whenever you are ready.'
      },
      {
        id: 'faq-2',
        question: 'How does the WhatsApp 3D preview and approval work?',
        answer: 'Within 3-5 days after we receive your photos, our master sculptor creates the initial raw clay prototype and sends high-resolution 360° photos and videos to you directly on WhatsApp. You inspect every detail (hair, eyes, smile, clothing).'
      },
      {
        id: 'faq-3',
        question: 'Are revisions truly 100% unlimited and free?',
        answer: 'Yes, absolutely! If you want to change cheek contours, hair shading, or posture, just tell us on WhatsApp. We adjust the soft clay model until you are completely 100% delighted. We will NEVER bake or ship without your explicit green light.'
      },
      {
        id: 'faq-4',
        question: 'What materials are used and how durable is the statue?',
        answer: 'We use high-density artisan polymer clay and reinforced resin cores that will never fade, crack, or lose vibrancy over decades. The metallic springs on our bobbleheads are tempered stainless steel with lifetime elasticity.'
      },
      {
        id: 'faq-5',
        question: 'What is the total turnaround and delivery time to Switzerland / Europe?',
        answer: 'Hand-sculpting and WhatsApp approval usually takes 4-7 business days. Once approved, kiln baking, hand-painting, and insured Express shipping takes approximately 5-8 business days to your doorstep.'
      }
    ],

    orders: [
      {
        id: 'TC-9481',
        customer: 'Elena Schneider',
        email: 'elena.schneider@bluewin.ch',
        phone: '+41 78 654 32 10',
        date: '2026-08-22 09:14',
        items: [
          { title: "Bespoke 'MINI ME' Figurine", variant: 'Couple • 20cm • Bobblehead • Walnut Base', qty: 1, price: 99.90 }
        ],
        total: 99.90,
        currency: 'CHF',
        status: 'Unfulfilled',
        paymentStatus: 'Paid',
        whatsappStatus: 'Proof Sent (Awaiting Approval)',
        notes: 'Anniversary date engraved: 24.09.2021',
        shippingAddress: 'Bahnhofstrasse 42, 8001 Zurich, Switzerland'
      },
      {
        id: 'TC-9480',
        customer: 'Lukas Meier',
        email: 'lukas.m@sunrise.ch',
        phone: '+41 79 332 11 90',
        date: '2026-08-21 17:42',
        items: [
          { title: "Bespoke 'MINI ME' Figurine", variant: 'Single Person • 18cm • Bobblehead', qty: 1, price: 59.90 }
        ],
        total: 59.90,
        currency: 'CHF',
        status: 'Fulfilled',
        paymentStatus: 'Paid',
        whatsappStatus: 'Approved & Baked',
        notes: 'Express Courier gift packaging',
        shippingAddress: 'Avenue de la Gare 14, 1003 Lausanne, Switzerland'
      },
      {
        id: 'TC-9479',
        customer: 'Sophie V. Dubois',
        email: 'sophie.dubois@gmail.com',
        phone: '+41 76 991 22 34',
        date: '2026-08-21 11:20',
        items: [
          { title: "Bespoke 'MINI ME' Figurine", variant: 'With Pet • 20cm • Fixed • Heart Base', qty: 1, price: 74.90 }
        ],
        total: 74.90,
        currency: 'CHF',
        status: 'Unfulfilled',
        paymentStatus: 'Paid',
        whatsappStatus: 'Photos Received',
        notes: 'Golden Retriever named Bella',
        shippingAddress: 'Rue du Rhône 8, 1204 Geneva, Switzerland'
      },
      {
        id: 'TC-9478',
        customer: 'Markus Weber',
        email: 'markus.weber@bluemail.ch',
        phone: '+41 79 812 44 55',
        date: '2026-08-20 14:05',
        items: [
          { title: "Bespoke 'MINI ME' Figurine", variant: 'Family/Group • 22cm • Bobblehead', qty: 1, price: 139.90 }
        ],
        total: 139.90,
        currency: 'CHF',
        status: 'Fulfilled',
        paymentStatus: 'Paid',
        whatsappStatus: 'Delivered (5-Star Review)',
        notes: 'Custom brass plate: The Weber Family',
        shippingAddress: 'Spitalgasse 19, 3011 Bern, Switzerland'
      }
    ],

    customers: [
      { id: 'CUST-1', name: 'Elena Schneider', email: 'elena.schneider@bluewin.ch', phone: '+41 78 654 32 10', city: 'Zurich', ordersCount: 2, totalSpent: 174.80, status: 'Active VIP' },
      { id: 'CUST-2', name: 'Lukas Meier', email: 'lukas.m@sunrise.ch', phone: '+41 79 332 11 90', city: 'Lausanne', ordersCount: 1, totalSpent: 59.90, status: 'Active' },
      { id: 'CUST-3', name: 'Sophie V. Dubois', email: 'sophie.dubois@gmail.com', phone: '+41 76 991 22 34', city: 'Geneva', ordersCount: 1, totalSpent: 74.90, status: 'Active' },
      { id: 'CUST-4', name: 'Markus Weber', email: 'markus.weber@bluemail.ch', phone: '+41 79 812 44 55', city: 'Bern', ordersCount: 3, totalSpent: 319.70, status: 'Active VIP' }
    ],

    discounts: [
      { id: 'disc-1', code: '2FOR1DEAL', type: 'percentage', value: 50, title: '50% Off 2-For-1 Summer Promo', status: 'Active', uses: 284 },
      { id: 'disc-2', code: 'VIPSWISS10', type: 'fixed', value: 10, title: 'CHF 10 Off VIP Club', status: 'Active', uses: 95 },
      { id: 'disc-3', code: 'FREESHIP', type: 'shipping', value: 0, title: 'Free Insured Priority Shipping', status: 'Active', uses: 412 }
    ],

    analytics: {
      todaySales: 1248.50,
      todayOrders: 16,
      conversionRate: 4.82,
      aov: 78.03,
      liveVisitors: 41,
      totalRevenueMonth: 34290.00,
      salesTrend: [18, 24, 21, 35, 29, 44, 48, 52, 49, 61, 58, 68, 74, 82]
    }
  };

  // Safe deep clone
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Reactive Data Engine Class
  class StoreDataEngine {
    constructor() {
      this.listeners = [];
      this.init();
      this.bindCrossTabSync();
    }

    init() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          this.data = deepClone(DEFAULT_STORE_DATA);
          this.persist();
        } else {
          this.data = JSON.parse(stored);
          // Merge any missing keys from schema
          this.data = Object.assign({}, deepClone(DEFAULT_STORE_DATA), this.data);
        }
      } catch (e) {
        console.warn('LocalStorage error, using defaults:', e);
        this.data = deepClone(DEFAULT_STORE_DATA);
      }
    }

    bindCrossTabSync() {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            this.data = JSON.parse(e.newValue);
            this.notify();
          } catch (err) {
            console.error('Failed to parse synchronized store data', err);
          }
        }
      });
    }

    subscribe(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }

    notify() {
      this.listeners.forEach(cb => {
        try { cb(this.data); } catch (e) { console.error('Listener error:', e); }
      });
      window.dispatchEvent(new CustomEvent('tarelcraft:data-changed', { detail: this.data }));
    }

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        this.notify();
        return true;
      } catch (e) {
        console.error('Failed to write to localStorage', e);
        return false;
      }
    }

    get() {
      return deepClone(this.data);
    }

    set(newData) {
      this.data = deepClone(newData);
      return this.persist();
    }

    // --- Product CRUD Helpers ---
    getProducts() {
      return this.data.products || [];
    }

    getProduct(id = 'mini-me') {
      return (this.data.products || []).find(p => p.id === id) || this.data.products[0];
    }

    updateProduct(id, updates) {
      const idx = this.data.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.data.products[idx] = Object.assign({}, this.data.products[idx], updates);
        return this.persist();
      }
      return false;
    }

    addProduct(product) {
      if (!product.id) {
        product.id = 'prod-' + Date.now();
      }
      this.data.products.push(product);
      return this.persist();
    }

    deleteProduct(id) {
      if (this.data.products.length <= 1) {
        throw new Error('At least one primary product must remain in store.');
      }
      this.data.products = this.data.products.filter(p => p.id !== id);
      return this.persist();
    }

    // --- Reviews CRUD Helpers ---
    getReviews() {
      return this.data.reviews || [];
    }

    addReview(review) {
      review.id = review.id || 'rev-' + Date.now();
      this.data.reviews.unshift(review);
      return this.persist();
    }

    updateReview(id, updates) {
      const idx = this.data.reviews.findIndex(r => r.id === id);
      if (idx !== -1) {
        this.data.reviews[idx] = Object.assign({}, this.data.reviews[idx], updates);
        return this.persist();
      }
      return false;
    }

    deleteReview(id) {
      this.data.reviews = this.data.reviews.filter(r => r.id !== id);
      return this.persist();
    }

    // --- FAQs CRUD Helpers ---
    getFaqs() {
      return this.data.faqs || [];
    }

    addFaq(faq) {
      faq.id = faq.id || 'faq-' + Date.now();
      this.data.faqs.push(faq);
      return this.persist();
    }

    updateFaq(id, updates) {
      const idx = this.data.faqs.findIndex(f => f.id === id);
      if (idx !== -1) {
        this.data.faqs[idx] = Object.assign({}, this.data.faqs[idx], updates);
        return this.persist();
      }
      return false;
    }

    deleteFaq(id) {
      this.data.faqs = this.data.faqs.filter(f => f.id !== id);
      return this.persist();
    }

    // --- Reels CRUD Helpers ---
    getReels() {
      return this.data.reels || [];
    }

    addReel(reel) {
      reel.id = reel.id || 'reel-' + Date.now();
      this.data.reels.push(reel);
      return this.persist();
    }

    updateReel(id, updates) {
      const idx = this.data.reels.findIndex(r => r.id === id);
      if (idx !== -1) {
        this.data.reels[idx] = Object.assign({}, this.data.reels[idx], updates);
        return this.persist();
      }
      return false;
    }

    deleteReel(id) {
      this.data.reels = this.data.reels.filter(r => r.id !== id);
      return this.persist();
    }

    // --- Orders CRUD Helpers ---
    getOrders() {
      return this.data.orders || [];
    }

    addOrder(order) {
      order.id = order.id || 'TC-' + Math.floor(1000 + Math.random() * 9000);
      order.date = order.date || new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.data.orders.unshift(order);
      return this.persist();
    }

    updateOrder(id, updates) {
      const idx = this.data.orders.findIndex(o => o.id === id);
      if (idx !== -1) {
        this.data.orders[idx] = Object.assign({}, this.data.orders[idx], updates);
        return this.persist();
      }
      return false;
    }

    deleteOrder(id) {
      this.data.orders = this.data.orders.filter(o => o.id !== id);
      return this.persist();
    }

    // --- Backup & Restore ---
    resetToDefaults() {
      this.data = deepClone(DEFAULT_STORE_DATA);
      this.persist();
      return true;
    }

    exportJSON() {
      return JSON.stringify(this.data, null, 2);
    }

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format');
        }
        this.data = Object.assign({}, deepClone(DEFAULT_STORE_DATA), parsed);
        this.persist();
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
  }

  // Export singleton instance
  window.StoreEngine = new StoreDataEngine();
  window.DEFAULT_STORE_DATA = DEFAULT_STORE_DATA;

})(window);
