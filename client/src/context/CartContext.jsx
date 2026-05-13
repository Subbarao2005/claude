import { createContext, useContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const getSavedCart = () => {
  try {
    const saved = localStorage.getItem('melcho_cart');
    if (!saved || saved === 'undefined' || saved === 'null')
      return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item =>
      item &&
      item.product &&
      item.product._id &&
      item.product.title &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );
  } catch {
    localStorage.removeItem('melcho_cart');
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(getSavedCart());

  useEffect(() => {
    try {
      localStorage.setItem('melcho_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Cart save error:', e);
    }
  }, [items]);

  const addToCart = (product) => {
    if (!product || !product._id || !product.title) {
      console.error('Invalid product:', product);
      return;
    }

    setItems((prev) => {
      const cleanPrev = (prev || []).filter(item => item && item.product);
      const existing = cleanPrev.find((item) => item?.product?._id === product._id);
      if (existing) {
        return cleanPrev.map((item) =>
          item?.product?._id === product._id
            ? { ...item, quantity: (item.quantity || 0) + 1 }
            : item
        ).filter(Boolean);
      }
      return [...cleanPrev, { product, quantity: 1, _id: product._id }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => (prev || []).filter((item) => item && item.product && item.product._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      (prev || [])
        .filter(item => item && item.product)
        .map((item) =>
          item?.product?._id === productId ? { ...item, quantity } : item
        )
    );
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((sum, item) => {
    if (!item || !item.product) return sum;
    return sum + ((item.product.price || 0) * (item.quantity || 0));
  }, 0);

  const cartCount = items.reduce((sum, item) => {
    if (!item) return sum;
    return sum + (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
