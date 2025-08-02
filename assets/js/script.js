// No terms page JS present. No action needed. 

// Simple Cart Logic for Techwear

document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const addToCartBtn = document.querySelector('.order-btn');
    const cartIcon = document.querySelectorAll('.cart-btn, .floating-cart .cart-icon');
    const cartCountEls = document.querySelectorAll('.cart-count');

    // Mobile Menu Toggle - Initialize first to ensure it works on all pages
    function initializeMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const menuClose = document.querySelector('.mobile-menu-close');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function() {
                console.log('Mobile menu toggled');
                mobileMenu.classList.toggle('open');
                document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
            });
        }
        
        if (menuClose && mobileMenu) {
            menuClose.addEventListener('click', function() {
                console.log('Mobile menu closed');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        }
    }
    
    // Initialize mobile menu right away
    initializeMobileMenu();

    // Product info (for demo, from product-detail page)
    function getProductInfo() {
        const title = document.querySelector('.product-title')?.textContent?.trim() || 'Product';
        const price = document.querySelector('.price-value')?.textContent?.trim() || '0';
        const colorBtn = document.querySelector('.color-btn.active');
        const color = colorBtn ? colorBtn.style.backgroundColor : '';
        const sizeBtn = document.querySelector('.size-btn.active');
        const size = sizeBtn ? sizeBtn.textContent.trim() : '';
        const qty = document.querySelector('.quantity-input')?.value || 1;
        const img = document.querySelector('.main-image img')?.src || '';
        return { title, price, color, size, qty, img };
    }

    // Cart helpers
    function getCart() {
        return JSON.parse(localStorage.getItem('sp_cart') || '[]');
    }
    function setCart(cart) {
        localStorage.setItem('sp_cart', JSON.stringify(cart));
    }
    function updateCartCount() {
        const cart = getCart();
        cartCountEls.forEach(el => el.textContent = cart.reduce((sum, item) => sum + Number(item.qty), 0));
    }

    // Add to Cart
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const product = getProductInfo();
            let cart = getCart();
            // Check if same product (by title, color, size)
            const idx = cart.findIndex(item => item.title === product.title && item.color === product.color && item.size === product.size);
            if (idx > -1) {
                cart[idx].qty = Number(cart[idx].qty) + Number(product.qty);
            } else {
                cart.push(product);
            }
            setCart(cart);
            updateCartCount();
            window.location.href = 'cart.html';
        });
    }

    // Show Cart Modal
    function showCartModal() {
        let cart = getCart();
        let modal = document.getElementById('sp-cart-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'sp-cart-modal';
            modal.innerHTML = `
                <div class="sp-cart-backdrop"></div>
                <div class="sp-cart-modal-content">
                    <h2>Your Cart</h2>
                    <div class="sp-cart-items"></div>
                    <button class="btn primary-btn sp-confirm-btn">Confirm Payment</button>
                    <button class="btn outline-btn sp-close-btn">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        // Fill cart items
        const itemsDiv = modal.querySelector('.sp-cart-items');
        if (cart.length === 0) {
            itemsDiv.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            itemsDiv.innerHTML = cart.map(item => `
                <div class="sp-cart-item">
                    <img src="${item.img}" alt="${item.title}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;margin-right:10px;">
                    <span><strong>${item.title}</strong> (${item.size}, <span style="background:${item.color};padding:0 8px;border-radius:8px;"></span>) x${item.qty} - $${item.price}</span>
                </div>
            `).join('');
        }
        modal.style.display = 'flex';
        // Close
        modal.querySelector('.sp-close-btn').onclick = () => { modal.style.display = 'none'; };
        modal.querySelector('.sp-cart-backdrop').onclick = () => { modal.style.display = 'none'; };
        // Confirm
        modal.querySelector('.sp-confirm-btn').onclick = () => {
            modal.style.display = 'none';
            window.location.href = 'order-request.html';
        };
    }

    // Cart icon click
    cartIcon.forEach(icon => {
        icon.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'cart.html';
        });
    });

    // On page load, update cart count
    updateCartCount();

    // Product Detail Tabs
    function setupProductTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        if (!tabBtns.length || !tabPanes.length) return;
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active from all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                // Add active to clicked
                this.classList.add('active');
                const tab = this.getAttribute('data-tab');
                const pane = document.getElementById(tab);
                if (pane) pane.classList.add('active');
            });
        });
    }
    setupProductTabs();

    // Price Range Slider Functionality
    function initPriceRange() {
        const minThumb = document.getElementById('minThumb');
        const maxThumb = document.getElementById('maxThumb');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const track = document.querySelector('.price-slider-track');
        const container = document.querySelector('.price-slider-container');
        
        let isDragging = false;
        let activeThumb = null;
        
        function updateTrack() {
            const min = parseInt(minPrice.value);
            const max = parseInt(maxPrice.value);
            const minPos = (min / 500) * 100;
            const maxPos = (max / 500) * 100;
            
            track.style.left = `${minPos}%`;
            track.style.width = `${maxPos - minPos}%`;
            
            minThumb.style.left = `${minPos}%`;
            maxThumb.style.left = `${maxPos}%`;
        }
        
        function handleInput(input, isMin) {
            let value = parseInt(input.value);
            value = Math.min(500, Math.max(0, value));
            input.value = value;
            
            if (isMin) {
                const max = parseInt(maxPrice.value);
                if (value > max) {
                    maxPrice.value = value;
                }
            } else {
                const min = parseInt(minPrice.value);
                if (value < min) {
                    minPrice.value = min;
                }
            }
            
            updateTrack();
        }
        
        function handleMouseDown(e, thumb) {
            isDragging = true;
            activeThumb = thumb;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        function handleMouseMove(e) {
            if (!isDragging || !activeThumb) return;
            
            const rect = container.getBoundingClientRect();
            let pos = (e.clientX - rect.left) / rect.width;
            pos = Math.min(1, Math.max(0, pos));
            
            const value = Math.round(pos * 500);
            
            if (activeThumb === minThumb) {
                const max = parseInt(maxPrice.value);
                if (value <= max) {
                    minPrice.value = value;
                }
            } else {
                const min = parseInt(minPrice.value);
                if (value >= min) {
                    maxPrice.value = value;
                }
            }
            
            updateTrack();
        }
        
        function handleMouseUp() {
            isDragging = false;
            activeThumb = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        
        // Event Listeners
        minPrice.addEventListener('input', () => handleInput(minPrice, true));
        maxPrice.addEventListener('input', () => handleInput(maxPrice, false));
        
        minThumb.addEventListener('mousedown', (e) => handleMouseDown(e, minThumb));
        maxThumb.addEventListener('mousedown', (e) => handleMouseDown(e, maxThumb));
        
        // Initial update
        updateTrack();
    }

    // Initialize price range when DOM is loaded
    initPriceRange();
});

// Cart Modal Styles
const cartModalStyles = document.createElement('style');
cartModalStyles.innerHTML = `
#sp-cart-modal { position:fixed; top:0; left:0; width:100vw; height:100vh; display:none; align-items:center; justify-content:center; z-index:2000; }
.sp-cart-backdrop { position:absolute; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.4); }
.sp-cart-modal-content { position:relative; background:#fff; border-radius:1rem; box-shadow:0 8px 32px rgba(0,0,0,0.18); padding:2rem; min-width:320px; max-width:90vw; z-index:2; }
.sp-cart-modal-content h2 { margin-bottom:1rem; }
.sp-cart-items { margin-bottom:1.5rem; }
.sp-cart-item { display:flex; align-items:center; margin-bottom:0.7rem; font-size:1rem; }
.sp-confirm-btn { margin-right:1rem; }
`;
document.head.appendChild(cartModalStyles); 