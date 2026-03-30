import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = sessionStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveToStorage = (items) => {
    sessionStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = useCallback((item, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(ci => ci.itemId === item.id);
      let updated;
      if (existing) {
        updated = prev.map(ci =>
          ci.itemId === item.id
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci
        );
      } else {
        updated = [...prev, {
          itemId: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit || 'load',
          quantity,
        }];
      }
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => {
      const updated = prev.filter(ci => ci.itemId !== itemId);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => {
      const updated = prev.map(ci =>
        ci.itemId === itemId ? { ...ci, quantity } : ci
      );
      saveToStorage(updated);
      return updated;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    sessionStorage.removeItem('cart');
  }, []);

  const totalPrice = cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
  const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    isEmpty: cartItems.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
