import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/api';
import { useApp } from './AppContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useApp();

  // Cart state: strictly 1 vendor at any time
  const [vendorId, setVendorId] = useState(null);
  const [vendorName, setVendorName] = useState(null);
  const [vendorStoreType, setVendorStoreType] = useState(null);
  const [items, setItems] = useState([]); // [{ product, quantity }]
  const [validationChanges, setValidationChanges] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  // Conflict modal state for Single-Vendor Cart Guard
  const [conflictModal, setConflictModal] = useState({
    visible: false,
    currentVendorName: '',
    newVendorName: '',
    itemCount: 1,
    pendingProduct: null
  });

  // Helper to extract vendor id
  const getItemVendorId = (product) => {
    if (!product) return null;
    return (
      product.vendor?._id ||
      product.vendor?.id ||
      (typeof product.vendor === 'string' ? product.vendor : null) ||
      product.vendorId ||
      null
    );
  };

  // Helper to extract vendor name
  const getItemVendorName = (product) => {
    if (!product) return 'Store';
    return (
      product.vendor?.storeName ||
      product.vendorName ||
      product.farmer ||
      'Partner Store'
    );
  };

  // Synchronize with server cart on login or mount
  const syncServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiService.getCart();
      if (res && res.ok && res.cart) {
        const sCart = res.cart;
        if (sCart.vendor) {
          setVendorId(sCart.vendor._id || sCart.vendor);
          setVendorName(sCart.vendor.storeName || 'Partner Store');
        } else {
          setVendorId(null);
          setVendorName(null);
        }

        if (Array.isArray(sCart.items)) {
          setItems(
            sCart.items.map((it) => ({
              product: {
                _id: it.product,
                name: it.name,
                image: it.image,
                unit: it.unit,
                price: it.priceAtAdd ? it.priceAtAdd / 100 : 0
              },
              quantity: it.qty
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Failed to sync server cart:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    syncServerCart();
  }, [syncServerCart]);

  // Validate cart on cart open or before checkout
  const validateCart = useCallback(async () => {
    if (!isAuthenticated || items.length === 0) return { isValid: true, changes: [] };
    try {
      setIsValidating(true);
      const res = await apiService.validateCart();
      if (res && res.ok) {
        if (res.changes && res.changes.length > 0) {
          setValidationChanges(res.changes);
        }
        await syncServerCart();
        return { isValid: res.isValid, changes: res.changes || [] };
      }
    } catch (err) {
      console.warn('Validate cart error:', err);
    } finally {
      setIsValidating(false);
    }
    return { isValid: true, changes: [] };
  }, [isAuthenticated, items.length, syncServerCart]);

  const acknowledgeChanges = () => {
    setValidationChanges([]);
  };

  const addToCart = async (product, qty = 1) => {
    // 🔴 STRICT STOCK GUARD: Prevent adding Out of Stock items
    if (product.inStock === false || (product.stockQty !== undefined && product.stockQty <= 0)) {
      alert(`"${product.name || 'This item'}" is currently out of stock.`);
      return false;
    }

    const prodVendorId = getItemVendorId(product);
    const prodVendorName = getItemVendorName(product);
    const prodStoreType = product.vendor?.storeType || 'FARMER';
    const prodId = product._id || product.id;

    // Client-side quick check
    if (items.length > 0 && vendorId && prodVendorId && vendorId.toString() !== prodVendorId.toString()) {
      setConflictModal({
        visible: true,
        currentVendorName: vendorName || 'Previous Store',
        newVendorName: prodVendorName,
        itemCount: items.reduce((sum, it) => sum + (it.quantity || 1), 0),
        pendingProduct: product
      });
      return false;
    }

    // Call server endpoint if authenticated
    if (isAuthenticated && prodId) {
      try {
        const res = await apiService.addCartItem(prodId, qty);
        if (res && res.ok) {
          await syncServerCart();
          return true;
        }
      } catch (err) {
        if (err?.code === 'VENDOR_CONFLICT') {
          setConflictModal({
            visible: true,
            currentVendorName: err.currentVendor?.name || vendorName || 'Previous Store',
            newVendorName: err.newVendor?.name || prodVendorName,
            itemCount: err.currentVendor?.itemCount || items.length,
            pendingProduct: product
          });
          return false;
        }
        console.warn('Server addCartItem error:', err);
      }
    }

    // Local / Guest fallback
    if (!vendorId && prodVendorId) {
      setVendorId(prodVendorId);
      setVendorName(prodVendorName);
      setVendorStoreType(prodStoreType);
    }

    setItems((prevItems) => {
      const existing = prevItems.find(
        (it) => (it.product?._id || it.product?.id) === prodId
      );

      if (existing) {
        const nextQty = existing.quantity + qty;
        if (product.stockQty !== undefined && nextQty > product.stockQty) {
          alert(`Only ${product.stockQty} unit(s) of "${product.name || 'this item'}" available in stock.`);
          return prevItems;
        }
        return prevItems.map((it) =>
          (it.product?._id || it.product?.id) === prodId
            ? { ...it, quantity: nextQty }
            : it
        );
      }
      return [...prevItems, { product, quantity: qty }];
    });

    return true;
  };

  const confirmReplaceCart = async () => {
    const { pendingProduct } = conflictModal;
    if (!pendingProduct) return;

    const newVId = getItemVendorId(pendingProduct);
    const newVName = getItemVendorName(pendingProduct);
    const newVType = pendingProduct.vendor?.storeType || 'FARMER';
    const prodId = pendingProduct._id || pendingProduct.id;

    if (isAuthenticated && prodId) {
      try {
        await apiService.switchCartVendor(prodId, 1);
        await syncServerCart();
      } catch (err) {
        console.warn('switchCartVendor server error:', err);
      }
    }

    setVendorId(newVId);
    setVendorName(newVName);
    setVendorStoreType(newVType);
    setItems([{ product: pendingProduct, quantity: 1 }]);

    setConflictModal({
      visible: false,
      currentVendorName: '',
      newVendorName: '',
      itemCount: 1,
      pendingProduct: null
    });
  };

  const cancelReplaceCart = () => {
    setConflictModal({
      visible: false,
      currentVendorName: '',
      newVendorName: '',
      itemCount: 1,
      pendingProduct: null
    });
  };

  const updateQuantity = async (productId, delta) => {
    const currentItem = items.find((it) => (it.product?._id || it.product?.id) === productId);
    if (!currentItem) return;

    const newQty = currentItem.quantity + delta;

    if (isAuthenticated) {
      try {
        if (newQty <= 0) {
          await apiService.removeCartItem(productId);
        } else {
          await apiService.updateCartItemQty(productId, newQty);
        }
        await syncServerCart();
        return;
      } catch (err) {
        console.warn('updateCartItemQty server error:', err);
      }
    }

    setItems((prevItems) => {
      if (newQty <= 0) {
        const remaining = prevItems.filter(
          (it) => (it.product?._id || it.product?.id) !== productId
        );
        if (remaining.length === 0) {
          setVendorId(null);
          setVendorName(null);
          setVendorStoreType(null);
        }
        return remaining;
      }
      return prevItems.map((it) =>
        (it.product?._id || it.product?.id) === productId
          ? { ...it, quantity: newQty }
          : it
      );
    });
  };

  const clearEntireCart = async () => {
    if (isAuthenticated) {
      try {
        await apiService.clearCart();
      } catch (e) {
        console.warn('Failed to clear cart on server:', e);
      }
    }
    setItems([]);
    setVendorId(null);
    setVendorName(null);
    setVendorStoreType(null);
    setValidationChanges([]);
  };

  const billSummary = useMemo(() => {
    const subtotal = items.reduce((acc, it) => {
      const p = it.product?.price || 0;
      return acc + p * it.quantity;
    }, 0);

    const deliveryFee = subtotal === 0 ? 0 : subtotal >= 199 ? 0 : 25;
    const taxes = Math.round(subtotal * 0.05);
    const platformFee = subtotal === 0 ? 0 : 5;
    const total = subtotal + deliveryFee + taxes + platformFee;
    const totalCount = items.reduce((acc, it) => acc + it.quantity, 0);

    return {
      subtotal,
      deliveryFee,
      taxes,
      platformFee,
      total,
      totalCount
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        vendorId,
        vendorName,
        vendorStoreType,
        items,
        addToCart,
        updateQuantity,
        clearEntireCart,
        clearCart: clearEntireCart,
        billSummary,
        conflictModal,
        confirmReplaceCart,
        cancelReplaceCart,
        validationChanges,
        isValidating,
        validateCart,
        acknowledgeChanges
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
