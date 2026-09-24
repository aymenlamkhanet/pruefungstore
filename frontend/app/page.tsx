"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Product = {
  id: number;
  title: string;
  level: string;
  examType: string;
  priceDh: number;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
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
  "https://pruefungstore-backend-261a.onrender.com/api/assets/products/pack-b1.png";
const initialForm = {
  customerName: "",
  customerPhone: "",
  customerCity: "",
  customerAddress: "",
};
const API =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname.endsWith("onrender.com") ||
    window.location.hostname.includes("storedeutsch.com"))
    ? "/api"
    : "/api");

async function request(path: string, options?: RequestInit, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API}${path}`, {
        cache: "no-store",
        ...options,
      });
      if ([502, 503, 504].includes(response.status) && attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Une erreur est survenue");
      return data;
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
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

async function compressImage(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  return new Promise((resolve) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      return resolve(file);
    }

    const img = new Image();
    const cleanup = () => {
      try {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      } catch {}
    };

    img.onload = () => {
      try {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          return resolve(file);
        }
        ctx.drawImage(img, 0, 0, width, height);

        const format = "image/jpeg";
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            try {
              const safeName = (file.name || "photo").replace(/\.[^.]+$/, ".jpg");
              let optimized: File;
              try {
                optimized = new File([blob], safeName, { type: format });
              } catch {
                const f: any = blob;
                f.name = safeName;
                f.lastModified = Date.now();
                optimized = f as File;
              }
              resolve(optimized);
            } catch {
              resolve(file);
            }
          },
          format,
          0.82
        );
      } catch {
        cleanup();
        resolve(file);
      }
    };

    img.onerror = () => {
      cleanup();
      resolve(file);
    };

    img.src = objectUrl;
  });
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
          allowFullScreen
          scrolling="no"
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
}: {
  admin: boolean;
  onNavigate: (admin: boolean) => void;
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
    [loading, setLoading] = useState(true),
    [selectedProduct, setSelectedProduct] = useState<Product | null>(null),
    [selectedImage, setSelectedImage] = useState(0),
    [checkoutVisible, setCheckoutVisible] = useState(false);
  useEffect(() => {
    setLoading(true);
    request(`/products?${new URLSearchParams({ search, level, examType })}`)
      .then(setProducts)
      .catch((e) => setStatus(e.message))
      .finally(() => setLoading(false));
  }, [search, level, examType]);

  useEffect(() => {
    const el = document.getElementById("order-checkout");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setCheckoutVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceDh * item.qty, 0),
    [cart],
  );
  const scrollToCheckout = (force = false) => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth <= 980;
    const el = document.getElementById("order-checkout");
    if (!el) return;

    if (isMobile || force) {
      const headerOffset = window.innerWidth <= 680 ? 115 : 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + (window.scrollY || window.pageYOffset || 0) - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
    el.classList.remove("checkout-highlight");
    void el.offsetWidth;
    el.classList.add("checkout-highlight");
  };

  const add = (p: Product) => {
    if (p.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((x) => x.id === p.id);
      return existing
        ? prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x))
        : [...prev, { id: p.id, title: p.title, priceDh: p.priceDh, qty: 1 }];
    });
    setSelectedProduct(null);
    requestAnimationFrame(() => {
      setTimeout(() => scrollToCheckout(false), 60);
    });
  };
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
            <span><b className="benefit-icon book-icon" aria-hidden="true">▥</b> كتب أصلية ومحدثة</span>
            <span><b className="benefit-icon exam-icon" aria-hidden="true">✓</b> نماذج امتحانات واقعية</span>
            <span><b className="benefit-icon progress-icon" aria-hidden="true">↗</b> تطور مستواك بخطوات ثابتة</span>
            <span><b className="benefit-icon goal-icon" aria-hidden="true">★</b> نجاحك هو هدفنا</span>
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
          <div className="art-card front" aria-label="TELC-Prüfung Deutsch B2 Vorbereitung">
            <img
              src="/telc-b2-cover.jpg"
              alt="TELC-Prüfung Deutsch B2 Vorbereitung"
              className="art-card-cover"
            />
            <div className="cover-shine" />
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
            embedUrl="https://www.instagram.com/reel/DdoZJEwtW1J/embed/"
            reelUrl="https://www.instagram.com/reel/DdoZJEwtW1J/?stkn=M3U4Z3BlOXB6czB2"
            title="Prüfungsvorbereitung B1 & B2 TELC"
          />
          <ReelCard
            embedUrl="https://www.instagram.com/p/DdZ-yPVjcD0/embed/"
            reelUrl="https://www.instagram.com/p/DdZ-yPVjcD0/?stkn=emJpbnI3aXg4Yjky"
            title="Vorbereitung Bücher"
          />
          <ReelCard
            embedUrl="https://www.instagram.com/p/Ddoa7H1DcD8/embed/"
            reelUrl="https://www.instagram.com/p/Ddoa7H1DcD8/?img_index=5&stkn=dG9ham41ODV6dmRj"
            title="Modelltests & Tipps"
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
            <option value="goethe">Goethe</option>
            <option value="ÖSD">ÖSD</option>
            <option value="others">Others</option>
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
                  <article className="product-card" key={p.id} onClick={() => { setSelectedProduct(p); setSelectedImage(0); }} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") { setSelectedProduct(p); setSelectedImage(0); } }}>

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
                      <h3 dir="auto">{p.title}</h3>
                      <p dir="auto">
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
                          onClick={(e) => { e.stopPropagation(); add(p); }}
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

        <aside className="checkout" id="order-checkout">
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
                    <strong dir="auto">{item.title}</strong>
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
      {selectedProduct && (
        <div className="product-detail-backdrop" role="presentation" onClick={() => setSelectedProduct(null)}>
          <section className="product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close" onClick={() => setSelectedProduct(null)} aria-label="Close product details">×</button>
            <div className="detail-gallery">
              <div className="detail-main-image"><img src={imageSrc((selectedProduct.imageUrls?.length ? selectedProduct.imageUrls : [selectedProduct.imageUrl])[selectedImage])} alt={selectedProduct.title} /></div>
              <div className="detail-thumbnails">
                {(selectedProduct.imageUrls?.length ? selectedProduct.imageUrls : [selectedProduct.imageUrl]).map((image, index) => (
                  <button className={index === selectedImage ? "active" : ""} key={`${image}-${index}`} onClick={() => setSelectedImage(index)} aria-label={`View image ${index + 1}`}><img src={imageSrc(image)} alt="" /></button>
                ))}
              </div>
            </div>
            <div className="detail-copy">
              <div className="detail-header">
                <span className="eyebrow">{selectedProduct.examType} · {selectedProduct.level}</span>
                <h2 id="product-detail-title" dir="auto">{selectedProduct.title}</h2>
              </div>
              <div className="detail-body">
                <p className="detail-description" dir="auto">
                  {selectedProduct.description || "Official preparation material for focused practice."}
                </p>
              </div>
              <div className="detail-footer">
                <div className="detail-price-box">
                  <span className="detail-price-label">Prix / السعر</span>
                  <strong className="detail-price">{selectedProduct.priceDh} <small>DH</small></strong>
                </div>
                <button
                  className="button primary detail-add-btn"
                  disabled={selectedProduct.stock <= 0}
                  onClick={() => { add(selectedProduct); setSelectedProduct(null); }}
                >
                  {selectedProduct.stock > 0 ? "Ajouter au panier + Add" : "Sold out"} <span>→</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
      {cart.length > 0 && !checkoutVisible && (
        <div
          className="mobile-floating-checkout-bar"
          onClick={() => scrollToCheckout(true)}
          role="button"
          tabIndex={0}
          aria-label="الانتقال إلى إتمام الطلب"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              scrollToCheckout(true);
            }
          }}
        >
          <span>🛒 طلبك ({cart.length}) · {total} DH</span>
          <b>إتمام الطلب ←</b>
        </div>
      )}
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

function Admin({ onLogout }: { onLogout?: () => void }) {
  const getStoredSession = () => {
    if (typeof window === "undefined") return "";
    try {
      return sessionStorage.getItem("adminSession") || localStorage.getItem("adminSession") || "";
    } catch {
      return "";
    }
  };

  const saveStoredSession = (token: string) => {
    if (typeof window === "undefined") return;
    try {
      if (token) {
        sessionStorage.setItem("adminSession", token);
        localStorage.setItem("adminSession", token);
      } else {
        sessionStorage.removeItem("adminSession");
        localStorage.removeItem("adminSession");
      }
    } catch {}
  };

  const [credentials, setCredentials] = useState({
      username: "",
      password: "",
    }),
    [adminSession, setAdminSession] = useState(() => getStoredSession()),
    [products, setProducts] = useState<Product[]>([]),
    [orders, setOrders] = useState<Order[]>([]),
    [status, setStatus] = useState(""),
    [editingId, setEditingId] = useState<number | null>(null),
    [imageFiles, setImageFiles] = useState<File[]>([]),
    [imagePreviews, setImagePreviews] = useState<string[]>([]),
    [existingImageUrls, setExistingImageUrls] = useState<string[]>([]),
    [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null),
    [currentPassword, setCurrentPassword] = useState(""),
    [newPassword, setNewPassword] = useState(""),
    [confirmPassword, setConfirmPassword] = useState(""),
    [passwordSubmitting, setPasswordSubmitting] = useState(false),
    [loggingIn, setLoggingIn] = useState(false),
    [savingProduct, setSavingProduct] = useState(false),
    imageInputRef = useRef<HTMLInputElement>(null),
    [form, setForm] = useState({
      title: "",
      level: "B1",
      examType: "telc",
      priceDh: 235,
      stock: 0,
      imageUrl: "",
      description: "",
    });

  useEffect(() => {
    if (adminSession) {
      load(adminSession);
    }
  }, []);

  async function load(t = adminSession) {
    if (!t) return;
    try {
      const [p, o] = await Promise.all([
        request("/admin/products", { headers: { "x-admin-token": t } }),
        request("/admin/orders", { headers: { "x-admin-token": t } }),
      ]);
      setProducts(p || []);
      setOrders(o || []);
      setStatus("");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      setStatus("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setPasswordSubmitting(true);
    try {
      const res = await request("/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminSession,
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });
      if (res.token) {
        setAdminSession(res.token);
        saveStoredSession(res.token);
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus(res.message || "Mot de passe mis à jour avec succès dans la base de données.");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setPasswordSubmitting(false);
    }
  }
  async function login(e: FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setStatus("Connexion au serveur en cours...");
    try {
      const userToSend = credentials.username.trim();
      const passToSend = credentials.password.trim();
      const data = await request("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userToSend,
          password: passToSend,
        }),
      });
      setAdminSession(data.token);
      saveStoredSession(data.token);
      await load(data.token);
      setStatus("Connecté avec succès");
      setCredentials({ username: "", password: "" });
    } catch (e) {
      setStatus((e as Error).message || "Identifiants administrateur incorrects");
    } finally {
      setLoggingIn(false);
    }
  }
  function handleImageFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    if (selected.length > 6) {
      setStatus("Vous pouvez sélectionner jusqu'à 6 images maximum.");
      event.target.value = "";
      return;
    }
    const invalid = selected.find((file) => {
      const type = (file.type || "").toLowerCase();
      const name = (file.name || "").toLowerCase();
      const isImgType = type.startsWith("image/");
      const hasImgExt = /\.(jpg|jpeg|png|webp|gif|heic|heif|avif)$/i.test(name);
      return !isImgType && !hasImgExt;
    });
    if (invalid) {
      setStatus("Veuillez sélectionner uniquement des images (JPG, PNG, WEBP, HEIC).");
      event.target.value = "";
      return;
    }
    setImageFiles(selected);
    setImagePreviews(selected.map((file) => URL.createObjectURL(file)));
  }

  function removeImage(index: number) {
    setImageFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setImagePreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function resetImagePicker() {
    imagePreviews.forEach((preview) => {
      try { URL.revokeObjectURL(preview); } catch {}
    });
    setImageFiles([]);
    setImagePreviews([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!adminSession) {
      setStatus("Veuillez vous connecter à l'Admin studio ci-dessus avant d'enregistrer un produit.");
      return;
    }
    setSavingProduct(true);
    try {
      if (!editingId && !imageFiles.length && !form.imageUrl)
        throw new Error("Veuillez choisir au moins une photo pour le produit");
      let payload: typeof form & { imageUrls?: string[] } = { ...form };
      if (existingImageUrls.length) payload.imageUrls = existingImageUrls;
      if (imageFiles.length) {
        const optimizedFiles: File[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
          setStatus(`Optimisation de l'image ${i + 1}/${imageFiles.length}...`);
          const opt = await compressImage(imageFiles[i]);
          optimizedFiles.push(opt);
        }
        setStatus("Envoi des images sur le serveur...");
        const body = new FormData();
        optimizedFiles.forEach((file) => body.append("images", file));
        const upload = await request("/admin/upload-images", {
          method: "POST",
          headers: { "x-admin-token": adminSession },
          body,
        });
        payload.imageUrl = upload.imageUrls[0];
        payload.imageUrls = upload.imageUrls;
      }
      setStatus("Enregistrement du produit en base...");
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
      setExistingImageUrls([]);
      resetImagePicker();
      await load();
      setStatus("Produit enregistré avec succès !");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setSavingProduct(false);
    }
  }
  const edit = (p: Product) => {
      setEditingId(p.id);
      resetImagePicker();
      setExistingImageUrls(p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : []);
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
          {adminSession && (
            <button
              type="button"
              className="danger-link"
              style={{ marginLeft: ".8rem", fontSize: ".75rem" }}
              onClick={() => {
                setAdminSession("");
                saveStoredSession("");
                setStatus("Déconnecté de l'Admin studio");
                if (onLogout) onLogout();
              }}
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
      <div className="admin-auth grid-two">
        {!adminSession ? (
          <form className="admin-card" onSubmit={login}>
            <p className="eyebrow">01 / Access</p>
            <h2>Sign in to studio</h2>
            <input
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              placeholder="Nom d'utilisateur"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              placeholder="Mot de passe"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
            <button className="button primary full" disabled={loggingIn}>
              {loggingIn ? "Connexion en cours..." : "Connect with password"}
            </button>
          </form>
        ) : (
          <form className="admin-card" onSubmit={changePassword}>
            <div className="card-heading">
              <div>
                <p className="eyebrow">01 / Sécurité</p>
                <h2>Changer le mot de passe</h2>
              </div>
            </div>
            <input
              type="password"
              required
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="form-row">
              <input
                type="password"
                required
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                required
                placeholder="Confirmer nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button className="button primary full" disabled={passwordSubmitting}>
              {passwordSubmitting ? "Enregistrement en base..." : "Mettre à jour le mot de passe →"}
            </button>
          </form>
        )}
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
              <option value="ÖSD">ÖSD</option>
              <option value="others">others</option>
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
            ref={imageInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            onChange={handleImageFiles}
          />
          {(imagePreviews.length > 0 || existingImageUrls.length > 0) && (
            <div className="admin-image-gallery" aria-live="polite">
              {(imagePreviews.length ? imagePreviews : existingImageUrls).map((src, index) => (
                <div className="admin-image-thumb" key={`${src}-${index}`}>
                  <img src={imagePreviews.length ? src : imageSrc(src)} alt={`Product image ${index + 1}`} />
                  <button type="button" onClick={() => imagePreviews.length ? removeImage(index) : setExistingImageUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove image ${index + 1}`}>×</button>
                  {index === 0 && <span>Cover</span>}
                </div>
              ))}
            </div>
          )}
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
          <button
            className="button primary full"
            disabled={savingProduct || !adminSession}
            title={!adminSession ? "Veuillez d'abord vous connecter à l'Admin studio en haut" : undefined}
          >
            {savingProduct
              ? "Enregistrement en cours..."
              : !adminSession
              ? "Connexion requise pour publier un produit"
              : editingId
              ? "Update title →"
              : "Create title →"}
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
                    <strong dir="auto">{p.title}</strong>
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

  useEffect(() => {
    // Ping health in the background on visit to keep backend warm
    request("/health").catch(() => {});

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("admin")) {
        setAdmin(true);
      }
    }
  }, []);

  const handleNavigate = (toAdmin: boolean) => {
    if (!toAdmin) {
      // Déconnexion automatique lors du retour au catalogue
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("adminSession");
          localStorage.removeItem("adminSession");
          const url = new URL(window.location.href);
          if (url.searchParams.has("admin")) {
            url.searchParams.delete("admin");
            window.history.replaceState({}, "", url.pathname);
          }
        } catch {}
      }
      setAdmin(false);
    } else {
      setAdmin(true);
    }
  };

  return (
    <div className="app-shell">
      <Brand
        admin={admin}
        onNavigate={handleNavigate}
      />
      {admin ? <Admin onLogout={() => handleNavigate(false)} /> : <Store />}
      <footer>
        StoreDeutsch <span>· Study seriously. Order simply.</span>
      </footer>
    </div>
  );
}
