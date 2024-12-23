/**
 * Main App component that handles routing, authentication state, and user session management.
 * It loads user data from localStorage on mount and sets up routing for both public and protected routes.
 * Includes logic for user login, logout, and cart management.
 *
 * @module App
 *
 * @returns {JSX.Element} The rendered app component with routes and navigation.
 */
import React, { useState, useEffect } from 'react';
import './App.css';

import { Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate for redirection
import { useNavigate } from 'react-router-dom';

import Home from './components/Home.js';
import RegistrationForm from './components/Register.js';
import Login from './components/Login.js';
import ProductList from './components/ProductList.js';
import Navigation from './components/Navigation.js';
import Cart from './components/Cart.js';
import ProductDetails from './components/ProductDetails.js';
import { CartProvider } from './components/CartContext.js';
import Orders from './components/Orders.js';
import AdminProductList from './components/AdminProductList.js';
import AdminProductDetails from './components/AdminProductUpdate.js';
import AdminProductInsert from './components/AdminProductInsert.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Load user data from localStorage on component mount
  useEffect(() => {
    
    const storedIsAdmin = localStorage.getItem('isAdmin'); 
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUserEmail = localStorage.getItem('userEmail');
    const storedCart = localStorage.getItem('cart');

    // Check if the user is logged in based on localStorage
    if (storedIsLoggedIn === 'true') setIsLoggedIn(true);

    // Parse storedIsAdmin as a boolean
    setIsAdmin(storedIsAdmin === 'true');

    // Set user information if available
    if (storedUserEmail) setUserEmail(storedUserEmail);

    // Load the cart from localStorage
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        setCart([]);
      }
    }
  }, []);

  /**
   * @function handleLogout
   * Handles user logout, removes all session-related data from localStorage,
   * clears state, and redirects to the home page.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('cart');
    localStorage.setItem('isLoggedIn', 'false'); 
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail(null);
    setCart([]);
    navigate('/');
  };

  /**
   * @function AdminRoute
   * Ensures that only users with admin privileges can access certain pages. If the user is not an admin, they are redirected to the home page.
   * 
   * @param {Object} props - The props for the AdminRoute component.
   * @param {React.ReactNode} props.children - The child components to be rendered if the user is an admin.
   * @returns {React.ReactNode} If the user is an admin, the children are rendered; otherwise, the user is redirected.
   */
  function AdminRoute({ children}) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      return <Navigate to="/" />;
    }
    return children;
  }


  return (
    <CartProvider>
      <div className="App">
        <Navigation
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          handleLogout={handleLogout}
          userEmail={userEmail}
          cart={cart}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<RegistrationForm isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />} />
          <Route path="/login" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/products"
            element={
              <AdminRoute isAdmin={isAdmin}>
                <AdminProductList />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/:id"
            element={
              <AdminRoute isAdmin={isAdmin}>
                <AdminProductDetails />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/insert"
            element={
              <AdminRoute isAdmin={isAdmin}>
                <AdminProductInsert />
              </AdminRoute>
            }
          />

        </Routes>
      </div>
    </CartProvider>
  );
}

export default App;
