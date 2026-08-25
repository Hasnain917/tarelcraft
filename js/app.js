/* ==========================================================================
   TARELCRAFT INTERACTIVE PRODUCT PAGE SCRIPT
   Enhanced with Reactive StoreEngine Sync, Dark/Light Theme & Dynamic Figures
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure StoreEngine is loaded
  const storeData = window.StoreEngine ? window.StoreEngine.get() : (window.DEFAULT_STORE_DATA || {});
  const primaryProduct = (storeData.products && storeData.products[0]) ? storeData.products[0] : {
    id: 'mini-me',
    title: "Handcrafted Custom 'MINI ME' Figurine & Bobblehead",
    subtitle: 'Turn any photo into a detailed, museum-quality personalized figurine.',
    basePrice: 49.90,
    comparePrice: 99.80,
    rating: 5.0,
    reviewsCount: 1480
  };

  // Local State
  const state = {
    theme: localStorage.getItem('tarelcraft-theme') || 'light',
    currency: storeData.settings?.currency || 'CHF',
    rates: storeData.settings?.rates || { CHF: 1.0, EUR: 1.05, USD: 1.15 },
    symbols: storeData.settings?.symbols || { CHF: 'CHF', EUR: '€', USD: '$' },
    basePrice: primaryProduct.basePrice || 49.90,
    comparePrice: primaryProduct.comparePrice || 99.80,
    figureType: 'single',
    height: '18cm',
    headStyle: 'bobblehead',
    baseTheme: 'walnut',
    engravingText: '',
    cartCount: 0,
    activeReelIndex: 0
  };

  // Figure Images Map
  const figureImages = {
    single: 'assets/images/hero-bobblehead.jpg',
    couple: 'assets/images/couple-figure.jpg',
    pet: 'assets/images/pet-figure.jpg',
    family: 'assets/images/family-figure.jpg'
  };

  // Price Modifiers from Primary Product Variants
  let priceModifiers = {
    figureType: { single: 0, couple: 30, pet: 15, family: 60 },
    height: { '18cm': 0, '20cm': 10, '22cm': 20 },
    headStyle: { bobblehead: 10, fixed: 0 },
    baseTheme: { walnut: 0, acrylic: 5, heart: 5, soccer: 5 }
  };

  function updatePriceModifiersFromProduct(prod) {
    if (prod && prod.variants && prod.variants.figureTypes) {
      prod.variants.figureTypes.forEach(f => {
        priceModifiers.figureType[f.id] = parseFloat(f.priceModifier) || 0;
        if (f.image) figureImages[f.id] = f.image;
      });
    }
  }

  updatePriceModifiersFromProduct(primaryProduct);

  // DOM Elements
  const htmlRoot = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const currentPriceEl = document.getElementById('current-price-val');
  const comparePriceEl = document.getElementById('compare-price-val');
  const mainImageViewport = document.querySelector('.main-image-viewport');
  const mainImage = document.getElementById('main-product-img');
  const bobbleTriggerPill = document.getElementById('bobble-trigger-pill');
  const figureTypeSelected = document.getElementById('selected-figure-val');
  const heightSelected = document.getElementById('selected-height-val');
  const currencySelector = document.getElementById('currency-selector');
  const stickyPriceEl = document.getElementById('sticky-price-val');
  const toastEl = document.getElementById('toast-notice');
  const toastMsgEl = document.getElementById('toast-msg');
  const cartCountEl = document.getElementById('cart-count-badge');
  const socialProofPopup = document.getElementById('live-social-proof');

  // Video Modal Elements
  const videoModalOverlay = document.getElementById('video-modal-overlay');
  const videoCloseBtn = document.getElementById('video-close-btn');
  const activeVideoPlayer = document.getElementById('active-video-player');
  const videoProgressFill = document.getElementById('video-progress-fill');
  const videoProgressBar = document.getElementById('video-progress-bar');
  const videoToggleBtn = document.getElementById('video-toggle-btn');
  const videoIconState = document.getElementById('video-icon-state');
  const videoSoundToggleBtn = document.getElementById('video-sound-toggle-btn');
  const videoSoundIcon = document.getElementById('video-sound-icon');
  const modalVideoTitle = document.getElementById('modal-video-title');
  const modalVideoDesc = document.getElementById('modal-video-desc');
  const modalLikeBtn = document.getElementById('modal-like-btn');

  // Configurator & Modal Total Elements
  const configTotalEl = document.getElementById('configurator-total-price');
  const modalTotalEl = document.getElementById('modal-total-price');
  const headSelected = document.getElementById('selected-head-val');
  const baseSelected = document.getElementById('selected-base-val');

  function calculateTotal() {
    let base = state.basePrice || 49.90;
    let compareBase = state.comparePrice || 99.80;

    base += priceModifiers.figureType[state.figureType] || 0;
    base += priceModifiers.height[state.height] || 0;
    base += priceModifiers.headStyle[state.headStyle] || 0;
    base += priceModifiers.baseTheme[state.baseTheme] || 0;

    compareBase += (priceModifiers.figureType[state.figureType] || 0) * 2;
    compareBase += (priceModifiers.height[state.height] || 0) * 2;
    compareBase += (priceModifiers.headStyle[state.headStyle] || 0) * 2;

    const rate = state.rates[state.currency] || 1;
    const finalPrice = (base * rate).toFixed(2);
    const finalCompare = (compareBase * rate).toFixed(2);
    const symbol = state.symbols[state.currency] || '$';

    const formattedPrice = `${state.currency} ${finalPrice}`;
    const formattedCompare = `${state.currency} ${finalCompare}`;

    // Update main page price displays
    if (currentPriceEl) {
      currentPriceEl.textContent = formattedPrice;
      currentPriceEl.classList.remove('price-updated');
      void currentPriceEl.offsetWidth;
      currentPriceEl.classList.add('price-updated');
    }
    if (comparePriceEl) comparePriceEl.textContent = formattedCompare;
    if (stickyPriceEl) stickyPriceEl.textContent = formattedPrice;
    if (configTotalEl) configTotalEl.textContent = formattedPrice;
    if (modalTotalEl) modalTotalEl.textContent = formattedPrice;

    // Dynamically format modifier tags across UI
    function fmtMod(amt) {
      const val = Math.round(amt * rate);
      return val > 0 ? `+ ${symbol}${val}` : 'Included';
    }

    // Size modifiers
    document.querySelectorAll('#size-price-20, .modal-size-price-20').forEach(el => {
      el.textContent = fmtMod(priceModifiers.height['20cm'] || 12);
    });
    document.querySelectorAll('#size-price-22, .modal-size-price-22').forEach(el => {
      el.textContent = fmtMod(priceModifiers.height['22cm'] || 24);
    });

    // Head modifiers
    document.querySelectorAll('#head-price-bobble, .modal-head-price-bobble').forEach(el => {
      el.textContent = fmtMod(priceModifiers.headStyle['bobblehead'] || 12);
    });

    // Figure modifiers
    const modCouple = document.getElementById('price-mod-couple');
    const modPet = document.getElementById('price-mod-pet');
    const modFam = document.getElementById('price-mod-family');
    if (modCouple) modCouple.textContent = fmtMod(priceModifiers.figureType['couple'] || 30);
    if (modPet) modPet.textContent = fmtMod(priceModifiers.figureType['pet'] || 15);
    if (modFam) modFam.textContent = fmtMod(priceModifiers.figureType['family'] || 60);

    // Base modifiers
    const bAcrylic = document.getElementById('base-price-acrylic');
    const bHeart = document.getElementById('base-price-heart');
    const bSoccer = document.getElementById('base-price-soccer');
    if (bAcrylic) bAcrylic.textContent = fmtMod(priceModifiers.baseTheme['acrylic'] || 5);
    if (bHeart) bHeart.textContent = fmtMod(priceModifiers.baseTheme['heart'] || 5);
    if (bSoccer) bSoccer.textContent = fmtMod(priceModifiers.baseTheme['soccer'] || 5);
  }

  // ==========================================================================
  // 1. DYNAMIC STORE DATA BINDING (SYNCS WITH ADMIN)
  // ==========================================================================
  function applyStorefrontData(data) {
    if (!data) return;
    const prod = data.products ? data.products[0] : null;

    // 1. Announcement Bar
    const announceBar = document.querySelector('.announcement-bar');
    if (announceBar && data.announcement) {
      announceBar.innerHTML = `
        <span><span class="badge-pill"><i class="fa-solid fa-sparkles"></i> ${data.announcement.badge || 'LIMITED DEAL'}</span> ${data.announcement.text}</span>
        <a href="${data.announcement.ctaLink || '#how-it-works'}">${data.announcement.ctaText || 'Learn How It Works →'}</a>
      `;
    }

    // 2. Product Meta Info
    if (prod) {
      state.basePrice = parseFloat(prod.basePrice) || 49.90;
      state.comparePrice = parseFloat(prod.comparePrice) || 99.80;

      const titleEl = document.querySelector('.product-title');
      const subtitleEl = document.querySelector('.product-subtitle');
      if (titleEl) titleEl.textContent = prod.title;
      if (subtitleEl) subtitleEl.textContent = prod.subtitle;

      updatePriceModifiersFromProduct(prod);
      calculateTotal();
    }

    // 3. Dynamic Video Reels
    if (data.reels && data.reels.length > 0) {
      bindDynamicReels(data.reels);
    }

    // 4. Dynamic Customer Reviews
    if (data.reviews && data.reviews.length > 0) {
      bindDynamicReviews(data.reviews);
    }

    // 5. Dynamic FAQs
    if (data.faqs && data.faqs.length > 0) {
      bindDynamicFaqs(data.faqs);
    }
  }

  // Bind Dynamic Reels
  function bindDynamicReels(reels) {
    const container = document.querySelector('.unboxing-reels-grid');
    if (!container) return;

    container.innerHTML = '';
    reels.forEach((reel, idx) => {
      const card = document.createElement('div');
      card.className = `unboxing-reel-card reveal-on-scroll delay-${(idx % 3) + 1} is-visible`;
      card.setAttribute('data-reel-index', idx);
      card.innerHTML = `
        <video class="reel-preview-video" poster="${reel.poster || 'assets/images/unboxing-1.jpg'}" loop muted playsinline preload="metadata">
          <source src="${reel.video}" type="video/mp4">
        </video>
        <img src="${reel.poster || 'assets/images/unboxing-1.jpg'}" alt="${reel.title}" class="reel-fallback-poster">
        <div class="reel-play-btn"><i class="fa-solid fa-play"></i></div>
        <div class="reel-overlay">
          <div class="reel-top-tags">
            <span class="reel-tag"><i class="fa-solid fa-circle-check"></i> ${reel.tag || 'Verified Buyer'}</span>
            <button class="reel-like-btn" aria-label="Like Video"><i class="fa-solid fa-heart"></i></button>
          </div>
          <div class="reel-bottom-info">
            <div class="reel-customer-name">
              <span>${reel.title}</span>
              <i class="fa-solid fa-circle-check verified-check" title="Verified Buyer"></i>
            </div>
            <p class="reel-quote">${reel.desc}</p>
            <div class="reel-stars">
              <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Re-bind reel clicks
    container.querySelectorAll('.unboxing-reel-card').forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.reel-like-btn')) return;
        openVideoModal(idx);
      });
    });
  }

  // Bind Dynamic Reviews
  function bindDynamicReviews(reviews) {
    const container = document.querySelector('.reviews-masonry-grid');
    if (!container) return;

    container.innerHTML = '';
    reviews.forEach((rev, idx) => {
      const card = document.createElement('div');
      card.className = `review-card reveal-on-scroll delay-${(idx % 3) + 1} is-visible`;
      const starsHtml = '<i class="fa-solid fa-star"></i>'.repeat(rev.rating || 5);
      const initials = rev.name ? rev.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'TC';

      card.innerHTML = `
        <div class="review-card-top">
          <div class="reviewer-avatar">${initials}</div>
          <div class="reviewer-info">
            <h4>${rev.name}</h4>
            <div class="reviewer-meta">
              <span class="verified-pill"><i class="fa-solid fa-circle-check"></i> Verified Buyer</span>
              <span>•</span>
              <span class="time-ago">${rev.date || 'Recent'}</span>
            </div>
          </div>
          <div class="rating-stars">${starsHtml}</div>
        </div>
        <div class="review-figure-tag"><i class="fa-solid fa-tag"></i> Ordered: <strong>${rev.figureType || 'Custom Bobblehead'}</strong></div>
        <h3 class="review-headline">"${rev.title}"</h3>
        <p class="review-body-text">${rev.text}</p>
        <div class="review-card-footer">
          <div class="review-loc"><i class="fa-solid fa-location-dot"></i> ${rev.location || 'Switzerland'}</div>
          <button class="review-helpful-btn"><i class="fa-regular fa-thumbs-up"></i> Helpful (${rev.likes || 12})</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Bind Dynamic FAQs
  function bindDynamicFaqs(faqs) {
    const container = document.querySelector('.faq-accordion-list');
    if (!container) return;

    container.innerHTML = '';
    faqs.forEach((faq, idx) => {
      const card = document.createElement('div');
      card.className = `faq-card reveal-on-scroll delay-${(idx % 3) + 1} is-visible ${idx === 0 ? 'open' : ''}`;
      card.innerHTML = `
        <button class="faq-question-btn">
          <span class="faq-q-text"><i class="fa-regular fa-circle-question faq-icon"></i> ${faq.question}</span>
          <span class="faq-toggle-icon"><i class="fa-solid fa-plus"></i></span>
        </button>
        <div class="faq-answer-pane">
          <div class="faq-answer-inner">
            <p>${faq.answer}</p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Re-bind FAQ Accordions
    container.querySelectorAll('.faq-card').forEach(card => {
      const btn = card.querySelector('.faq-question-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const isOpen = card.classList.contains('open');
          container.querySelectorAll('.faq-card').forEach(c => c.classList.remove('open'));
          if (!isOpen) {
            card.classList.add('open');
          }
        });
      }
    });
  }

  // Initial apply
  applyStorefrontData(storeData);

  // Subscribe to real-time updates from StoreEngine / other tabs
  if (window.StoreEngine) {
    window.StoreEngine.subscribe((updated) => {
      applyStorefrontData(updated);
      showToast('⚡ Live Storefront updated in real-time from Admin!');
    });
  }

  // ==========================================================================
  // 2. THEME SWITCHER (LIGHT / DARK MODE)
  // ==========================================================================
  function applyTheme(theme) {
    state.theme = theme;
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('tarelcraft-theme', theme);

    if (themeToggleBtn) {
      const icon = themeToggleBtn.querySelector('i');
      if (icon) {
        if (theme === 'dark') {
          icon.className = 'fa-solid fa-sun';
          themeToggleBtn.setAttribute('title', 'Switch to Light Theme');
        } else {
          icon.className = 'fa-solid fa-moon';
          themeToggleBtn.setAttribute('title', 'Switch to Dark Theme');
        }
      }
    }
  }

  applyTheme(state.theme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme.toUpperCase()} mode! ✨`);
    });
  }

  // ==========================================================================
  // 3. CONFETTI CANVAS ENGINE
  // ==========================================================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let particles = [];

  function resizeCanvas() {
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function triggerConfetti() {
    if (!ctx || !confettiCanvas) return;
    const colors = ['#C99742', '#10B981', '#25D366', '#3B82F6', '#EC4899', '#F59E0B'];
    particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() * 200 - 100),
        y: window.innerHeight / 2 - 50,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 15,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }
    renderConfetti();
  }

  function renderConfetti() {
    if (!ctx || particles.length === 0) return;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.012;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();

      if (p.opacity <= 0 || p.y > window.innerHeight) {
        particles.splice(index, 1);
      }
    });

    if (particles.length > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // ==========================================================================
  // 4. REAL HTML5 VIDEO PLAYER (UNBOXING REELS)
  // ==========================================================================
  function openVideoModal(index) {
    const reels = window.StoreEngine ? window.StoreEngine.getReels() : [];
    const reel = reels[index] || reels[0];
    if (!reel) return;

    state.activeReelIndex = index;
    if (activeVideoPlayer) {
      activeVideoPlayer.src = reel.video;
      activeVideoPlayer.poster = reel.poster || '';
      activeVideoPlayer.load();
      activeVideoPlayer.play().catch(() => {});
    }

    if (modalVideoTitle) modalVideoTitle.textContent = reel.title;
    if (modalVideoDesc) modalVideoDesc.textContent = reel.desc;
    if (videoModalOverlay) videoModalOverlay.style.display = 'flex';
  }

  function closeVideoModal() {
    if (activeVideoPlayer) {
      activeVideoPlayer.pause();
    }
    if (videoModalOverlay) {
      videoModalOverlay.style.display = 'none';
    }
  }

  if (activeVideoPlayer) {
    activeVideoPlayer.addEventListener('timeupdate', () => {
      if (activeVideoPlayer.duration && videoProgressFill) {
        const percent = (activeVideoPlayer.currentTime / activeVideoPlayer.duration) * 100;
        videoProgressFill.style.width = `${percent}%`;
      }
    });

    activeVideoPlayer.addEventListener('play', () => {
      if (videoIconState) videoIconState.className = 'fa-solid fa-pause';
    });

    activeVideoPlayer.addEventListener('pause', () => {
      if (videoIconState) videoIconState.className = 'fa-solid fa-play';
    });
  }

  if (videoToggleBtn && activeVideoPlayer) {
    videoToggleBtn.addEventListener('click', () => {
      if (activeVideoPlayer.paused) {
        activeVideoPlayer.play();
      } else {
        activeVideoPlayer.pause();
      }
    });
  }

  if (videoSoundToggleBtn && activeVideoPlayer) {
    videoSoundToggleBtn.addEventListener('click', () => {
      activeVideoPlayer.muted = !activeVideoPlayer.muted;
      if (videoSoundIcon) {
        if (activeVideoPlayer.muted) {
          videoSoundIcon.className = 'fa-solid fa-volume-xmark';
          showToast('🔇 Video Muted');
        } else {
          videoSoundIcon.className = 'fa-solid fa-volume-high';
          showToast('🔊 Sound Enabled');
        }
      }
    });
  }

  if (videoCloseBtn) videoCloseBtn.addEventListener('click', closeVideoModal);
  if (videoModalOverlay) {
    videoModalOverlay.addEventListener('click', (e) => {
      if (e.target === videoModalOverlay) closeVideoModal();
    });
  }

  if (modalLikeBtn) {
    modalLikeBtn.addEventListener('click', () => {
      modalLikeBtn.classList.toggle('liked');
      if (modalLikeBtn.classList.contains('liked')) {
        triggerConfetti();
        showToast('❤️ You loved this unboxing video!');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
  });

  // ==========================================================================
  // 5. FIGURE SELECTION & IMAGE SWITCHER
  // ==========================================================================
  const figurePillCards = document.querySelectorAll('.figure-pill-card, .figure-card');
  const thumbnails = document.querySelectorAll('.thumb-item');

  function updateProductImage(figureKey) {
    const newSrc = figureImages[figureKey] || figureImages.single;
    if (mainImage) {
      mainImage.style.transform = 'scale(0.95)';
      mainImage.style.opacity = '0.4';
      setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.style.transform = 'scale(1)';
        mainImage.style.opacity = '1';
      }, 160);
    }

    thumbnails.forEach(thumb => {
      if (thumb.getAttribute('data-type') === figureKey) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  figurePillCards.forEach(card => {
    card.addEventListener('click', () => {
      figurePillCards.forEach(c => c.classList.remove('active'));
      const fType = card.getAttribute('data-figure');
      state.figureType = fType;
      
      // Sync active class to matching cards
      document.querySelectorAll(`[data-figure="${fType}"]`).forEach(c => c.classList.add('active'));

      if (figureTypeSelected) {
        const titleSpan = card.querySelector('.pill-title') || card.querySelector('.v-title');
        if (titleSpan) figureTypeSelected.textContent = titleSpan.textContent;
      }

      updateProductImage(state.figureType);
      calculateTotal();
    });
  });

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const thumbType = thumb.getAttribute('data-type');
      const newSrc = thumb.getAttribute('data-img');

      if (mainImage && newSrc) {
        mainImage.style.transform = 'scale(0.95)';
        mainImage.style.opacity = '0.4';
        setTimeout(() => {
          mainImage.src = newSrc;
          mainImage.style.transform = 'scale(1)';
          mainImage.style.opacity = '1';
        }, 160);
      }

      if (thumbType) {
        figurePillCards.forEach(c => {
          if (c.getAttribute('data-figure') === thumbType) {
            c.click();
          }
        });
      }
    });
  });

  // ==========================================================================
  // 6. BOBBLEHEAD WOBBLE ON CLICK
  // ==========================================================================
  function triggerBobbleAnimation() {
    if (!mainImageViewport) return;
    mainImageViewport.classList.remove('is-bobbling');
    void mainImageViewport.offsetWidth;
    mainImageViewport.classList.add('is-bobbling');

    // Also trigger bobble animation on head cards
    document.querySelectorAll('.head-char-img').forEach(img => {
      img.classList.remove('bobble-anim');
      void img.offsetWidth;
      img.classList.add('bobble-anim');
    });

    showToast('✨ Bobblehead spring activated! Wobbling smoothly.');
  }

  if (bobbleTriggerPill) {
    bobbleTriggerPill.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerBobbleAnimation();
    });
  }

  if (mainImageViewport) {
    mainImageViewport.addEventListener('click', triggerBobbleAnimation);
  }

  // ==========================================================================
  // 7. DYNAMIC PRICING & CURRENCY CONVERSION (WITH MOCKUP LABELS)
  // ==========================================================================
  if (currencySelector) {
    currencySelector.addEventListener('change', (e) => {
      state.currency = e.target.value;
      calculateTotal();
      showToast(`Currency changed to ${state.currency}`);
    });
  }

  // ==========================================================================
  // 8. VISUAL SIZE CARD HANDLERS (SYNCED PAGE & MODAL)
  // ==========================================================================
  const visualSizeCards = document.querySelectorAll('.visual-size-card, .height-card');
  visualSizeCards.forEach(card => {
    card.addEventListener('click', () => {
      const hVal = card.getAttribute('data-height') || '18cm';
      state.height = hVal;

      // Sync active state across all size cards (in page and in modal)
      visualSizeCards.forEach(c => {
        if (c.getAttribute('data-height') === hVal) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      if (heightSelected) {
        const titleEl = card.querySelector('.size-title') || card.querySelector('.v-title');
        const isIncluded = hVal === '18cm' ? '(Included)' : `(+ $${priceModifiers.height[hVal]})`;
        heightSelected.textContent = `${titleEl ? titleEl.textContent : hVal} ${isIncluded}`;
      }

      calculateTotal();
    });
  });

  // ==========================================================================
  // 9. VISUAL HEAD STYLE CARD HANDLERS (SYNCED PAGE & MODAL)
  // ==========================================================================
  const visualHeadCards = document.querySelectorAll('.visual-head-card, .head-style-card');
  visualHeadCards.forEach(card => {
    card.addEventListener('click', () => {
      const headVal = card.getAttribute('data-head') || 'bobblehead';
      state.headStyle = headVal;

      // Sync active state across all head cards
      visualHeadCards.forEach(c => {
        if (c.getAttribute('data-head') === headVal) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      if (headSelected) {
        headSelected.textContent = headVal === 'bobblehead' ? 'BobbleHead (+ $12)' : 'Fixed Head (Included)';
      }

      if (headVal === 'bobblehead') {
        triggerBobbleAnimation();
      }

      calculateTotal();
    });
  });

  // ==========================================================================
  // 10. BASE THEME PILL HANDLERS
  // ==========================================================================
  const basePillCards = document.querySelectorAll('.base-pill-card, .base-card');
  basePillCards.forEach(card => {
    card.addEventListener('click', () => {
      basePillCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.baseTheme = card.getAttribute('data-base');
      if (baseSelected) {
        const titleSpan = card.querySelector('.b-title') || card.querySelector('.v-title');
        if (titleSpan) baseSelected.textContent = titleSpan.textContent;
      }
      calculateTotal();
    });
  });

  // Engraving Input
  const engravingInput = document.getElementById('engraving-input');
  const engravingCount = document.getElementById('engraving-count');
  if (engravingInput) {
    engravingInput.addEventListener('input', (e) => {
      state.engravingText = e.target.value;
      if (engravingCount) {
        engravingCount.textContent = `${state.engravingText.length}/30 characters`;
      }
    });
  }

  // ==========================================================================
  // 11. STEP CUSTOMIZER DRAWER / MODAL HANDLERS
  // ==========================================================================
  const customizerModal = document.getElementById('customizer-step-modal');
  const customizerCloseBtn = document.getElementById('customizer-close-btn');
  const modalCompleteOrderBtn = document.getElementById('modal-complete-order-btn');

  function openCustomizerModal() {
    if (customizerModal) {
      customizerModal.style.display = 'flex';
      calculateTotal();
    }
  }

  function closeCustomizerModal() {
    if (customizerModal) {
      customizerModal.style.display = 'none';
    }
  }

  if (customizerCloseBtn) customizerCloseBtn.addEventListener('click', closeCustomizerModal);
  if (customizerModal) {
    customizerModal.addEventListener('click', (e) => {
      if (e.target === customizerModal) closeCustomizerModal();
    });
  }

  // Interactive WhatsApp Simulator
  const simApproveBtn = document.getElementById('sim-approve-btn');
  const simEditBtn = document.getElementById('sim-edit-btn');
  const chatBody = document.getElementById('phone-chat-body');
  const typingBubble = document.getElementById('typing-bubble');

  function showTypingIndicator() {
    if (typingBubble) typingBubble.style.display = 'flex';
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }

  function hideTypingIndicator() {
    if (typingBubble) typingBubble.style.display = 'none';
  }

  if (simApproveBtn && chatBody) {
    simApproveBtn.addEventListener('click', () => {
      const outgoing = document.createElement('div');
      outgoing.className = 'chat-bubble outgoing';
      outgoing.innerHTML = `
        <strong>Emily (Customer):</strong><br>
        ✅ Approved! The hair tone and facial expression are 100% spot on! Proceed with casting please.
        <div class="chat-time">Just now ✓✓</div>
      `;
      chatBody.appendChild(outgoing);
      chatBody.scrollTop = chatBody.scrollHeight;

      showTypingIndicator();
      triggerConfetti();

      setTimeout(() => {
        hideTypingIndicator();
        const reply = document.createElement('div');
        reply.className = 'chat-bubble incoming';
        reply.innerHTML = `
          <strong>Tarelcraft Master Sculptor:</strong><br>
          🎉 Fantastic! Your MINI ME is now moving to casting and hand-painting. We will send you the final video before boxing it in your luxury gift set!
          <div class="chat-time">Just now</div>
        `;
        chatBody.appendChild(reply);
        chatBody.scrollTop = chatBody.scrollHeight;
        showToast('🎉 WhatsApp Proof Approved! 100% Satisfaction.');
      }, 1000);
    });
  }

  if (simEditBtn && chatBody) {
    simEditBtn.addEventListener('click', () => {
      const outgoing = document.createElement('div');
      outgoing.className = 'chat-bubble outgoing';
      outgoing.innerHTML = `
        <strong>Emily (Customer):</strong><br>
        🔄 Hi! Can we adjust the jawline slightly and make the hair curls softer like in my second photo?
        <div class="chat-time">Just now ✓✓</div>
      `;
      chatBody.appendChild(outgoing);
      chatBody.scrollTop = chatBody.scrollHeight;

      showTypingIndicator();

      setTimeout(() => {
        hideTypingIndicator();
        const reply = document.createElement('div');
        reply.className = 'chat-bubble incoming';
        reply.innerHTML = `
          <strong>Tarelcraft Master Sculptor:</strong><br>
          ✨ Absolutely! We offer <strong>Unlimited Free Revisions</strong>. Our artist is adjusting the clay sculpt right now. New preview photo arriving shortly!
          <div class="chat-time">Just now</div>
        `;
        chatBody.appendChild(reply);
        chatBody.scrollTop = chatBody.scrollHeight;
        showToast('🔄 Unlimited Revision Requested! Free & Stress-free.');
      }, 1000);
    });
  }

  // Modal Triggers
  const modalOverlay = document.getElementById('interactive-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const uploadInfoTrigger = document.getElementById('upload-info-trigger');
  const whatsappModalTrigger = document.getElementById('whatsapp-modal-trigger');

  function openModal() {
    if (modalOverlay) modalOverlay.style.display = 'flex';
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.style.display = 'none';
  }

  if (uploadInfoTrigger) uploadInfoTrigger.addEventListener('click', openModal);
  if (whatsappModalTrigger) whatsappModalTrigger.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Toast Function
  function showToast(msg) {
    if (!toastEl || !toastMsgEl) return;
    toastMsgEl.textContent = msg;
    toastEl.style.display = 'flex';
    setTimeout(() => {
      toastEl.style.display = 'none';
    }, 3500);
  }

  // Buy Buttons: Add to Cart & Record Store Order in StoreEngine
  const buyBtns = document.querySelectorAll('.buy-button-main, .mobile-cta-btn');
  buyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      state.cartCount += 1;
      if (cartCountEl) {
        cartCountEl.textContent = state.cartCount;
        cartCountEl.classList.remove('bump');
        void cartCountEl.offsetWidth;
        cartCountEl.classList.add('bump');
      }

      // Calculate order total
      let base = state.basePrice || 49.90;
      base += priceModifiers.figureType[state.figureType] || 0;
      base += priceModifiers.height[state.height] || 0;
      base += priceModifiers.headStyle[state.headStyle] || 0;
      base += priceModifiers.baseTheme[state.baseTheme] || 0;

      // Save real simulated order to StoreEngine
      if (window.StoreEngine) {
        const figureTitle = (state.figureType.charAt(0).toUpperCase() + state.figureType.slice(1));
        const headTitle = (state.headStyle.charAt(0).toUpperCase() + state.headStyle.slice(1));
        const baseTitle = (state.baseTheme.charAt(0).toUpperCase() + state.baseTheme.slice(1));
        const configDesc = `${figureTitle} • ${state.height} • ${headTitle} • ${baseTitle} Base`;

        window.StoreEngine.addOrder({
          customer: 'Online Guest Buyer',
          email: 'guest.' + Date.now().toString().slice(-4) + '@tarelcraft.ch',
          phone: '+41 79 ' + Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(10 + Math.random() * 90) + ' ' + Math.floor(10 + Math.random() * 90),
          items: [
            { title: primaryProduct.title || "Bespoke 'MINI ME' Figurine", variant: configDesc, qty: 1, price: base }
          ],
          total: base,
          currency: state.currency,
          status: 'Unfulfilled',
          paymentStatus: 'Paid',
          whatsappStatus: 'Awaiting Photo Upload (Post-Checkout)',
          notes: state.engravingText ? `Engraving: "${state.engravingText}"` : 'No custom engraving',
          shippingAddress: 'Bahnhofstrasse 1, 8001 Zurich, Switzerland'
        });
      }

      triggerConfetti();
      showToast('🎁 Order placed! Stored in Shopify Admin & Concierge WhatsApp queue ready.');
    });
  });

  // Scroll Reveal Observer
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => observer.observe(el));

  // Periodic Live Social Proof Notification
  const recentOrders = [
    { name: 'Lukas M.', city: 'Zurich, Switzerland', item: 'Couple Bespoke MINI ME', time: '4 minutes ago' },
    { name: 'Sophie B.', city: 'Geneva, Switzerland', item: 'Single Bobblehead (WhatsApp Proof Approved)', time: '8 minutes ago' },
    { name: 'Alexander K.', city: 'Basel, Switzerland', item: 'Bespoke Figurine + Pet Edition', time: '14 minutes ago' }
  ];
  let orderIndex = 0;

  function cycleSocialProof() {
    if (!socialProofPopup) return;
    const current = recentOrders[orderIndex];
    const textEl = document.getElementById('social-proof-desc');
    const timeEl = document.getElementById('social-proof-time');

    if (textEl && timeEl) {
      textEl.innerHTML = `<strong>${current.name}</strong> from ${current.city} ordered <strong>${current.item}</strong>`;
      timeEl.textContent = current.time;
    }

    socialProofPopup.classList.add('is-active');

    setTimeout(() => {
      socialProofPopup.classList.remove('is-active');
      orderIndex = (orderIndex + 1) % recentOrders.length;
    }, 5000);
  }

  setTimeout(() => {
    cycleSocialProof();
    setInterval(cycleSocialProof, 16000);
  }, 4000);

  // Initial Calculation
  calculateTotal();
});
