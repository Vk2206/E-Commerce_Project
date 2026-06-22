import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  User, 
  Settings, 
  CheckCircle, 
  Package,
  LogOut,
  Shield,
  Edit,
  Database
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  // Authentication & Roles
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('aura_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '' });
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Products and Navigation
  const [products, setProducts] = useState([]);
  const [categories] = useState(['All', 'Tech', 'Fashion', 'Home']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation tabs for Admin / User
  const [adminActiveTab, setAdminActiveTab] = useState('products'); // 'products' or 'orders'

  // Cart state (synced with LocalStorage)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('aura_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Modals & Drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Forms state
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });
  
  const [adminForm, setAdminForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Tech',
    stock: 10,
    rating: 4.5
  });
  
  // Order list state
  const [orderSearchEmail, setOrderSearchEmail] = useState('');
  const [customerOrders, setCustomerOrders] = useState([]);
  const [allSystemOrders, setAllSystemOrders] = useState([]);
  const [isSearchingOrders, setIsSearchingOrders] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync user to local storage and auto-fill emails/names
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aura_user', JSON.stringify(currentUser));
      if (currentUser.role === 'CUSTOMER') {
        setCheckoutForm(prev => ({
          ...prev,
          name: currentUser.name,
          email: currentUser.email
        }));
        setOrderSearchEmail(currentUser.email);
        fetchCustomerOrders(currentUser.email);
      } else if (currentUser.role === 'ADMIN') {
        fetchAllSystemOrders();
      }
    } else {
      localStorage.removeItem('aura_user');
      setCustomerOrders([]);
      setAllSystemOrders([]);
    }
  }, [currentUser]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products when category or debounced search changes
  useEffect(() => {
    fetchProducts();
  }, [activeCategory, debouncedSearchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/products`;
      const params = [];
      
      if (activeCategory !== 'All') {
        params.push(`category=${encodeURIComponent(activeCategory)}`);
      }
      if (debouncedSearchQuery) {
        params.push(`search=${encodeURIComponent(debouncedSearchQuery)}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      showToast('Error loading products. Is the server running?', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Auth operations
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Authentication failed');
      }

      const user = await response.json();
      setCurrentUser(user);
      setIsLoginOpen(false);
      setLoginForm({ email: '', password: '', name: '' });
      showToast(`Welcome back, ${user.name}! Logged in as ${user.role}.`);
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    showToast('Logged out successfully');
  };

  // Cart operations
  const addToCart = (product, quantityToAdd = 1) => {
    if (product.stock <= 0) {
      showToast('Product is out of stock', 'error');
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQty = existingItem.quantity + quantityToAdd;
        if (newQty > product.stock) {
          showToast(`Only ${product.stock} items available in stock`, 'error');
          return prevCart;
        }
        showToast(`Updated quantity of ${product.name} in cart`);
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQty } 
            : item
        );
      }
      
      showToast(`Added ${product.name} to cart`);
      return [...prevCart, { product, quantity: quantityToAdd }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            showToast(`Only ${item.product.stock} items available in stock`, 'error');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId, productName) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    showToast(`Removed ${productName} from cart`);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Submit order checkout
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    const orderItems = cart.map(item => ({
      product: { id: item.product.id },
      quantity: item.quantity,
      price: item.product.price
    }));

    const orderPayload = {
      customerName: checkoutForm.name,
      customerEmail: checkoutForm.email,
      customerAddress: checkoutForm.address,
      customerCity: checkoutForm.city,
      customerZip: checkoutForm.zip,
      orderItems: orderItems
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to place order');
      }

      const completedOrder = await response.json();
      showToast(`Order #${completedOrder.id} placed successfully!`);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      
      // Refresh products to show updated stock
      fetchProducts();
      
      if (currentUser && currentUser.role === 'CUSTOMER') {
        fetchCustomerOrders(currentUser.email);
        setIsOrdersOpen(true);
      } else {
        setOrderSearchEmail(completedOrder.customerEmail);
        fetchCustomerOrders(completedOrder.customerEmail);
        setIsOrdersOpen(true);
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Error checking out', 'error');
    }
  };

  // Fetch customer orders by email
  const fetchCustomerOrders = async (email) => {
    if (!email) return;
    setIsSearchingOrders(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/customer/${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to retrieve orders');
      const data = await response.json();
      setCustomerOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingOrders(false);
    }
  };

  // Admin: Fetch all orders
  const fetchAllSystemOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      if (!response.ok) throw new Error('Failed to load system orders');
      const data = await response.json();
      setAllSystemOrders(data);
    } catch (error) {
      console.error(error);
      showToast('Error loading system orders', 'error');
    }
  };

  // Admin: Update Order Status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      showToast(`Order #${orderId} updated to ${newStatus}`);
      fetchAllSystemOrders();
    } catch (error) {
      console.error(error);
      showToast('Error updating status', 'error');
    }
  };

  // Admin: Add product
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const productPayload = {
      ...adminForm,
      price: parseFloat(adminForm.price),
      stock: parseInt(adminForm.stock),
      rating: parseFloat(adminForm.rating)
    };

    if (!productPayload.imageUrl) {
      productPayload.imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });

      if (!response.ok) throw new Error('Failed to create product');
      
      const newProduct = await response.json();
      showToast(`Product "${newProduct.name}" created!`);
      setIsAdminOpen(false);
      setAdminForm({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        category: 'Tech',
        stock: 10,
        rating: 4.5
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      showToast('Error adding product', 'error');
    }
  };

  // Open checkout handling (Guest must log in)
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      showToast('Please log in to checkout', 'error');
      setIsLoginOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div className="app-container">
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
            {toast.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <header>
        <div className="header-content">
          <a href="#" className="logo" onClick={() => { setActiveCategory('All'); setSearchQuery(''); setAdminActiveTab('products'); }}>
            <span>Aura</span>.Shop
          </a>
          
          <nav className="nav-links">
            {/* Admin role gets different tabs */}
            {currentUser?.role === 'ADMIN' ? (
              <>
                <a 
                  className={`nav-link ${adminActiveTab === 'products' ? 'active' : ''}`}
                  onClick={() => setAdminActiveTab('products')}
                >
                  Manage Products
                </a>
                <a 
                  className={`nav-link ${adminActiveTab === 'orders' ? 'active' : ''}`}
                  onClick={() => { setAdminActiveTab('orders'); fetchAllSystemOrders(); }}
                >
                  Order Registry
                </a>
                <a className="nav-link" onClick={() => setIsAdminOpen(true)}>
                  Add Product
                </a>
              </>
            ) : (
              <>
                <a 
                  className={`nav-link ${activeCategory === 'All' && !searchQuery ? 'active' : ''}`}
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                >
                  Shop
                </a>
                {currentUser && (
                  <a className="nav-link" onClick={() => { setIsOrdersOpen(true); fetchCustomerOrders(currentUser.email); }}>
                    My Orders
                  </a>
                )}
              </>
            )}
          </nav>

          <div className="header-actions">
            {currentUser ? (
              <div className="user-info-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`role-badge ${currentUser.role.toLowerCase()}`}>
                  {currentUser.role}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </span>
                <button className="action-btn" onClick={handleLogout} title="Log Out">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => setIsLoginOpen(true)}>
                Sign In
              </button>
            )}

            {/* Show cart only to Customers and Guests, not Admin */}
            {currentUser?.role !== 'ADMIN' && (
              <button className="action-btn" onClick={() => setIsCartOpen(true)} title="Open Cart">
                <ShoppingBag size={22} />
                {getCartCount() > 0 && <span className="badge">{getCartCount()}</span>}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero">
        <h1>{currentUser?.role === 'ADMIN' ? 'Seller Control Room' : 'Essential items for your daily ritual.'}</h1>
        <p>
          {currentUser?.role === 'ADMIN' 
            ? 'Manage inventory, insert catalog listings, and update client order statuses.' 
            : 'Curated design objects, high-grade electronics, and fine wardrobe classics.'}
        </p>
      </div>

      {/* Main UI layout based on Admin Active Tab */}
      {currentUser?.role === 'ADMIN' && adminActiveTab === 'orders' ? (
        /* Admin Order Management Registry */
        <div style={{ marginBottom: '60px' }}>
          <div className="order-history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="form-title" style={{ margin: 0 }}>
              <Package size={24} /> Client Order Registry
            </h2>
            <button className="btn-secondary" onClick={fetchAllSystemOrders}>
              Refresh Orders
            </button>
          </div>

          <div className="orders-list">
            {allSystemOrders.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                No customer orders have been placed yet.
              </div>
            ) : (
              allSystemOrders.map(order => (
                <div key={order.id} className="order-card" style={{ backgroundColor: 'var(--bg-secondary)', marginBottom: '16px' }}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">Order ID: #{order.id}</span>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Customer: <strong>{order.customerName}</strong> ({order.customerEmail})
                      </div>
                      <div className="order-date" style={{ marginTop: '2px' }}>
                        Placed: {new Date(order.orderDate).toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Status updater for Admin */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Status:</span>
                      <select 
                        className="form-select"
                        style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '20px' }}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="order-items-list" style={{ margin: '14px 0', padding: '0 10px' }}>
                    {order.orderItems.map(item => (
                      <div key={item.id} className="order-item-row" style={{ padding: '4px 0' }}>
                        <span>{item.product.name} (x{item.quantity})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <span className="order-total-lbl">Shipment Address: <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}>{order.customerAddress}, {order.customerCity} {order.customerZip}</span></span>
                    <span className="order-total-val" style={{ fontSize: '18px' }}>Total: ${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Standard Catalog and Search (displayed for Customers, Guests, and Admin Catalog management) */
        <>
          <div className="controls-container">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="action-btn" 
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="categories">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="no-results">
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            <main className="products-grid">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="product-img-container">
                    <span className="product-category-tag">{product.category}</span>
                    <img src={product.imageUrl} alt={product.name} className="product-img" />
                  </div>
                  <div className="product-info">
                    <div className="product-rating">
                      ★ <span>{product.rating.toFixed(1)}</span>
                    </div>
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-desc-snippet">{product.description}</p>
                    <div className="product-footer" onClick={(e) => e.stopPropagation()}>
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      
                      {currentUser?.role === 'ADMIN' ? (
                        <button 
                          className="btn-secondary" 
                          style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => { setSelectedProduct(product); }}
                        >
                          <Edit size={12} /> Stock: {product.stock}
                        </button>
                      ) : (
                        <button 
                          className="add-cart-btn"
                          disabled={product.stock <= 0}
                          onClick={() => addToCart(product)}
                        >
                          {product.stock <= 0 ? 'Out of Stock' : 'Add +'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </main>
          )}
        </>
      )}

      {/* Login / Register Modal */}
      {isLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsLoginOpen(false)}>
              <X size={20} />
            </button>
            <div className="form-container" style={{ padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Sign In</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {isRegisterMode ? 'Create your Aura account' : 'Enter details to access your account'}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="form-input"
                      value={loginForm.email}
                      onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="jane@example.com or admin@aura.com"
                    />
                  </div>

                  {/* Password is required for Admin always, and Customer optionally if register mode */}
                  {(loginForm.email.toLowerCase().includes('admin') || isRegisterMode) && (
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input 
                        type="password" 
                        required 
                        className="form-input"
                        value={loginForm.password}
                        onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder={loginForm.email.toLowerCase().includes('admin') ? 'admin123' : '••••••••'}
                      />
                    </div>
                  )}

                  {isRegisterMode && (
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input 
                        type="text" 
                        required 
                        className="form-input"
                        value={loginForm.name}
                        onChange={e => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jane Doe"
                      />
                    </div>
                  )}
                </div>

                <div className="login-helper-text" style={{ fontSize: '12px', padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
                  💡 <strong>Demo Credentials:</strong><br />
                  • <strong>Admin:</strong> admin@aura.com | password: admin123<br />
                  • <strong>Customer:</strong> Enter any email to instantly log in/register.
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                  {isRegisterMode ? 'Sign Up' : 'Continue'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
                  {isRegisterMode ? (
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Already have an account?{' '}
                      <span style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '500' }} onClick={() => setIsRegisterMode(false)}>
                        Sign In
                      </span>
                    </p>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>
                      New customer?{' '}
                      <span style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '500' }} onClick={() => setIsRegisterMode(true)}>
                        Create account
                      </span>
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>
            <div className="product-details">
              <div className="details-img-container">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="details-img" />
              </div>
              <div className="details-info">
                <span className="details-category">{selectedProduct.category}</span>
                <h2 className="details-title">{selectedProduct.name}</h2>
                <div className="details-rating">
                  ★ <span>{selectedProduct.rating.toFixed(1)} Rating</span>
                </div>
                <div className="details-price">${selectedProduct.price.toFixed(2)}</div>
                <p className="details-desc">{selectedProduct.description}</p>
                
                <div className="details-stock">
                  {selectedProduct.stock > 10 ? (
                    <span className="stock-badge stock-in">In Stock ({selectedProduct.stock} available)</span>
                  ) : selectedProduct.stock > 0 ? (
                    <span className="stock-badge stock-low">Only {selectedProduct.stock} Left in Stock</span>
                  ) : (
                    <span className="stock-badge stock-out">Out of Stock</span>
                  )}
                </div>

                <div className="details-actions">
                  {currentUser?.role === 'ADMIN' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><em>Admin mode: Customers view stock limits</em></p>
                      <button className="btn-secondary" onClick={() => { setSelectedProduct(null); setIsAdminOpen(true); setAdminForm(selectedProduct); }}>
                        Edit Product Properties
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="details-add-btn"
                      disabled={selectedProduct.stock <= 0}
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                    >
                      {selectedProduct.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button className="action-btn" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={48} />
                  <p>Your cart is empty.</p>
                  <button className="btn-secondary" onClick={() => setIsCartOpen(false)}>
                    Go Shop
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="cart-item">
                    <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{item.product.name}</h4>
                      <p className="cart-item-price">${item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => updateCartQty(item.product.id, -1)}>
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateCartQty(item.product.id, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.product.id, item.product.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <button className="checkout-btn" onClick={handleProceedToCheckout}>
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsCheckoutOpen(false)}>
              <X size={20} />
            </button>
            <div className="form-container">
              <h2 className="form-title">
                <ShoppingBag size={24} /> Checkout Details
              </h2>
              <form onSubmit={handleCheckoutSubmit}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={checkoutForm.name}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      disabled={!!currentUser} /* Email locked for logged in user */
                      className="form-input"
                      value={checkoutForm.email}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Delivery Address</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={checkoutForm.address}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Minimalist Way"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={checkoutForm.city}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="San Francisco"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal / ZIP Code</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={checkoutForm.zip}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="94103"
                    />
                  </div>
                </div>
                
                <div className="cart-summary-row total" style={{ margin: '0 0 24px', padding: '12px 0 0' }}>
                  <span>Grand Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsCheckoutOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Place Order (${getCartTotal().toFixed(2)})
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tracking Modal for Customers */}
      {isOrdersOpen && (
        <div className="modal-overlay" onClick={() => setIsOrdersOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsOrdersOpen(false)}>
              <X size={20} />
            </button>
            <div className="order-history-container">
              <div className="order-history-header">
                <h2 className="form-title">
                  <Package size={24} /> My Orders
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                  Showing orders placed under: <strong>{currentUser?.email}</strong>
                </p>
              </div>

              <div className="orders-list">
                {isSearchingOrders ? (
                  <div className="loader-container"><div className="loader"></div></div>
                ) : customerOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                    You have not placed any orders yet.
                  </div>
                ) : (
                  customerOrders.map(order => (
                    <div key={order.id} className="order-card" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-id">Order ID: #{order.id}</span>
                          <div className="order-date">
                            {new Date(order.orderDate).toLocaleDateString(undefined, { 
                              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        <span className={`order-status status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="order-items-list" style={{ margin: '12px 0' }}>
                        {order.orderItems.map(item => (
                          <div key={item.id} className="order-item-row">
                            <span>{item.product.name} (x{item.quantity})</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-footer">
                        <span className="order-total-lbl">Total Amount</span>
                        <span className="order-total-val">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin / Add Product Modal */}
      {isAdminOpen && (
        <div className="modal-overlay" onClick={() => setIsAdminOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsAdminOpen(false)}>
              <X size={20} />
            </button>
            <div className="form-container">
              <h2 className="form-title">
                <Settings size={24} /> {adminForm.id ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <form onSubmit={handleAdminSubmit}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Product Name</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={adminForm.name}
                      onChange={e => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Premium Leather Mousepad"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="form-label">Description</label>
                    <textarea 
                      required 
                      className="form-textarea"
                      value={adminForm.description}
                      onChange={e => setAdminForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the product details and aesthetics..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      required 
                      className="form-input"
                      value={adminForm.price}
                      onChange={e => setAdminForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="49.99"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={adminForm.category}
                      onChange={e => setAdminForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Tech">Tech</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Image URL</label>
                    <input 
                      type="url" 
                      className="form-input"
                      value={adminForm.imageUrl}
                      onChange={e => setAdminForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://images.unsplash.com/... (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Level</label>
                    <input 
                      type="number" 
                      min="0"
                      required 
                      className="form-input"
                      value={adminForm.stock}
                      onChange={e => setAdminForm(prev => ({ ...prev, stock: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Aesthetic Rating (1-5)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="1" 
                      max="5"
                      required 
                      className="form-input"
                      value={adminForm.rating}
                      onChange={e => setAdminForm(prev => ({ ...prev, rating: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsAdminOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {adminForm.id ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Aura.Shop</h3>
            <p>A minimalist design & commerce experience. High-quality objects built for clean workspaces and modern lifestyle aesthetics.</p>
          </div>
          <div className="footer-links">
            <h4>Security Registry</h4>
            <ul>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><strong>Role base setup active:</strong></span></li>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>• Admin: admin@aura.com (admin123)</span></li>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>• Customer: enter any custom email address</span></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>H2 Database Console</h4>
            <ul>
              <li><a href="http://localhost:8080/h2-console" target="_blank" rel="noreferrer">Open H2 console</a></li>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>JDBC URL: jdbc:h2:mem:ecomdb</span></li>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>User: sa | Password: password</span></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Aura Essentials. Role-based Hibernate authentication active.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
