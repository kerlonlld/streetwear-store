import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialProducts } from '../data/products';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('me-products')) || initialProducts; } catch { return initialProducts; }
  });
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('me-cart')) || []; } catch { return []; }
  });

  useEffect(() => localStorage.setItem('me-products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('me-cart', JSON.stringify(cart)), [cart]);

  const addToCart = (product, size) => setCart((items) => {
    const existing = items.find((item) => item.id === product.id && item.size === size);
    if (existing) return items.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
    return [...items, { ...product, size, quantity: 1 }];
  });
  const updateQuantity = (id, size, quantity) => setCart((items) => quantity < 1 ? items.filter((item) => !(item.id === id && item.size === size)) : items.map((item) => item.id === id && item.size === size ? { ...item, quantity } : item));
  const removeFromCart = (id, size) => updateQuantity(id, size, 0);
  const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  return <StoreContext.Provider value={{ products, setProducts, cart, addToCart, updateQuantity, removeFromCart, subtotal, cartCount }}>{children}</StoreContext.Provider>;
}
export const useStore = () => useContext(StoreContext);
