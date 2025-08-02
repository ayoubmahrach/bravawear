// No terms page JS present. No action needed. 

// Simple Cart Logic for Techwear

document.addEventListener('DOMContentLoaded', function () {
    // Initialize lazy loading
    initializeLazyLoading();
    
    // Elements
    const addToCartBtn = document.querySelector('.order-btn');
    const cartIcon = document.querySelectorAll('.cart-btn, .floating-cart .cart-icon');
    const cartCountEls = document.querySelectorAll('.cart-count');

    // Lazy Loading Implementation
    function initializeLazyLoading() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px', // Start loading 50px before image enters viewport
                threshold: 0.01
            });

            // Observe all lazy images
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers - load all images immediately
            document.querySelectorAll('img[data-src]').forEach(img => {
                loadImage(img);
            });
        }
    }

    function loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        // Create new image to preload
        const newImg = new Image();
        newImg.onload = function() {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            
            // Remove loading spinner if exists
            const spinner = img.parentElement.querySelector('.lazy-spinner');
            if (spinner) {
                spinner.remove();
            }
            
            console.log('Lazy loaded:', src);
        };
        newImg.onerror = function() {
            console.error('Failed to load image:', src);
            // Show error placeholder
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
        };
        newImg.src = src;
    }

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
            // Show cart modal instead of redirecting to non-existent cart.html
            showCartModal();
        });
    }

    // Show Cart Modal
    function showCartModal() {
        let cart = getCart();
        let modal = document.getElementById('sp-cart-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'sp-cart-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            `;
            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 15px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    position: relative;
                ">
                    <h2 style="margin-bottom: 20px; color: var(--primary-color);">Your Cart</h2>
                    <div class="sp-cart-items" style="margin-bottom: 20px;"></div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn outline-btn sp-close-btn" style="padding: 10px 20px;">Close</button>
                        <button class="btn primary-btn sp-confirm-btn" style="padding: 10px 20px;">Confirm Order</button>
                    </div>
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
                <div style="
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 10px;
                ">
                    <img src="${item.img}" alt="${item.title}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;margin-right:10px;">
                    <div style="flex: 1;">
                        <strong>${item.title}</strong><br>
                        <small>Size: ${item.size}, Color: <span style="background:${item.color};padding:0 8px;border-radius:8px;display:inline-block;width:20px;height:20px;"></span></small><br>
                        <small>Qty: ${item.qty} - ${item.price}</small>
                    </div>
                </div>
            `).join('');
        }
        modal.style.display = 'flex';
        // Close
        modal.querySelector('.sp-close-btn').onclick = () => { modal.style.display = 'none'; };
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
        // Confirm
        modal.querySelector('.sp-confirm-btn').onclick = () => {
            modal.style.display = 'none';
            // Redirect to WhatsApp instead of non-existent order-request.html
            const whatsappNumber = '212702209437';
            const message = `Hi! I want to place an order for the items in my cart.`;
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        };
    }

    // Cart icon click
    cartIcon.forEach(icon => {
        icon.addEventListener('click', function (e) {
            e.preventDefault();
            showCartModal();
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
        
        if (!minThumb || !maxThumb || !minPrice || !maxPrice || !track || !container) {
            return; // Exit if elements don't exist
        }
        
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