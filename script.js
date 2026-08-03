/* ============================================================
   Pudim & CIA — Application Logic
   ============================================================ */

// TODO: substituir pela chave real
const PIX_KEY = 'suachave@email.com';
const PIX_BENEFICIARY = 'Pudim e Cia';
const PIX_CITY = 'Araraquara';
const WHATSAPP_PHONE = '5516991359739';
const CART_STORAGE_KEY = 'pudimecia_cart_v1';
const NAME_STORAGE_KEY = 'pudimecia_client_name';
const PIX_PLACEHOLDER = 'suachave@email.com';

const PRODUCT_CONFIG = {
    'Pudim Clássico': {
        price: 17.00,
        options: ['Tradicional de Leite Moça']
    },
    'Cones Trufados': {
        price: 5.00,
        options: ['Chocolate Tradicional', 'Ninho com Nutella', 'Misto']
    },
    'Caixa de Trufas Gourmet': {
        price: 6.00,
        options: ['Ao Leite', 'Meio Amargo', 'Sensação', 'Maracujá', 'Sortido']
    }
};

/** @type {{id:string, product:string, price:number, qty:number, option:string, observations:string}[]} */
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    refreshIcons();
    loadCart();
    initScrollReveal();
    initSmoothScroll();
    initNavbar();
    initSwiperCarousel();
    initItemModal();
    initCartDrawer();
    initCheckoutModal();
    initFabWhatsApp();
});

function refreshIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function formatBRL(value) {
    return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

/* ── Scroll Reveal ──────────────────────────────────────── */
function initScrollReveal() {
    const els = document.querySelectorAll('.reveal-fade');
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
}

/* ── Smooth Scroll ──────────────────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('.smooth-scroll').forEach(link => {
        link.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id && id.startsWith('#')) {
                e.preventDefault();
                const target = id === '#' ? document.body : document.querySelector(id);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                closeMobileMenu();
            }
        });
    });
}

/* ── Navbar ─────────────────────────────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('site-navbar');
    const toggle = document.getElementById('btn-menu-toggle');
    const links = document.getElementById('navbar-links');

    const onScroll = () => {
        if (!navbar) return;
        navbar.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('is-open');
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        });
    }
}

function closeMobileMenu() {
    const toggle = document.getElementById('btn-menu-toggle');
    const links = document.getElementById('navbar-links');
    if (!toggle || !links) return;
    links.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
}

/* ── Swiper Carousel ────────────────────────────────────── */
let essenceSwiper = null;

function isOverlayOpen() {
    return Boolean(
        document.getElementById('item-modal')?.classList.contains('active') ||
        document.getElementById('checkout-modal')?.classList.contains('active') ||
        document.getElementById('cart-drawer')?.classList.contains('active')
    );
}

function syncSwiperKeyboard() {
    if (!essenceSwiper?.keyboard) return;
    if (isOverlayOpen()) essenceSwiper.keyboard.disable();
    else essenceSwiper.keyboard.enable();
}

function initSwiperCarousel() {
    const el = document.querySelector('.essence-swiper');
    if (!el || typeof Swiper === 'undefined') return;

    essenceSwiper = new Swiper('.essence-swiper', {
        loop: true,
        speed: 650,
        autoplay: {
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        pagination: {
            el: '.essence-swiper .swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.essence-swiper .carousel-btn--next',
            prevEl: '.essence-swiper .carousel-btn--prev'
        },
        keyboard: {
            enabled: true,
            onlyInViewport: true
        },
        breakpoints: {
            0: {
                slidesPerView: 1.12,
                spaceBetween: 14,
                centeredSlides: false
            },
            768: {
                slidesPerView: 1,
                spaceBetween: 0,
                centeredSlides: false
            }
        }
    });
}

/* ── Focus Trap Helper ──────────────────────────────────── */
function getFocusable(container) {
    return Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.hasAttribute('hidden') && el.offsetParent !== null);
}

function trapFocus(container, event) {
    if (event.key !== 'Tab') return;
    const focusable = getFocusable(container);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function lockBody() { document.body.classList.add('modal-open'); }
function unlockBodyIfIdle() {
    const itemOpen = document.getElementById('item-modal')?.classList.contains('active');
    const checkoutOpen = document.getElementById('checkout-modal')?.classList.contains('active');
    const cartOpen = document.getElementById('cart-drawer')?.classList.contains('active');
    if (!itemOpen && !checkoutOpen && !cartOpen) {
        document.body.classList.remove('modal-open');
    }
}

/* ── Cart Persistence ───────────────────────────────────── */
function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        cart = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(cart)) cart = [];
    } catch {
        cart = [];
    }
    renderCart();
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    renderCart();
}

function cartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
    const badge = document.getElementById('cart-badge');
    const itemsEl = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('btn-checkout');
    const count = cartCount();

    if (badge) {
        if (count > 0) {
            badge.hidden = false;
            badge.textContent = String(count);
        } else {
            badge.hidden = true;
        }
    }

    if (subtotalEl) subtotalEl.textContent = formatBRL(cartTotal());
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    if (!itemsEl) return;

    if (cart.length === 0) {
        itemsEl.innerHTML = `<p class="cart-empty">Seu carrinho está vazio.<br>Escolha uma especialidade para começar.</p>`;
        return;
    }

    itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}" data-testid="cart-item-${item.id}">
            <div class="cart-item-info">
                <h4>${escapeHtml(item.product)}</h4>
                <p>${escapeHtml(item.option)}${item.observations ? ` · ${escapeHtml(item.observations)}` : ''}</p>
            </div>
            <div class="cart-item-price">${formatBRL(item.price * item.qty)}</div>
            <div class="cart-item-actions">
                <div class="cart-item-qty">
                    <button type="button" data-action="dec" data-testid="cart-dec-${item.id}" aria-label="Diminuir">−</button>
                    <span data-testid="cart-qty-${item.id}">${item.qty}</span>
                    <button type="button" data-action="inc" data-testid="cart-inc-${item.id}" aria-label="Aumentar">+</button>
                </div>
                <button type="button" class="cart-item-remove" data-action="remove" data-testid="cart-remove-${item.id}">Remover</button>
            </div>
        </div>
    `).join('');

    itemsEl.querySelectorAll('.cart-item').forEach(row => {
        const id = row.getAttribute('data-id');
        row.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const item = cart.find(c => c.id === id);
                if (!item) return;
                if (action === 'inc' && item.qty < 10) item.qty += 1;
                if (action === 'dec' && item.qty > 1) item.qty -= 1;
                if (action === 'remove') cart = cart.filter(c => c.id !== id);
                saveCart();
            });
        });
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ── Cart Drawer ────────────────────────────────────────── */
function initCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    const openBtn = document.getElementById('btn-cart-nav');
    const closeBtn = document.getElementById('cart-drawer-close');
    const checkoutBtn = document.getElementById('btn-checkout');

    if (!drawer) return;

    const open = () => {
        drawer.classList.add('active');
        overlay?.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        overlay?.setAttribute('aria-hidden', 'false');
        lockBody();
        syncSwiperKeyboard();
        refreshIcons();
        const focusable = getFocusable(drawer);
        (focusable[0] || closeBtn)?.focus();
    };

    const close = () => {
        drawer.classList.remove('active');
        overlay?.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        overlay?.setAttribute('aria-hidden', 'true');
        unlockBodyIfIdle();
        syncSwiperKeyboard();
        openBtn?.focus();
    };

    openBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    checkoutBtn?.addEventListener('click', () => {
        if (cart.length === 0) return;
        close();
        openCheckoutModal();
    });

    drawer.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            close();
        } else {
            trapFocus(drawer, e);
        }
    });

    window.__openCartDrawer = open;
    window.__closeCartDrawer = close;
}

/* ── Item Modal (Add to Cart) ───────────────────────────── */
function initItemModal() {
    const modal = document.getElementById('item-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('item-modal-close');
    const form = document.getElementById('item-form');
    const productNameEl = document.getElementById('item-product-name');
    const quantityInput = document.getElementById('item-quantity');
    const totalPriceEl = document.getElementById('item-total-price');
    const dropdown = document.getElementById('item-dropdown');
    const dropdownBtn = document.getElementById('item-dropdown-btn');
    const dropdownLabel = document.getElementById('item-dropdown-label');
    const dropdownMenu = document.getElementById('item-dropdown-menu');
    const optionInput = document.getElementById('item-option');
    const optionError = document.getElementById('item-option-error');
    const obsInput = document.getElementById('item-observations');
    const qtyDec = document.getElementById('item-qty-dec');
    const qtyInc = document.getElementById('item-qty-inc');

    let currentProduct = '';
    let currentPrice = 0;
    let lastFocus = null;

    function updateTotals() {
        const qty = parseInt(quantityInput.value, 10) || 1;
        totalPriceEl.textContent = formatBRL(qty * currentPrice);
    }

    function selectOption(value) {
        optionInput.value = value;
        dropdownLabel.textContent = value;
        optionError.textContent = '';
        dropdownBtn.classList.remove('is-invalid');
        dropdownMenu.querySelectorAll('.custom-dropdown-item').forEach(item => {
            const selected = item.getAttribute('data-value') === value;
            item.classList.toggle('selected', selected);
            item.setAttribute('aria-selected', String(selected));
        });
        dropdown.classList.remove('open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
    }

    function populateOptions(productName) {
        dropdownMenu.innerHTML = '';
        const options = PRODUCT_CONFIG[productName].options;
        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'custom-dropdown-item';
            item.setAttribute('role', 'option');
            item.setAttribute('data-value', opt);
            item.setAttribute('data-testid', `item-option-${opt}`);
            item.innerHTML = `
                <span>${escapeHtml(opt)}</span>
                <svg class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20 6L9 17L4 12" stroke="#C68B59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectOption(opt);
            });
            dropdownMenu.appendChild(item);
        });
        if (options.length) selectOption(options[0]);
    }

    function openItemModal(productName, price) {
        if (!PRODUCT_CONFIG[productName]) return;
        lastFocus = document.activeElement;
        currentProduct = productName;
        currentPrice = price;
        productNameEl.textContent = productName;
        quantityInput.value = 1;
        obsInput.value = '';
        optionError.textContent = '';
        dropdownBtn.classList.remove('is-invalid');
        populateOptions(productName);
        updateTotals();

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        lockBody();
        syncSwiperKeyboard();
        refreshIcons();
        setTimeout(() => dropdownBtn.focus(), 50);
    }

    function closeItemModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        dropdown.classList.remove('open');
        unlockBodyIfIdle();
        syncSwiperKeyboard();
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    document.querySelectorAll('.product-card').forEach(card => {
        const open = () => {
            const name = card.getAttribute('data-product');
            const price = parseFloat(card.getAttribute('data-price')) || 0;
            openItemModal(name, price);
        };
        card.addEventListener('click', (e) => {
            // Allow button click without double-handling oddly
            open();
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });
        card.querySelector('.btn-encomendar')?.addEventListener('click', (e) => {
            e.stopPropagation();
            open();
        });
    });

    qtyDec.addEventListener('click', () => {
        let val = parseInt(quantityInput.value, 10) || 1;
        if (val > 1) {
            quantityInput.value = val - 1;
            updateTotals();
        }
    });
    qtyInc.addEventListener('click', () => {
        let val = parseInt(quantityInput.value, 10) || 1;
        if (val < 10) {
            quantityInput.value = val + 1;
            updateTotals();
        }
    });

    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        dropdownBtn.setAttribute('aria-expanded', String(dropdown.classList.contains('open')));
    });

    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            dropdownBtn.setAttribute('aria-expanded', 'false');
        }
    });

    closeBtn.addEventListener('click', closeItemModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeItemModal();
    });

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            closeItemModal();
        } else {
            trapFocus(modal, e);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const option = optionInput.value;
        if (!option) {
            optionError.textContent = 'Selecione uma opção de sabor.';
            dropdownBtn.classList.add('is-invalid');
            dropdownBtn.focus();
            return;
        }

        const qty = parseInt(quantityInput.value, 10) || 1;
        const observations = obsInput.value.trim();

        // Merge with existing same product+option+obs
        const existing = cart.find(c =>
            c.product === currentProduct &&
            c.option === option &&
            c.observations === observations
        );

        if (existing) {
            existing.qty = Math.min(10, existing.qty + qty);
        } else {
            cart.push({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                product: currentProduct,
                price: currentPrice,
                qty,
                option,
                observations
            });
        }

        saveCart();
        closeItemModal();
        window.__openCartDrawer?.();
    });
}

