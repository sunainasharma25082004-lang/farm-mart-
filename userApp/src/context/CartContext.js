import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { apiService } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Cart state: strictly 1 vendor at any time
  const [vendorId, setVendorId] = useState(null);
  const [vendorName, setVendorName] = useState(null);
  const [vendorStoreType, setVendorStoreType] = useState(null);
  const [items, setItems] = useState([]); // [{ product, quantity }]

  // Conflict modal state for Single-Vendor Cart Guard
  const [conflictModal, setConflictModal] = useState({
    visible: false,
    currentVendorName: '',
    newVendorName: '',
    pendingProduct: null
  });

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

  const getItemVendorName = (product) => {
    if (!product) return 'Store';
    return (
      product.vendor?.storeName ||
      product.vendorName ||
      product.farmer ||
      'Partner Store'
    );
  };

  const addToCart = (product, qty = 1) => {
    const prodVendorId = getItemVendorId(product);
    const prodVendorName = getItemVendorName(product);
    const prodStoreType = product.vendor?.storeType || 'FARMER';

    // 🔴 STRICT SINGLE-VENDOR GUARD
    if (items.length > 0 && vendorId && prodVendorId && vendorId !== prodVendorId) {
      // Vendor mismatch! Show ClearCartModal
      setConflictModal({
        visible: true,
        currentVendorName: vendorName || 'Previous Store',
        newVendorName: prodVendorName,
        pendingProduct: product
      });
      return false;
    }

    // Same vendor or empty cart
    if (!vendorId && prodVendorId) {
      setVendorId(prodVendorId);
      setVendorName(prodVendorName);
      setVendorStoreType(prodStoreType);
    }

    setItems((prevItems) => {
      const prodId = product._id || product.id;
      const existing = prevItems.find(
        (it) => (it.product?._id || it.product?.id) === prodId
      );

      if (existing) {
        return prevItems.map((it) =>
          (it.product?._id || it.product?.id) === prodId
            ? { ...it, quantity: it.quantity + qty }
            : it
        );
      }
      return [...prevItems, { product, quantity: qty }];
    });

    return true;
  };

  const confirmReplaceCart = () => {
    const { pendingProduct } = conflictModal;
    if (!pendingProduct) return;

    const newVId = getItemVendorId(pendingProduct);
    const newVName = getItemVendorName(pendingProduct);
    const newVType = pendingProduct.vendor?.storeType || 'FARMER';

    setVendorId(newVId);
    setVendorName(newVName);
    setVendorStoreType(newVType);
    setItems([{ product: pendingProduct, quantity: 1 }]);

    setConflictModal({
      visible: false,
      currentVendorName: '',
      newVendorName: '',
      pendingProduct: null
    });
  };

  const cancelReplaceCart = () => {
    setConflictModal({
      visible: false,
      currentVendorName: '',
      newVendorName: '',
      pendingProduct: null
    });
  };

  const updateQuantity = (productId, delta) => {
    setItems((prevItems) => {
      const updated = prevItems
        .map((it) => {
          const id = it.product?._id || it.product?.id;
          if (id === productId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean);

      if (updated.length === 0) {
        setVendorId(null);
        setVendorName(null);
        setVendorStoreType(null);
      }
      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => {
      const updated = prevItems.filter(
        (it) => (it.product?._id || it.product?.id) !== productId
      );
      if (updated.length === 0) {
        setVendorId(null);
        setVendorName(null);
        setVendorStoreType(null);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setVendorId(null);
    setVendorName(null);
    setVendorStoreType(null);
  };

  // Bill Summary Calculation
  const billSummary = useMemo(() => {
    const itemsTotal = items.reduce(
      (sum, it) => sum + (it.product?.price || 0) * it.quantity,
      0
    );
    const deliveryFee = itemsTotal >= 200 || itemsTotal === 0 ? 0 : 25;
    const taxes = vendorStoreType === 'HOME_CHEF' ? Math.round(itemsTotal * 0.05) : 0;
    const grandTotal = itemsTotal + deliveryFee + taxes;
    const totalCount = items.reduce((sum, it) => sum + it.quantity, 0);

    const minOrder = vendorStoreType === 'HOME_CHEF' ? 99 : 79;
    const minOrderShortfall = Math.max(0, minOrder - itemsTotal);
    const isMinOrderMet = itemsTotal >= minOrder;

    return {
      itemsTotal,
      deliveryFee,
      taxes,
      grandTotal,
      totalCount,
      minOrder,
      minOrderShortfall,
      isMinOrderMet
    };
  }, [items, vendorStoreType]);

  const placeOrder = async (deliveryAddress, paymentMethod = 'COD') => {
    if (!items.length) {
      throw new Error('Cart is empty');
    }

    const payload = {
      clientOrderId: `ORD_CLI_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      vendorId,
      items: items.map((it) => ({
        productId: it.product._id || it.product.id,
        qty: it.quantity
      })),
      address: deliveryAddress,
      paymentMethod
    };

    const res = await apiService.placeOrder(payload);
    if (res.success && res.order) {
      clearCart();
      return res.order;
    }
    throw new Error(res.message || 'Failed to place order');
  };

  return (
    <CartContext.Provider
      value={{
        vendorId,
        vendorName,
        vendorStoreType,
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        conflictModal,
        confirmReplaceCart,
        cancelReplaceCart,
        billSummary,
        placeOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
