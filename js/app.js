/* ==========================================================================
   TARELCRAFT INTERACTIVE PRODUCT PAGE SCRIPT
   Enhanced with Dark/Light Theme Switcher, Real Playable HTML5 Video & Dynamic Figures
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    theme: localStorage.getItem('tarelcraft-theme') || 'light',
    currency: 'CHF',
    rates: { CHF: 1.0, EUR: 1.05, USD: 1.15 },
    symbols: { CHF: 'CHF', EUR: '€', USD: '$' },
    basePrice: 49.90,
    comparePrice: 99.80,
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

  // Authentic Tarelcraft HD Playable Video Reels
  const reelsData = [
    {
      video: 'assets/videos/unboxing-1.mp4',
      cdnVideo: 'https://tarelcraft.com/cdn/shop/videos/c/vp/60f6bbcf350f44228c57ce5410424d05/60f6bbcf350f44228c57ce5410424d05.HD-1080p-7.2Mbps-50901326.mp4?v=0',
      poster: 'assets/images/unboxing-1.jpg',
      title: 'Emily R. • Zurich (Verified Buyer)',
      desc: '"The WhatsApp preview was so reassuring! Resemblance blew me away! 😭✨"'
    },
    {
      video: 'assets/videos/unboxing-2.mp4',
      cdnVideo: 'https://tarelcraft.com/cdn/shop/videos/c/vp/ea4909b6b23b4e46875a3cc0b2c6970a/ea4909b6b23b4e46875a3cc0b2c6970a.HD-1080p-7.2Mbps-83368704.mp4?v=0',
      poster: 'assets/images/unboxing-2.jpg',
      title: 'Liam & Sarah • Bern (Verified Couple)',
      desc: '"Uploaded photos on WhatsApp after order. Best anniversary keepsake ever!"'
    },
    {
      video: 'assets/videos/unboxing-3.mp4',
      cdnVideo: 'https://tarelcraft.com/cdn/shop/videos/c/vp/ea8367eefbb84d70925e3c9160f73a6a/ea8367eefbb84d70925e3c9160f73a6a.HD-1080p-7.2Mbps-86226255.mp4?v=0',
      poster: 'assets/images/unboxing-3.jpg',
      title: 'Sarah for Dad Arthur • Geneva (Retirement)',
      desc: '"Dad cried tears of joy! Artist made 2 hair tweaks on WhatsApp for free."'
    }
  ];

  // Pricing Matrix
  const priceModifiers = {
    figureType: { single: 0, couple: 30, pet: 15, family: 60 },
    height: { '18cm': 0, '20cm': 10, '22cm': 20 },
    headStyle: { bobblehead: 10, fixed: 0 },
    baseTheme: { walnut: 0, acrylic: 5, heart: 5, soccer: 5 }
  };

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

  // ==========================================================================
  // 1. THEME SWITCHER (LIGHT / DARK MODE)
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
  // 2. CONFETTI CANVAS ENGINE
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
  // 3. REAL HTML5 VIDEO PLAYER (UNBOXING REELS)
  // ==========================================================================
  const reelCards = document.querySelectorAll('.unboxing-reel-card');

  // Preview video on hover on desktop
  reelCards.forEach((card, index) => {
    const videoElem = card.querySelector('video.reel-preview-video');
    if (videoElem) {
      card.addEventListener('mouseenter', () => {
        videoElem.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        videoElem.pause();
      });
    }

    card.addEventListener('click', () => {
      openVideoModal(index);
    });

    const likeBtn = card.querySelector('.reel-like-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        likeBtn.classList.toggle('liked');
        if (likeBtn.classList.contains('liked')) {
          triggerConfetti();
          showToast('❤️ Added to favorites!');
        }
      });
    }
  });

  function openVideoModal(index) {
    state.activeReelIndex = index;
    const reel = reelsData[index];
    if (!reel || !activeVideoPlayer) return;

    activeVideoPlayer.src = reel.video;
    activeVideoPlayer.poster = reel.poster;
    activeVideoPlayer.currentTime = 0;

    if (modalVideoTitle) modalVideoTitle.textContent = reel.title;
    if (modalVideoDesc) modalVideoDesc.textContent = reel.desc;
    if (modalLikeBtn) modalLikeBtn.classList.remove('liked');

    if (videoModalOverlay) {
      videoModalOverlay.style.display = 'flex';
      activeVideoPlayer.play().catch(() => {
        activeVideoPlayer.src = reel.cdnVideo;
        activeVideoPlayer.play().catch(() => {});
      });
      if (videoIconState) videoIconState.className = 'fa-solid fa-pause';
    }
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
    // Timeupdate for progress fill
    activeVideoPlayer.addEventListener('timeupdate', () => {
      if (activeVideoPlayer.duration) {
        const percent = (activeVideoPlayer.currentTime / activeVideoPlayer.duration) * 100;
        if (videoProgressFill) {
          videoProgressFill.style.width = `${percent}%`;
        }
      }
    });

    // Play / Pause event listeners
    activeVideoPlayer.addEventListener('play', () => {
      if (videoIconState) videoIconState.className = 'fa-solid fa-pause';
    });

    activeVideoPlayer.addEventListener('pause', () => {
      if (videoIconState) videoIconState.className = 'fa-solid fa-play';
    });
  }

  // Toggle Play / Pause Button
  if (videoToggleBtn && activeVideoPlayer) {
    videoToggleBtn.addEventListener('click', () => {
      if (activeVideoPlayer.paused) {
        activeVideoPlayer.play();
      } else {
        activeVideoPlayer.pause();
      }
    });
  }

  // Toggle Sound Button
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

  // Seek on progress bar click
  if (videoProgressBar && activeVideoPlayer) {
    videoProgressBar.addEventListener('click', (e) => {
      const rect = videoProgressBar.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      if (activeVideoPlayer.duration) {
        activeVideoPlayer.currentTime = clickPos * activeVideoPlayer.duration;
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
  // 4. FIGURE SELECTION & DYNAMIC IMAGE SWITCHER (FAMILY, PET, COUPLE, SINGLE)
  // ==========================================================================
  const figureCards = document.querySelectorAll('.figure-card');
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

    // Sync Thumbnails active state
    thumbnails.forEach(thumb => {
      if (thumb.getAttribute('data-type') === figureKey) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  figureCards.forEach(card => {
    card.addEventListener('click', () => {
      figureCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.figureType = card.getAttribute('data-figure');

      if (figureTypeSelected) {
        figureTypeSelected.textContent = card.querySelector('.v-title').textContent;
      }

      // Dynamically switch hero image based on option
      updateProductImage(state.figureType);
      calculateTotal();

      if (state.figureType === 'family') {
        showToast('👨‍👩‍👧‍👦 Family / Group Figurine selected (+ CHF 60.00)');
      } else if (state.figureType === 'pet') {
        showToast('🐾 Person + Pet Custom Figurine selected (+ CHF 15.00)');
      } else if (state.figureType === 'couple') {
        showToast('💑 Couple Custom Figurine selected (+ CHF 30.00)');
      }
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

      // Sync with figure selector if applicable
      if (thumbType) {
        figureCards.forEach(c => {
          if (c.getAttribute('data-figure') === thumbType) {
            c.click();
          }
        });
      }
    });
  });

  // ==========================================================================
  // 5. INTERACTIVE COMPARISON TABS (QUALITY MATTERS SECTION)
  // ==========================================================================
  const compTabs = document.querySelectorAll('.comp-tab-btn');
  const compCards = document.querySelectorAll('.creative-comp-card');

  compTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      compTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      compCards.forEach(card => {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.transform = 'scale(1)';
        }, 150);
      });
      showToast(`Showing comparison filter: ${tab.textContent}`);
    });
  });

  // ==========================================================================
  // 6. BOBBLEHEAD WOBBLE ON CLICK (SIMPLE & CLEAN)
  // ==========================================================================
  function triggerBobbleAnimation() {
    if (!mainImageViewport) return;
    mainImageViewport.classList.remove('is-bobbling');
    void mainImageViewport.offsetWidth;
    mainImageViewport.classList.add('is-bobbling');
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
  // 7. DYNAMIC PRICING & CURRENCY CONVERSION
  // ==========================================================================
  function calculateTotal() {
    let base = 49.90;
    let compareBase = 99.80;

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
    const symbol = state.symbols[state.currency];

    const formattedPrice = state.currency === 'EUR' || state.currency === 'USD' 
      ? `${symbol}${finalPrice}` 
      : `${symbol} ${finalPrice}`;

    const formattedCompare = state.currency === 'EUR' || state.currency === 'USD' 
      ? `${symbol}${finalCompare}` 
      : `${symbol} ${finalCompare}`;

    if (currentPriceEl) {
      currentPriceEl.textContent = formattedPrice;
      currentPriceEl.classList.remove('price-updated');
      void currentPriceEl.offsetWidth;
      currentPriceEl.classList.add('price-updated');
    }
    if (comparePriceEl) comparePriceEl.textContent = formattedCompare;
    if (stickyPriceEl) stickyPriceEl.textContent = formattedPrice;
  }

  if (currencySelector) {
    currencySelector.addEventListener('change', (e) => {
      state.currency = e.target.value;
      calculateTotal();
      showToast(`Currency changed to ${state.currency}`);
    });
  }

  // Height Selectors
  const heightCards = document.querySelectorAll('.height-card');
  heightCards.forEach(card => {
    card.addEventListener('click', () => {
      heightCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.height = card.getAttribute('data-height');
      if (heightSelected) {
        heightSelected.textContent = card.querySelector('.v-title').textContent;
      }
      calculateTotal();
    });
  });

  // Head Style Selectors
  const headStyleCards = document.querySelectorAll('.head-style-card');
  headStyleCards.forEach(card => {
    card.addEventListener('click', () => {
      headStyleCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.headStyle = card.getAttribute('data-head');
      if (state.headStyle === 'bobblehead') {
        triggerBobbleAnimation();
      }
      calculateTotal();
    });
  });

  // Base Theme Selectors
  const baseCards = document.querySelectorAll('.base-card');
  baseCards.forEach(card => {
    card.addEventListener('click', () => {
      baseCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.baseTheme = card.getAttribute('data-base');
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

  // FAQ Accordion
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach(card => {
    const btn = card.querySelector('.faq-question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        faqCards.forEach(c => c.classList.remove('open'));
        if (!isOpen) {
          card.classList.add('open');
        }
      });
    }
  });

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

  // Buy Buttons with Confetti & Cart Counter Bump
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
      triggerConfetti();
      showToast('🎁 Added to Order! Remember: No photos needed now—upload anytime after checkout!');
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
