// Initialize everything on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initScrollReveal();
    initSmoothScroll();
    initCarousel();
    initOrderModal();
});

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
                const target = document.querySelector(id);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ── Horizontal Carousel ────────────────────────────────── */
function initCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const dotsContainer = document.getElementById('carousel-dots');
    const btnPrev = document.getElementById('carousel-prev');
    const btnNext = document.getElementById('carousel-next');

    let current = 0;
    const total = slides.length;

    // Build dot indicators
    const dots = slides.map((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', `Slide ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(btn);
        return btn;
    });

    function goTo(index) {
        current = (index + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    btnPrev && btnPrev.addEventListener('click', () => goTo(current - 1));
    btnNext && btnNext.addEventListener('click', () => goTo(current + 1));

    // Touch / swipe support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 48) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    // Keyboard support
    document.addEventListener('keydown', e => {
        const root = document.querySelector('.carousel-root');
        if (!root) return;
        if (e.key === 'ArrowLeft')  goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Auto-advance every 6 seconds
    let timer = setInterval(() => goTo(current + 1), 6000);
    const root = document.querySelector('.carousel-root');
    if (root) {
        root.addEventListener('mouseenter', () => clearInterval(timer));
        root.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(current + 1), 6000); });
    }

    // Initialize
    goTo(0);
}