/* ── Pix EMV ────────────────────────────────────────────── */
function getEMVValue(id, val) {
    const len = String(val.length).padStart(2, '0');
    return `${id}${len}${val}`;
}

function generatePixEMV(chave, beneficiary, city, value) {
    let payload = getEMVValue('00', '01');
    const gui = getEMVValue('00', 'br.gov.bcb.pix');
    const key = getEMVValue('01', chave);
    payload += getEMVValue('26', gui + key);
    payload += getEMVValue('52', '0000');
    payload += getEMVValue('53', '986');
    payload += getEMVValue('54', Number(value).toFixed(2));
    payload += getEMVValue('58', 'BR');
    payload += getEMVValue('59', beneficiary.substring(0, 25));
    payload += getEMVValue('60', city.substring(0, 15));
    payload += getEMVValue('62', getEMVValue('05', '***'));
    payload += '6304';

    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        let byte = payload.charCodeAt(i);
        crc ^= (byte << 8);
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
            else crc = crc << 1;
        }
    }
    crc = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return payload + crc;
}

function isPixPlaceholder() {
    return PIX_KEY === PIX_PLACEHOLDER || PIX_KEY.includes('suachave');
}

/* ── Checkout Modal ─────────────────────────────────────── */
function initCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('checkout-modal-close');
    const form = document.getElementById('checkout-form');
    const clientNameInput = document.getElementById('client-name');
    const clientNameError = document.getElementById('client-name-error');
    const deliveryMethodInput = document.getElementById('delivery-method');
    const deliveryMethodGroup = document.getElementById('delivery-method-group');
    const addressFieldGroup = document.getElementById('address-field-group');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const deliveryAddressError = document.getElementById('delivery-address-error');
    const paymentMethodInput = document.getElementById('payment-method');
    const paymentMethodGroup = document.getElementById('payment-method-group');
    const changeFieldGroup = document.getElementById('change-field-group');
    const changeAmountInput = document.getElementById('change-amount');
    const pixArea = document.getElementById('pix-area');
    const pixNotice = document.getElementById('pix-placeholder-notice');
    const btnPixCopy = document.getElementById('btn-pix-copy');
    const btnPixText = document.getElementById('btn-pix-text');
    const totalPriceEl = document.getElementById('checkout-total-price');
    const btnSubmit = document.getElementById('btn-submit-order');

    let lastFocus = null;

    const savedName = localStorage.getItem(NAME_STORAGE_KEY);
    if (savedName && clientNameInput) clientNameInput.value = savedName;

    function setupToggleGroup(groupEl, hiddenInput, onChange) {
        const buttons = groupEl.querySelectorAll('.btn-toggle');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const value = btn.getAttribute('data-value');
                hiddenInput.value = value;
                if (onChange) onChange(value);
            });
        });
    }

    function updatePixUI() {
        const total = cartTotal();
        btnPixText.textContent = `Copiar código Pix Copia e Cola (${formatBRL(total)})`;
        if (pixNotice) pixNotice.hidden = !isPixPlaceholder();
    }

    function updateCheckoutTotals() {
        totalPriceEl.textContent = formatBRL(cartTotal());
        updatePixUI();
    }

    setupToggleGroup(deliveryMethodGroup, deliveryMethodInput, (val) => {
        if (val === 'entrega') {
            addressFieldGroup.hidden = false;
            addressFieldGroup.style.display = 'flex';
            deliveryAddressInput.setAttribute('required', 'required');
        } else {
            addressFieldGroup.hidden = true;
            addressFieldGroup.style.display = 'none';
            deliveryAddressInput.removeAttribute('required');
            clearFieldError(deliveryAddressInput, deliveryAddressError);
        }
    });

    setupToggleGroup(paymentMethodGroup, paymentMethodInput, (val) => {
        if (val === 'dinheiro') {
            changeFieldGroup.hidden = false;
            changeFieldGroup.style.display = 'flex';
        } else {
            changeFieldGroup.hidden = true;
            changeFieldGroup.style.display = 'none';
            changeAmountInput.value = '';
        }

        if (val === 'pix') {
            pixArea.hidden = false;
            pixArea.style.display = 'flex';
            updatePixUI();
        } else {
            pixArea.hidden = true;
            pixArea.style.display = 'none';
        }
    });

    btnPixCopy.addEventListener('click', () => {
        const total = cartTotal();
        const pixCode = generatePixEMV(PIX_KEY, PIX_BENEFICIARY, PIX_CITY, total);
        navigator.clipboard.writeText(pixCode).then(() => {
            const originalText = btnPixText.textContent;
            btnPixText.textContent = '✓ Copiado!';
            btnPixCopy.style.backgroundColor = '#25D366';
            setTimeout(() => {
                btnPixText.textContent = originalText;
                btnPixCopy.style.backgroundColor = '';
            }, 2000);
        }).catch(err => console.error('Error copying text to clipboard:', err));
    });

    function clearFieldError(input, errorEl) {
        input?.classList.remove('is-invalid');
        if (errorEl) errorEl.textContent = '';
    }

    function setFieldError(input, errorEl, message) {
        input?.classList.add('is-invalid');
        if (errorEl) errorEl.textContent = message;
    }

    function openCheckoutModal() {
        if (cart.length === 0) return;
        lastFocus = document.activeElement;
        clearFieldError(clientNameInput, clientNameError);
        clearFieldError(deliveryAddressInput, deliveryAddressError);

        deliveryMethodGroup.querySelector('[data-value="entrega"]')?.click();
        paymentMethodGroup.querySelector('[data-value="pix"]')?.click();
        deliveryAddressInput.value = '';
        changeAmountInput.value = '';

        const saved = localStorage.getItem(NAME_STORAGE_KEY);
        if (saved) clientNameInput.value = saved;

        updateCheckoutTotals();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        lockBody();
        syncSwiperKeyboard();
        refreshIcons();
        setTimeout(() => clientNameInput.focus(), 50);
    }

    function closeCheckoutModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        unlockBodyIfIdle();
        syncSwiperKeyboard();
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    window.openCheckoutModal = openCheckoutModal;

    closeBtn.addEventListener('click', closeCheckoutModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCheckoutModal();
    });

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            closeCheckoutModal();
        } else {
            trapFocus(modal, e);
        }
    });

    // Global ESC as safety net when any modal/drawer is open
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (modal.classList.contains('active')) closeCheckoutModal();
        else if (document.getElementById('item-modal')?.classList.contains('active')) {
            document.getElementById('item-modal-close')?.click();
        } else if (document.getElementById('cart-drawer')?.classList.contains('active')) {
            window.__closeCartDrawer?.();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = clientNameInput.value.trim();
        const address = deliveryAddressInput.value.trim();
        const deliveryType = deliveryMethodInput.value;
        const paymentType = paymentMethodInput.value;
        const change = changeAmountInput.value.trim();

        clearFieldError(clientNameInput, clientNameError);
        clearFieldError(deliveryAddressInput, deliveryAddressError);

        let firstInvalid = null;

        if (!name) {
            setFieldError(clientNameInput, clientNameError, 'Por favor, informe seu nome.');
            firstInvalid = clientNameInput;
        }

        if (deliveryType === 'entrega' && !address) {
            setFieldError(deliveryAddressInput, deliveryAddressError, 'Por favor, informe o endereço de entrega.');
            if (!firstInvalid) firstInvalid = deliveryAddressInput;
        }

        if (cart.length === 0) {
            return;
        }

        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        localStorage.setItem(NAME_STORAGE_KEY, name);

        const total = cartTotal();
        const totalStr = formatBRL(total);

        const emojiDetalhes = '\uD83C\uDF6E';
        const emojiCliente = '\uD83D\uDC64';
        const emojiEntrega = '\uD83D\uDEF5';
        const emojiRetirada = '\uD83D\uDECD';
        const emojiPagamento = '\uD83D\uDCB3';
        const emojiObservacao = '\u270D\uFE0F';
        const emojiPix = '\uD83D\uDD11';

        const deliveryIcon = deliveryType === 'entrega' ? emojiEntrega : emojiRetirada;
        const deliveryMethodStr = deliveryType === 'entrega' ? 'Entrega (Delivery)' : 'Retirar na Loja';
        let paymentMethodStr = '';
        if (paymentType === 'pix') {
            paymentMethodStr = 'Pix (Pago via Copia e Cola do site)';
        } else if (paymentType === 'cartao') {
            paymentMethodStr = 'Cartão';
        } else {
            paymentMethodStr = `Dinheiro (Troco para: ${change ? change : 'Não necessário'})`;
        }

        let msg = `Olá, Pudim & Cia! Gostaria de fazer um pedido através do site:\n\n`;
        msg += `${emojiDetalhes} *DETALHES DO PEDIDO*\n`;
        cart.forEach((item, idx) => {
            msg += `\n*Item ${idx + 1}:* ${item.product}\n`;
            msg += `*Quantidade:* ${item.qty}x\n`;
            msg += `*Opção/Sabor:* ${item.option}\n`;
            msg += `*Subtotal:* ${formatBRL(item.price * item.qty)}\n`;
            if (item.observations) {
                msg += `*Obs. do item:* ${item.observations}\n`;
            }
        });
        msg += `\n*Valor Total:* ${totalStr}\n\n`;
        msg += `---\n`;
        msg += `${emojiCliente} *CLIENTE*\n`;
        msg += `*Nome:* ${name}\n\n`;
        msg += `---\n`;
        msg += `${deliveryIcon} *ENVIO*\n`;
        msg += `*Tipo:* ${deliveryMethodStr}\n`;
        if (deliveryType === 'entrega') {
            msg += `*Endereço:* ${address}\n`;
        }
        msg += `\n---\n`;
        msg += `${emojiPagamento} *PAGAMENTO*\n`;
        msg += `*Forma:* ${paymentMethodStr}\n`;

        if (paymentType === 'pix') {
            const pixCode = generatePixEMV(PIX_KEY, PIX_BENEFICIARY, PIX_CITY, total);
            msg += `\n---\n${emojiPix} *CÓDIGO PIX COPIA E COLA*\n${pixCode}`;
        }

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(msg)}`;

        // Immediate redirect within user gesture — avoid popup blockers
        btnSubmit.disabled = true;
        const originalBtnContent = btnSubmit.innerHTML;
        btnSubmit.innerHTML = `<span>Abrindo WhatsApp...</span><i data-lucide="loader" class="btn-icon animate-spin"></i>`;
        refreshIcons();

        // Clear cart after building message
        cart = [];
        saveCart();
        closeCheckoutModal();

        // Prefer same-tab navigation as reliable fallback for mobile popup blockers
        const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
            window.location.href = whatsappUrl;
        }

        // Restore button state for when user returns
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnContent;
        refreshIcons();
    });
}

/* ── Floating WhatsApp ──────────────────────────────────── */
function initFabWhatsApp() {
    const fab = document.getElementById('fab-whatsapp');
    if (!fab) return;

    const onScroll = () => {
        fab.classList.toggle('is-visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}
