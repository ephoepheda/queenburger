// --- DATA ---
const menuItems = [
    { id: 1, name: "Classic Queen Burger", price: 150, category: "burger", img: "crispy-comte-cheesburgers-FT-RECIPE0921-6166c6552b7148e8a8561f7765ddf20b.jpg", desc: "Juicy beef patty with fresh lettuce and tomato." },
    { id: 2, name: "Spicy Chicken Royale", price: 140, category: "burger", img: "burger-king-spicy-chicken-royale-review.jpg", desc: "Crispy chicken fillet with spicy mayo." },
    { id: 3, name: "Double Cheese King", price: 220, category: "burger", img: "images (3).jpg", desc: "Double patty, double cheese, double fun." },
    { id: 4, name: "Crispy Fries", price: 60, category: "sides", img: "images (5).jpg", desc: "Golden salted fries." },
    { id: 5, name: "Onion Rings", price: 70, category: "sides", img: "images (7).jpg", desc: "Crunchy battered onion rings." },
    { id: 6, name: "Soft Drinks", price: 30, category: "drinks", img: "8f1abd_bd3eb9cedc474a7f9a74f6ef457661b1~mv2.avif", desc: "Ice cold refreshing cola." },
    { id: 7, name: "Orange Juice", price: 50, category: "drinks", img: "images (6).jpg", desc: "Freshly squeezed orange juice." },
    { id: 8, name: "special pizza", price: 130, category: "special pizza", img: "72bf02a3-b886-46f1-8d9d-1889861c7b56.webp", desc: "Freshly baked pizza with rich tomato sauce, mozzarella cheese, and premium toppings for the perfect taste in every bite.." },
];

let cart = [];

// --- NAVIGATION ROUTER ---
function router(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    // Show target page
    document.getElementById(pageId).classList.add('active');
    
    // Update Nav Links
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Find the button that calls this route (approximate matching)
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick').includes(pageId));
    if(activeBtn) activeBtn.classList.add('active');

    // Close mobile menu if open
    document.getElementById('navLinks').classList.remove('active');
    
    window.scrollTo(0,0);
}

function toggleMobileNav() {
    document.getElementById('navLinks').classList.toggle('active');
}

// --- MENU RENDERING ---
function renderMenu(filter = 'all') {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === filter);

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.innerHTML = `
            <div class="item-img"><img src="${item.img}" alt="${item.name}"></div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-price">ETB ${item.price}</div>
                <button class="add-btn" onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Update category buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase() === filter || (filter === 'all' && btn.innerText === 'All')) {
            btn.classList.add('active');
        }
    });
}

function filterMenu(category) {
    renderMenu(category);
}

// --- CART LOGIC ---
function addToCart(id) {
    const item = menuItems.find(i => i.id === id);
    const existing = cart.find(i => i.id === id);
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    showToast(`${item.name} added!`);
}

function updateCartUI() {
    // Update badge
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').innerText = totalCount;

    // Update Modal List
    const container = document.getElementById('cartItemsContainer');
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">Your cart is empty.</p>';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">ETB ${item.price * item.qty}</div>
                </div>
                <div class="cart-controls">
                    <button onclick="changeQty(${item.id}, -1)">-</button>
                    <span style="margin: 0 5px;">${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    // Update Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('cartTotalDisplay').innerText = `ETB ${total.toFixed(2)}`;
    document.getElementById('payAmount').innerText = `ETB ${total.toFixed(2)}`;
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
}

// --- MODAL CONTROLS ---
function openCart() {
    document.getElementById('cartModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// --- PAYMENT FLOW ---
function initiateCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    closeModal('cartModal');
    
    // Reset payment modal state
    document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').style.display = 'none';
    document.getElementById('paymentStep3').style.display = 'none';
    document.getElementById('loaderSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('screenshot-preview').style.display = 'none';
    document.getElementById('screenshotInput').value = ''; // clear input

    document.getElementById('paymentModal').style.display = 'flex';
}

function openBankApp() {
    // Move to Step 2
    document.getElementById('paymentStep1').style.display = 'none';
    document.getElementById('paymentStep2').style.display = 'block';

    // Simulate Opening App / Waiting for user
    // In a real app, this would be window.open(url, '_blank');
    setTimeout(() => {
        // User has "returned" from bank app after 3 seconds
        document.getElementById('loaderSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
    }, 3000);
}

function previewFile() {
    const input = document.getElementById('screenshotInput');
    const preview = document.getElementById('screenshot-preview');
    const error = document.getElementById('fileError');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            error.innerText = '';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

async function submitOrder() {
    const input = document.getElementById('screenshotInput');
    const error = document.getElementById('fileError');

    // 1. Get File (Pasted or Selected)
    let fileToUpload = pastedImage || (input.files ? input.files[0] : null);

    if (!fileToUpload) {
        error.innerText = "Please paste or select a screenshot.";
        return;
    }

    const submitBtn = document.querySelector('#uploadSection .cta-btn');
    submitBtn.innerText = "Uploading...";
    submitBtn.disabled = true;

    try {
        // 2. Upload Image to Firebase Storage
        // Create a unique filename: timestamp_filename.jpg
        const fileName = Date.now() + '_' + fileToUpload.name;
        const storageRef = storage.ref('proofs/' + fileName);
        
        await storageRef.put(fileToUpload);
        const imageUrl = await storageRef.getDownloadURL(); // Get the link

        // 3. Save Order Data to Firestore Database
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const paymentMethod = document.querySelector('input[name="payment"]:checked').parentElement.innerText.trim();

        await db.collection('orders').add({
            customerName: "Guest Customer",
            totalAmount: total,
            paymentMethod: paymentMethod,
            proofImage: imageUrl, // Save the image link
            status: "Pending",
            items: cart, // Save the cart items
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 4. Success
        document.getElementById('paymentStep2').style.display = 'none';
        document.getElementById('paymentStep3').style.display = 'block';
        cart = []; // Clear cart
        updateCartUI();
        
        // Reset paste variable
        pastedImage = null;
        document.getElementById('screenshot-preview').style.display = 'none';

    } catch (err) {
        console.error("Error:", err);
        error.innerText = "Upload failed: " + err.message;
    } finally {
        submitBtn.innerText = "Confirm Order";
        submitBtn.disabled = false;
    }
}
   

function resetAndClose() {
    closeModal('paymentModal');
    router('home'); // Go back to home
}

// --- UTILS ---
function showToast(message) {
    // Simple visual feedback since native alerts are discouraged
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = 'var(--dark-brown)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '3000';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = "none";
    }
}

// --- INIT ---
renderMenu();