/* ── Order Modal Logic ──────────────────────────────────── */
function initOrderModal() {
    const modal = document.getElementById('order-modal');
    if (!modal) return;

    const modalClose = document.getElementById('modal-close');
    const form = document.getElementById('order-form');
    const productNameEl = document.getElementById('modal-product-name');
    const quantityInput = document.getElementById('quantity');
    const totalPriceEl = document.getElementById('modal-total-price');
    const clientNameInput = document.getElementById('client-name');
    
    // Custom Dropdown elements
    const customDropdown = document.getElementById('custom-dropdown');
    const customDropdownBtn = document.getElementById('custom-dropdown-btn');
    const customDropdownLabel = document.getElementById('custom-dropdown-label');
    const customDropdownMenu = document.getElementById('custom-dropdown-menu');
    const productOptionInput = document.getElementById('product-option');

    // Quantity Controls
    const qtyDec = document.getElementById('qty-dec');
    const qtyInc = document.getElementById('qty-inc');

    // Toggle hidden groups
    const deliveryMethodInput = document.getElementById('delivery-method');
    const deliveryMethodGroup = document.getElementById('delivery-method-group');
    const addressFieldGroup = document.getElementById('address-field-group');
    const deliveryAddressInput = document.getElementById('delivery-address');

    const paymentMethodInput = document.getElementById('payment-method');
    const paymentMethodGroup = document.getElementById('payment-method-group');
    const changeFieldGroup = document.getElementById('change-field-group');
    const changeAmountInput = document.getElementById('change-amount');
    const pixArea = document.getElementById('pix-area');
    const btnPixCopy = document.getElementById('btn-pix-copy');
    const btnPixText = document.getElementById('btn-pix-text');

    const btnSubmit = document.getElementById('btn-submit-order');

    let currentPrice = 0.0;
    
    // Product details configuration
    const productConfig = {
        "Pudim Clássico": {
            price: 17.00,
            options: ["Tradicional de Leite Moça"]
        },
        "Cones Trufados": {
            price: 5.00,
            options: ["Chocolate Tradicional", "Ninho com Nutella", "Misto"]
        },
        "Caixa de Trufas Gourmet": {
            price: 6.00,
            options: ["Ao Leite", "Meio Amargo", "Sensação", "Maracujá", "Sortido"]
        }
    };

    // Load saved client name
    const savedName = localStorage.getItem('pudimecia_client_name');
    if (savedName && clientNameInput) {
        clientNameInput.value = savedName;
    }

    // Toggle button selectors utility
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

    // Initialize toggle groups
    setupToggleGroup(deliveryMethodGroup, deliveryMethodInput, (val) => {
        if (val === 'entrega') {
            addressFieldGroup.style.display = 'flex';
            deliveryAddressInput.setAttribute('required', 'required');
        } else {
            addressFieldGroup.style.display = 'none';
            deliveryAddressInput.removeAttribute('required');
        }
    });

    setupToggleGroup(paymentMethodGroup, paymentMethodInput, (val) => {
        // Show/hide change group
        if (val === 'dinheiro') {
            changeFieldGroup.style.display = 'flex';
        } else {
            changeFieldGroup.style.display = 'none';
            changeAmountInput.value = '';
        }

        // Show/hide Pix area
        if (val === 'pix') {
            pixArea.style.display = 'flex';
            updatePixText();
        } else {
            pixArea.style.display = 'none';
        }
    });

    // Custom Dropdown Open/Close and Selection
    customDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        customDropdown.classList.toggle('open');
        const isOpen = customDropdown.classList.contains('open');
        customDropdownBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
        if (customDropdown && !customDropdown.contains(e.target)) {
            customDropdown.classList.remove('open');
            customDropdownBtn.setAttribute('aria-expanded', 'false');
        }
    });

    function populateDropdownOptions(productName) {
        customDropdownMenu.innerHTML = '';
        const options = productConfig[productName].options;

        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'custom-dropdown-item';
            item.setAttribute('role', 'option');
            item.setAttribute('data-value', opt);

            const textSpan = document.createElement('span');
            textSpan.textContent = opt;
            item.appendChild(textSpan);

            // Check icon SVG
            item.innerHTML += `
                <svg class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#C68B59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectDropdownOption(opt);
            });

            customDropdownMenu.appendChild(item);
        });

        if (options.length > 0) {
            selectDropdownOption(options[0]);
        }
    }

    function selectDropdownOption(value) {
        productOptionInput.value = value;
        customDropdownLabel.textContent = value;

        const items = customDropdownMenu.querySelectorAll('.custom-dropdown-item');
        items.forEach(item => {
            if (item.getAttribute('data-value') === value) {
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.classList.remove('selected');
                item.setAttribute('aria-selected', 'false');
            }
        });

        customDropdown.classList.remove('open');
        customDropdownBtn.setAttribute('aria-expanded', 'false');
    }

    // Quantity selectors logic
    qtyDec.addEventListener('click', () => {
        let val = parseInt(quantityInput.value) || 1;
        if (val > 1) {
            quantityInput.value = val - 1;
            updateTotals();
        }
    });

    qtyInc.addEventListener('click', () => {
        let val = parseInt(quantityInput.value) || 1;
        if (val < 10) {
            quantityInput.value = val + 1;
            updateTotals();
        }
    });

    // Update totals and Pix text
    function updateTotals() {
        const qty = parseInt(quantityInput.value) || 1;
        const total = qty * currentPrice;
        totalPriceEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        updatePixText();
    }

    function updatePixText() {
        if (paymentMethodInput.value === 'pix') {
            const qty = parseInt(quantityInput.value) || 1;
            const total = qty * currentPrice;
            btnPixText.textContent = `Copiar código Pix Copia e Cola (R$ ${total.toFixed(2).replace('.', ',')})`;
        }
    }

    // ── Pix EMV QR Code Generator Logic (Pure JS) ────────────
    function getEMVValue(id, val) {
        const len = String(val.length).padStart(2, '0');
        return `${id}${len}${val}`;
    }

    function generatePixEMV(chave, beneficiary, city, value) {
        let payload = getEMVValue('00', '01'); // Version
        
        // Merchant Account Info
        const gui = getEMVValue('00', 'br.gov.bcb.pix');
        const key = getEMVValue('01', chave);
        payload += getEMVValue('26', gui + key);

        payload += getEMVValue('52', '0000'); // Merchant Category
        payload += getEMVValue('53', '986');  // Currency BRL
        payload += getEMVValue('54', Number(value).toFixed(2)); // Value
        payload += getEMVValue('58', 'BR');   // Country
        payload += getEMVValue('59', beneficiary.substring(0, 25)); // Beneficiary Name
        payload += getEMVValue('60', city.substring(0, 15));        // City
        payload += getEMVValue('62', getEMVValue('05', '***'));     // Additional fields (TxID)

        payload += '6304'; // CRC Header

        // Calculate CRC16 CCITT
        let crc = 0xFFFF;
        for (let i = 0; i < payload.length; i++) {
            let byte = payload.charCodeAt(i);
            crc ^= (byte << 8);
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
            }
        }
        crc = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        return payload + crc;
    }

    // Copy Pix copy and paste string to clipboard
    btnPixCopy.addEventListener('click', () => {
        const qty = parseInt(quantityInput.value) || 1;
        const total = qty * currentPrice;
        
        // Generates dynamic Pix Copia e Cola
        const pixCode = generatePixEMV('suachave@email.com', 'Pudim e Cia', 'Araraquara', total);
        
        navigator.clipboard.writeText(pixCode).then(() => {
            const originalText = btnPixText.textContent;
            btnPixText.textContent = "✓ Copiado!";
            btnPixCopy.style.backgroundColor = "#25D366";
            
            setTimeout(() => {
                btnPixText.textContent = originalText;
                btnPixCopy.style.backgroundColor = "";
            }, 2000);
        }).catch(err => {
            console.error('Error copying text to clipboard:', err);
        });
    });

    // Opening modal via card click
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productName = card.getAttribute('data-product');
            const priceVal = parseFloat(card.getAttribute('data-price')) || 0.0;
            
            if (!productConfig[productName]) return;

            currentPrice = priceVal;
            productNameEl.textContent = productName;
            quantityInput.value = 1;

            // Populate Option Custom Dropdown dynamically
            populateDropdownOptions(productName);

            // Initialize defaults
            deliveryMethodGroup.querySelector('[data-value="entrega"]').click();
            paymentMethodGroup.querySelector('[data-value="pix"]').click();
            deliveryAddressInput.value = '';
            changeAmountInput.value = '';
            document.getElementById('observations').value = '';

            updateTotals();

            // Open Modal
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        });
    });

    // Closing modal
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Submit Order form
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Custom validation check
        const name = clientNameInput.value.trim();
        const address = deliveryAddressInput.value.trim();
        const option = productOptionInput.value;
        const qty = quantityInput.value;
        const deliveryType = deliveryMethodInput.value;
        const paymentType = paymentMethodInput.value;
        const change = changeAmountInput.value.trim();
        const obs = document.getElementById('observations').value.trim();

        if (!name) {
            alert('Por favor, informe seu nome.');
            clientNameInput.focus();
            return;
        }

        if (deliveryType === 'entrega' && !address) {
            alert('Por favor, informe seu endereço de entrega.');
            deliveryAddressInput.focus();
            return;
        }

        if (!option) {
            alert('Por favor, selecione uma opção de sabor.');
            customDropdownBtn.focus();
            return;
        }

        // Save Client Name in localStorage
        localStorage.setItem('pudimecia_client_name', name);

        // Feedback transition
        btnSubmit.disabled = true;
        const originalBtnContent = btnSubmit.innerHTML;
        btnSubmit.innerHTML = `<span>Processando comanda...</span><i data-lucide="loader" class="btn-icon animate-spin"></i>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            // Restore button
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalBtnContent;
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Format Output Message
            const total = qty * currentPrice;
            const totalStr = `R$ ${total.toFixed(2).replace('.', ',')}`;

            const emojiDetalhes = "\uD83C\uDF6E";  // 🍮
            const emojiCliente = "\uD83D\uDC64";   // 👤
            const emojiEntrega = "\uD83D\uDEF5";   // 🛵
            const emojiRetirada = "\uD83D\uDECD";  // 🛍️
            const emojiPagamento = "\uD83D\uDCB3"; // 💳
            const emojiObservacao = "\u270D\uFE0F"; // ✍️
            const emojiPix = "\uD83D\uDD11";       // 🔑

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
            msg += `*Produto:* ${productNameEl.textContent}\n`;
            msg += `*Quantidade:* ${qty}x\n`;
            msg += `*Opção/Sabor:* ${option}\n`;
            msg += `*Valor Total:* ${totalStr}\n\n`;
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
            msg += `*Forma:* ${paymentMethodStr}\n\n`;
            msg += `---\n`;
            msg += `${emojiObservacao} *OBSERVAÇÃO*\n`;
            msg += `${obs ? obs : 'Nenhuma'}`;

            // Append backup Pix code if paid via Pix
            if (paymentType === 'pix') {
                const pixCode = generatePixEMV('suachave@email.com', 'Pudim e Cia', 'Araraquara', total);
                msg += `\n\n---\n${emojiPix} *CÓDIGO PIX COPIA E COLA*\n${pixCode}`;
            }

            // Create WhatsApp Link and Redirect
            const whatsappUrl = `https://api.whatsapp.com/send?phone=5516991359739&text=${encodeURIComponent(msg)}`;
            
            // Close modal and redirect
            closeModal();
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        }, 1200);
    });
}
