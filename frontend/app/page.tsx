"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  title: string;
  level: string;
  examType: string;
  priceDh: number;
  stock: number;
  imageUrl?: string;
  description?: string;
};
type CartItem = Pick<Product, "id" | "title" | "priceDh"> & { qty: number };
type Order = {
  id: number;
  totalDh: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  status: string;
  items: { title: string; qty: number }[];
};
type ConfirmAction = { title: string; message: string; confirmLabel: string; action: () => void };

const fallbackImage =
  "https://pruefungstore-backend.onrender.com/api/assets/products/pack-b1.png";
const initialForm = {
  customerName: "",
  customerPhone: "",
  customerCity: "",
  customerAddress: "",
};
const API =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname.endsWith("onrender.com")
    ? "https://pruefungstore-backend.onrender.com/api"
    : "/api");

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function imageSrc(image?: string) {
  if (!image) return fallbackImage;
  if (image.startsWith("http")) return image;
  const clean = image.replace(/^\/+/, "");
  if (clean.startsWith("assets/")) return `${API}/${clean}`;
  if (clean.startsWith("api/"))
    return `${API.replace(/\/api\/?$/, "")}/${clean}`;
  return `/${clean}`;
}

function ReelCard({
  embedUrl,
  reelUrl,
  title,
}: {
  embedUrl: string;
  reelUrl: string;
  title: string;
}) {
  return (
    <article className="reel-card playable">
      <div className="reel-frame">
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
      </div>
      <a href={reelUrl} target="_blank" rel="noreferrer">
        Open on Instagram ↗
      </a>
    </article>
  );
}

function Brand({
  admin,
  onNavigate,
  backendOnline,
}: {
  admin: boolean;
  onNavigate: (admin: boolean) => void;
  backendOnline: boolean | null;
}) {
  return (
    <header className="topbar">
      <div className="brand" onClick={() => onNavigate(false)}>
        <span className="brand-mark">P</span>
        <span>StoreDeutsch</span>
      </div>
      <nav>
        <button
          className={!admin ? "nav-link active" : "nav-link"}
          onClick={() => onNavigate(false)}
        >
          Catalog
        </button>
        <button
          className={admin ? "nav-link active" : "nav-link"}
          onClick={() => onNavigate(true)}
        >
          Admin studio
        </button>
      </nav>
      <span className={backendOnline ? "live-dot ok" : "live-dot off"}>
        <i />{" "}
        {backendOnline === null
          ? "Checking API..."
          : backendOnline
            ? "Backend connected"
            : "Backend offline"}
      </span>
    </header>
  );
}

