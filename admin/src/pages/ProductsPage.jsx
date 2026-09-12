import React, { useEffect, useState } from "react";
import { Package, RefreshCw, Search, Trash2, Power } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Could not load products");
      setProducts(data.products || []);
    } catch (error) {
      setMessage(error.message || "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateAvailability = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Could not update product");
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? data.product : item)),
      );
    } catch (error) {
      setMessage(error.message || "Could not update product");
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Could not delete product");
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
    } catch (error) {
      setMessage(error.message || "Could not delete product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const haystack =
      `${product.name} ${product.category} ${product.farmer} ${product.vendorId}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div style={styles.page} className="responsive-page-padding">
      <header style={styles.header} className="responsive-flex-header">
        <div>
          <div style={styles.eyebrow}>
            <Package size={15} /> LIVE CATALOG
          </div>
          <h1 style={styles.title}>Products & Inventory</h1>
          <p style={styles.subtitle}>
            Manage listings created by partners and control what customers can
            buy.
          </p>
        </div>
        <button
          type="button"
          style={styles.refreshBtn}
          onClick={fetchProducts}
          disabled={loading}
        >
          <RefreshCw size={16} /> {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, categories, partners..."
            style={styles.searchInput}
          />
        </div>
        <div style={styles.count}>{filteredProducts.length} listings</div>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.grid}>
        {loading ? (
          <div style={styles.empty}>Loading live catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={styles.empty}>No products found.</div>
        ) : (
          filteredProducts.map((product) => (
            <article key={product.id} style={styles.card}>
              <div style={styles.imageWrap}>
                <img src={product.image} alt="" style={styles.image} />
                <span
                  style={{
                    ...styles.status,
                    ...(product.isAvailable
                      ? styles.available
                      : styles.unavailable),
                  }}
                >
                  {product.isAvailable ? "LIVE" : "PAUSED"}
                </span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.category}>{product.category}</div>
                <h2 style={styles.productName}>{product.name}</h2>
                <p style={styles.partner}>
                  {product.farmer || "Local Partner"}
                </p>
                <div style={styles.metaRow}>
                  <strong>₹{product.price}</strong>
                  <span>
                    {product.stock ?? 0} {product.unit || "units"}
                  </span>
                </div>
                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.toggleBtn}
                    onClick={() => updateAvailability(product)}
                  >
                    <Power size={15} />{" "}
                    {product.isAvailable ? "Pause" : "Publish"}
                  </button>
                  <button
                    type="button"
                    style={styles.deleteBtn}
                    onClick={() => deleteProduct(product)}
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "36px",
    maxWidth: "1280px",
    margin: "0 auto",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "28px",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#16a34a",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.7px",
    marginBottom: "8px",
  },
  title: { fontSize: "30px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "14px", color: "#64748b", margin: "8px 0 0" },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    maxWidth: "560px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "11px 14px",
  },
  searchInput: {
    border: 0,
    outline: 0,
    flex: 1,
    fontSize: "14px",
    color: "#0f172a",
  },
  count: { color: "#64748b", fontSize: "13px", fontWeight: "600" },
  message: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(245px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 3px 10px rgba(15, 23, 42, 0.04)",
  },
  imageWrap: { height: "150px", background: "#f1f5f9", position: "relative" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  status: {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: "800",
  },
  available: { background: "#dcfce7", color: "#15803d" },
  unavailable: { background: "#fee2e2", color: "#b91c1c" },
  cardBody: { padding: "14px" },
  category: {
    color: "#16a34a",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  productName: {
    color: "#0f172a",
    fontSize: "16px",
    lineHeight: 1.3,
    margin: "6px 0 4px",
  },
  partner: { color: "#64748b", fontSize: "12px", margin: 0, minHeight: "17px" },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "14px",
    color: "#475569",
    fontSize: "12px",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "14px",
  },
  toggleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    flex: 1,
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#15803d",
    borderRadius: "8px",
    padding: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#dc2626",
    borderRadius: "8px",
    width: "34px",
    height: "34px",
    cursor: "pointer",
  },
  empty: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "32px",
    color: "#64748b",
    gridColumn: "1 / -1",
    textAlign: "center",
  },
};