function Store() {
  const [products, setProducts] = useState<Product[]>([]),
    [cart, setCart] = useState<CartItem[]>([]),
    [search, setSearch] = useState(""),
    [level, setLevel] = useState(""),
    [examType, setExamType] = useState(""),
    [form, setForm] = useState(initialForm),
    [status, setStatus] = useState(""),
    [submitting, setSubmitting] = useState(false),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    request(`/products?${new URLSearchParams({ search, level, examType })}`)
      .then(setProducts)
      .catch((e) => setStatus(e.message))
      .finally(() => setLoading(false));
  }, [search, level, examType]);
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceDh * item.qty, 0),
    [cart],
  );
  const add = (p: Product) =>
    setCart((prev) => {
      const existing = prev.find((x) => x.id === p.id);
      return existing
        ? prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x))
        : [...prev, { id: p.id, title: p.title, priceDh: p.priceDh, qty: 1 }];
    });
  const setQty = (id: number, qty: number) =>
    setCart((prev) =>
      qty <= 0
        ? prev.filter((x) => x.id !== id)
        : prev.map((x) => (x.id === id ? { ...x, qty } : x)),
    );
  async function checkout(e: FormEvent) {
    e.preventDefault();
    if (!cart.length)
      return setStatus("Add at least one product to your order.");
    const whatsappWindow = window.open("about:blank", "_blank");
    setSubmitting(true);
    try {
      const created = await request("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cart.map((i) => ({ productId: i.id, qty: i.qty })),
        }),
      });
      setStatus(`Order #${created.id} created. Opening WhatsApp...`);
      if (whatsappWindow) whatsappWindow.location.href = created.whatsappUrl;
      else setStatus("Order created. Please allow pop-ups to open WhatsApp.");
      setCart([]);
      setForm(initialForm);
      setProducts(
        await request(
          `/products?${new URLSearchParams({ search, level, examType })}`,
        ),
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="store-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="kicker">
            <span>Deutsch lernen?</span>
            <span className="rule" /> Prüfungsvorbereitung
          </div>
          <h1 className="hero-heading-reference" dir="auto">
            <span>Deutsch lernen?</span>
            <em>Wir helfen</em> dir dabei.
          </h1>
          <p className="hero-subline" dir="auto">
            من أول خطوة حتى <strong>Prüfungserfolg</strong>
          </p>
          <div className="hero-exams" aria-label="Available exam levels">
            <span>TELC</span>
            <i />
            <span>Goethe</span>
            <i />
            <span>ÖSD</span>
            <b>|</b>
            <span>A1 → C1</span>
          </div>
          <div className="hero-levels" aria-label="German levels">
            <span className="level-chip beginner">A1</span>
            <span className="level-chip beginner">A2</span>
            <span className="level-chip">B1</span>
            <span className="level-chip">B2</span>
            <span className="level-chip advanced">C1</span>
            <small>dein Weg, Schritt für Schritt</small>
          </div>
          <div className="hero-benefits" dir="auto">
            <span><b>📖</b> كتب أصلية ومحدثة</span>
            <span><b>✓</b> نماذج امتحانات واقعية</span>
            <span><b>↗</b> تطور مستواك بخطوات ثابتة</span>
            <span><b>★</b> نجاحك هو هدفنا</span>
          </div>
          <div className="hero-actions">
            <a href="#catalog" className="button primary">
              اكتشف الكتب المناسبة لك <span>→</span>
            </a>
            <a
              className="button secondary instagram-button"
              href="https://instagram.com/prufung_vorbereitung_bucher?igsi=MTkweG5pZnExb2h1Yw%3D%3D"
              target="_blank"
              rel="noreferrer"
            >
              تابعنا على Instagram <span>↗</span>
            </a>
            <span className="hero-note">مع أكثر من 2,000 متعلم</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-card back" />
          <div className="art-card front" aria-label="Deutsch Prüfung Vorbereitung study book">
            <div className="cover-shine" />
            <div className="cover-title">
              <span>Deutsch</span>
              <span>Prüfung</span>
              <span>Vorbereitung</span>
            </div>
            <div className="cover-meta">
              <span>A1 — C1</span>
              <span>Prüfungserfolg</span>
            </div>
          </div>
          <div className="floating-badge">
            <b>01</b>
            <span>
              Find your
              <br />
              next level
            </span>
          </div>
        </div>
      </section>

      <section className="reels-section">
        <div>
          <p className="eyebrow">من مجتمع المتعلمين</p>
          <h2>Gemeinsam besser lernen.</h2>
          <p>
            نصائح سريعة للتحضير واقتراحات كتب على Instagram.
          </p>
        </div>
        <div className="reel-grid">
          <ReelCard
            embedUrl="https://www.instagram.com/reel/DS48G8HjKFO/embed"
            reelUrl="https://www.instagram.com/prufung_vorbereitung_bucher/reel/DS48G8HjKFO"
            title="Preparation in motion"
          />
          <ReelCard
            embedUrl="https://www.instagram.com/reel/DU0cnOEjKFq/embed"
            reelUrl="https://www.instagram.com/prufung_vorbereitung_bucher/reel/DU0cnOEjKFq"
            title="Find your right book"
          />
          <ReelCard
            embedUrl="https://www.instagram.com/reel/Db8G-5ns-U-/embed"
            reelUrl="https://www.instagram.com/prufung_vorbereitung_bucher/reel/Db8G-5ns-U-"
            title="Build your advantage"
          />
        </div>
      </section>

      <section className="trust-row">
        <span>CURATED FOR</span>
        <b>TELC</b>
        <b>GOETHE</b>
        <b>ÖSD</b>
        <span className="trust-end">Fast ordering · WhatsApp support</span>
      </section>

      <section className="toolbar" id="catalog">
        <div className="catalog-heading">
          <p className="eyebrow">مكتبة Prüfungsvorbereitung</p>
          <h2>Finde dein passendes Buch.</h2>
          <p className="catalog-description" dir="auto">اختَر كتابك، وابدأ التحضير بثقة — von A1 bis C1.</p>
        </div>
        <div className="filters">
          <label className="search-box">
            <span>⌕</span>
            <input
              placeholder="Search titles, levels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All levels</option>
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
            <option>C1</option>
          </select>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          >
            <option value="">All exams</option>
            <option value="telc">TELC</option>
            <option value="goethe">Goethe / ÖSD</option>
          </select>
        </div>
      </section>

      <div className="shop-grid">
        <section>
          <div className="results-line">
            <span className="results-count">
              <b>{loading ? "—" : products.length}</b> Titel für deine Prüfung
            </span>
            <span className="results-note">Ausgewählte Prüfungsvorbereitung · New arrivals first <span className="sort-arrow">↓</span></span>
          </div>
          <div className="product-grid">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div className="product-card skeleton" key={i} />
                ))
              : products.map((p, index) => (
                  <article className="product-card" key={p.id}>
                    <div className="product-visual">
                      <img
                        src={imageSrc(p.imageUrl)}
                        alt={p.title}
                        onError={(e) => {
                          e.currentTarget.src = fallbackImage;
                        }}
                      />
                      <span className="index">0{index + 1}</span>
                      <span className="level-tag">{p.level}</span>
                    </div>
                    <div className="product-info">
                      <div className="meta">
                        <span>{p.examType}</span>
                        <span
                          className={p.stock > 0 ? "available" : "unavailable"}
                        >
                          {p.stock > 0 ? "In stock" : "Sold out"}
                        </span>
                      </div>
                      <h3>{p.title}</h3>
                      <p>
                        {p.description ||
                          "Official preparation material for focused practice."}
                      </p>
                      <div className="product-bottom">
                        <strong>
                          {p.priceDh} <small>DH</small>
                        </strong>
                        <button
                          className="add-button"
                          disabled={p.stock <= 0}
                          onClick={() => add(p)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
          </div>
          {!loading && !products.length && (
            <div className="empty">
              No titles match your filters. Try a wider search.
            </div>
          )}
        </section>

        <aside className="checkout">
          <div className="checkout-head">
            <div>
              <p className="eyebrow">اختيارك</p>
              <h2 dir="auto">
                طلبك <span>{cart.length}</span>
              </h2>
            </div>
            <span className="bag-icon">◒</span>
          </div>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <span>＋</span>
              <p>
                طلبك في انتظارك.
                <br />
                <small>أضف كتابًا للبدء.</small>
              </p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.priceDh} DH each</span>
                  </div>
                  <div className="qty">
                    <button onClick={() => setQty(item.id, item.qty - 1)}>
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => setQty(item.id, item.qty + 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="total">
            <span>المجموع Gesamt</span>
            <strong>
              {total} <small>DH</small>
            </strong>
          </div>
          <form onSubmit={checkout} className="order-form">
            <p className="form-title">بيانات التوصيل Lieferung</p>
            {[
              ["customerName", "الاسم الكامل / Vollständiger Name"],
              ["customerPhone", "رقم الهاتف / Telefonnummer"],
              ["customerCity", "المدينة / Stadt"],
              ["customerAddress", "العنوان / Adresse"],
            ].map(([key, placeholder]) => (
              <input
                key={key}
                required
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ))}
            <button className="button primary full order-submit" type="submit" disabled={submitting}>
              {submitting ? "جار إرسال الطلب..." : "أكد الطلب Bestellung aufgeben"} <span>{submitting ? "" : "→"}</span>
            </button>
          </form>
          {status && <div className={`toast ${status.startsWith("Order #") ? "success" : "error"}`} role="status"><span>{status.startsWith("Order #") ? "✓" : "!"}</span><p>{status}</p><button type="button" onClick={() => setStatus("")} aria-label="Dismiss message">×</button></div>}
          <p className="secure">Secure ordering · Confirmation via WhatsApp</p>
        </aside>
      </div>
    </main>
  );
}

function OrderManagement({
  orders,
  onStatus,
  onDelete,
}: {
  orders: Order[];
  onStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <section className="admin-card order-management">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Manage</p>
          <h2>Update orders</h2>
        </div>
        <span className="counter">{orders.length} total</span>
      </div>
      {orders.map((order) => (
        <div className="order-management-row" key={order.id}>
          <div>
            <strong>
              #{order.id} · {order.customerName}
            </strong>
            <span>
              {order.items
                .map((item) => `${item.title} ×${item.qty}`)
                .join(", ")}
            </span>
          </div>
          <select
            className={`order-status ${order.status || "pending"}`}
            value={order.status || "pending"}
            onChange={(event) => onStatus(order.id, event.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="danger-link" onClick={() => onDelete(order.id)}>
            Delete
          </button>
        </div>
      ))}
    </section>
  );
}

function Admin() {
  const [credentials, setCredentials] = useState({
      username: "",
      password: "",
    }),
    [adminSession, setAdminSession] = useState(""),
    [products, setProducts] = useState<Product[]>([]),
    [orders, setOrders] = useState<Order[]>([]),
    [status, setStatus] = useState(""),
    [editingId, setEditingId] = useState<number | null>(null),
    [imageFile, setImageFile] = useState<File | null>(null),
    [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null),
    [form, setForm] = useState({
      title: "",
      level: "B1",
      examType: "telc",
      priceDh: 235,
      stock: 0,
      imageUrl: "",
      description: "",
    });
  async function load(t = adminSession) {
    try {
      const [p, o] = await Promise.all([
        request("/admin/products", { headers: { "x-admin-token": t } }),
        request("/admin/orders", { headers: { "x-admin-token": t } }),
      ]);
      setProducts(p);
      setOrders(o);
      setStatus("");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function login(e: FormEvent) {
    e.preventDefault();
    try {
      const data = await request("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      setAdminSession(data.token);
      await load(data.token);
      setStatus("Admin connected");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      if (!editingId && !imageFile)
        throw new Error("Please choose a product image");
      let payload = { ...form };
      if (imageFile) {
        const body = new FormData();
        body.append("image", imageFile);
        const upload = await request("/admin/upload-image", {
          method: "POST",
          headers: { "x-admin-token": adminSession },
          body,
        });
        payload.imageUrl = upload.imageUrl;
      }
      await request(
        editingId ? `/admin/products/${editingId}` : "/admin/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminSession,
          },
          body: JSON.stringify(payload),
        },
      );
      setForm({
        title: "",
        level: "B1",
        examType: "telc",
        priceDh: 235,
        stock: 0,
        imageUrl: "",
        description: "",
      });
      setEditingId(null);
      setImageFile(null);
      await load();
      setStatus("Saved successfully");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  const edit = (p: Product) => {
    setEditingId(p.id);
    setImageFile(null);
    setForm({
      title: p.title,
      level: p.level,
      examType: p.examType,
      priceDh: p.priceDh,
      stock: p.stock,
      imageUrl: p.imageUrl || "",
      description: p.description || "",
    });
  };
  async function removeProduct(id: number) {
    if (!adminSession) return;
    try {
      await request(`/admin/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminSession },
      });
      if (editingId === id) {
        setEditingId(null);
        setForm({
          title: "",
          level: "B1",
          examType: "telc",
          priceDh: 235,
          stock: 0,
          imageUrl: "",
          description: "",
        });
      }
      await load();
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function updateOrderStatus(id: number, status: string) {
    try {
      await request(`/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminSession,
        },
        body: JSON.stringify({ status }),
      });
      setOrders(
        orders.map((order) => (order.id === id ? { ...order, status } : order)),
      );
      setStatus("Order status updated");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function removeOrder(id: number) {
    try {
      await request(`/admin/orders/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminSession },
      });
      setOrders(orders.filter((order) => order.id !== id));
      setStatus("Order deleted");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  const askToDeleteProduct = (id: number) => setConfirmAction({ title: "Delete this title?", message: "This removes the title from your catalog. This action cannot be undone.", confirmLabel: "Delete title", action: () => { setConfirmAction(null); void removeProduct(id); } });
  const askToDeleteOrder = (id: number) => setConfirmAction({ title: "Delete this order?", message: "The order will be permanently removed from your activity history.", confirmLabel: "Delete order", action: () => { setConfirmAction(null); void removeOrder(id); } });
  return (
    <main className="admin-page">
      {adminSession && (
        <OrderManagement orders={orders} onStatus={updateOrderStatus} onDelete={askToDeleteOrder} />
      )}
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Control room</p>
          <h1>
            Admin <em>studio.</em>
          </h1>
          <p>Manage your catalog and keep every order moving.</p>
        </div>
        <div className="admin-state">
          <span className={adminSession ? "pulse on" : "pulse"} />{" "}
          {adminSession ? "Connected" : "Awaiting access"}
        </div>
      </div>
      <div className="admin-auth grid-two">
        <form className="admin-card" onSubmit={login}>
          <p className="eyebrow">01 / Access</p>
          <h2>Sign in to studio</h2>
          <input
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            placeholder="Password"
            required
          />
          <button className="button primary full">Connect with password</button>
        </form>
      </div>
      {adminSession && (
        <section className="dashboard-overview">
          <div className="metric-card featured">
            <span>Workspace pulse</span>
            <strong>{orders.length}</strong>
            <small>orders to keep moving</small>
            <div className="metric-bar">
              <i
                style={{ width: `${Math.min(100, orders.length * 12 + 8)}%` }}
              />
            </div>
          </div>
          <div className="metric-card">
            <span>Catalog titles</span>
            <strong>{products.length}</strong>
            <small>published in your store</small>
          </div>
          <div className="metric-card">
            <span>Units on hand</span>
            <strong>
              {products.reduce((sum, product) => sum + product.stock, 0)}
            </strong>
            <small>across every title</small>
          </div>
          <div className="metric-card">
            <span>Revenue tracked</span>
            <strong>
              {orders
                .reduce((sum, order) => sum + order.totalDh, 0)
                .toLocaleString()}{" "}
              <small>DH</small>
            </strong>
            <small>from recorded orders</small>
          </div>
          <div className="dashboard-panel">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Recent activity</p>
                <h2>Orders in motion</h2>
              </div>
              <span className="counter">Live feed</span>
            </div>
            {orders.length ? (
              <div className="activity-list">
                {orders.slice(0, 4).map((order) => (
                  <div className="activity-row" key={order.id}>
                    <span className="activity-index">#{order.id}</span>
                    <div>
                      <strong>{order.customerName}</strong>
                      <small>
                        {order.customerCity} · {order.items.length} title
                        {order.items.length === 1 ? "" : "s"}
                      </small>
                    </div>
                    <b>{order.totalDh.toLocaleString()} DH</b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">
                No orders yet. New activity will appear here.
              </p>
            )}
          </div>
          <div className="dashboard-panel">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Stock watch</p>
                <h2>Needs attention</h2>
              </div>
              <span className="counter">
                {products.filter((product) => product.stock < 5).length} alerts
              </span>
            </div>
            <div className="stock-watch">
              {products
                .filter((product) => product.stock < 5)
                .slice(0, 5)
                .map((product) => (
                  <div className="activity-row" key={product.id}>
                    <div>
                      <strong>{product.title}</strong>
                      <small>
                        {product.level} · {product.examType}
                      </small>
                    </div>
                    <b className={product.stock === 0 ? "critical" : ""}>
                      {product.stock} left
                    </b>
                  </div>
                ))}
              {!products.some((product) => product.stock < 5) && (
                <p className="empty-state">
                  Everything is comfortably stocked.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
      <div
        className={
          adminSession ? "grid-two admin-content" : "admin-content locked"
        }
      >
        <form className="admin-card" onSubmit={submit}>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Catalog editor</p>
              <h2>{editingId ? "Edit title" : "Add a title"}</h2>
            </div>
            <span className="counter">{editingId ? "Editing" : "New"}</span>
          </div>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="form-row">
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
  <option>A1</option>
  <option>A2</option>
  <option>B1</option>
  <option>B2</option>
  <option>C1</option>
  <option>B1 & B2</option>
            </select>
            <select
              value={form.examType}
              onChange={(e) => setForm({ ...form, examType: e.target.value })}
            >
              <option value="telc">telc</option>
              <option value="goethe">goethe</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="number"
              min="1"
              value={form.priceDh}
              onChange={(e) =>
                setForm({ ...form, priceDh: Number(e.target.value) })
              }
            />
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Number(e.target.value) })
              }
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <input
            placeholder="Image URL (optional fallback)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button className="button primary full">
            {editingId ? "Update title →" : "Create title →"}
          </button>
        </form>
        <section>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Inventory</p>
              <h2>Live stock</h2>
            </div>
            <span className="counter">{products.length} titles</span>
          </div>
          <div className="inventory-list">
            {products.map((p) => (
              <article className="inventory-item" key={p.id}>
                <div className="inventory-product">
                  <img src={imageSrc(p.imageUrl)} alt="" />
                  <div>
                    <strong>{p.title}</strong>
                    <span>
                      {p.level} · {p.examType} · {p.priceDh} DH
                    </span>
                  </div>
                </div>
                <b className={p.stock < 5 ? "low-stock" : ""}>
                  {p.stock} <small>left</small>
                </b>
                <button onClick={() => edit(p)}>Edit</button>
                <button
                  className="danger-link"
                  onClick={() => askToDeleteProduct(p.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
      <section className="admin-card orders">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Activity</p>
            <h2>Recent orders</h2>
          </div>
          <span className="counter">{orders.length} total</span>
        </div>
        {orders.map((o) => (
          <article className="order-row" key={o.id}>
            <strong>#{o.id}</strong>
            <div>
              <b>{o.customerName}</b>
              <span>
                {o.customerCity} · {o.customerPhone}
              </span>
            </div>
            <span>{o.items.map((i) => `${i.title} ×${i.qty}`).join(", ")}</span>
            <b>{o.totalDh} DH</b>
          </article>
        ))}
      </section>
      {status && <div className={`toast admin-toast ${/error|invalid|failed|could not|not found/i.test(status) ? "error" : "success"}`} role="status"><span>{/error|invalid|failed|could not|not found/i.test(status) ? "!" : "✓"}</span><p>{status}</p><button type="button" onClick={() => setStatus("")} aria-label="Dismiss message">×</button></div>}
      {confirmAction && <div className="modal-backdrop" role="presentation" onClick={() => setConfirmAction(null)}><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={event => event.stopPropagation()}><span className="confirm-icon">!</span><h2 id="confirm-title">{confirmAction.title}</h2><p>{confirmAction.message}</p><div className="confirm-actions"><button type="button" className="button secondary" onClick={() => setConfirmAction(null)}>Cancel</button><button type="button" className="button danger-button" onClick={confirmAction.action}>{confirmAction.confirmLabel}</button></div></section></div>}
    </main>
  );
}

export default function Page() {
  const [admin, setAdmin] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    request("/health")
      .then(() => {
        if (active) setBackendOnline(true);
      })
      .catch(() => {
        if (active) setBackendOnline(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="app-shell">
      <Brand
        admin={admin}
        onNavigate={setAdmin}
        backendOnline={backendOnline}
      />
      {admin ? <Admin /> : <Store />}
      <footer>
        StoreDeutsch <span>· Study seriously. Order simply.</span>
      </footer>
    </div>
  );
}
