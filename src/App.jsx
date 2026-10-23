import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Search, ShoppingBag, User, Package, Star, X, Trash2, Check, Tag, Truck } from "lucide-react";
import "./App.css";

const CATS = ["All", "Clothing", "Footwear", "Accessories", "Audio", "Tech"];
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GENDERS = ["All", "Men", "Women"];
const COUPONS = { SAVE10: [10, "10% off your order"], WELCOME15: [15, "15% off orders above ₹5,000"], FREESHIP: [0, "Free shipping"] };
const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const off = (p) => Math.round((1 - p.price / p.old) * 100);

const newOrderMeta = () => ({ id: "SS-" + Date.now().toString().slice(-8), date: new Date().toLocaleDateString("en-IN") });

function useStore(key, init) {
  const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, setV];
}

function Card({ p, liked, onWish, onOpen }) {
  return (
    <article className="card" onClick={() => onOpen(p)}>
      <div className="card-img">
        <img src={p.image} alt={p.name} loading="lazy" onError={(e) => (e.target.style.visibility = "hidden")} />
        <span className="rate"><b>{p.rating}</b> <Star size={11} fill="#14958f" stroke="none" /></span>
        <button className={`wish ${liked ? "on" : ""}`} aria-label="Wishlist" onClick={(e) => { e.stopPropagation(); onWish(p.id); }}>
          <Heart size={17} fill={liked ? "#ff3f6c" : "none"} />
        </button>
      </div>
      <div className="card-info">
        <b>{p.brand}</b><span>{p.name}</span>
        <div><b>{money(p.price)}</b> <s>{money(p.old)}</s> <em>({off(p)}% OFF)</em></div>
      </div>
    </article>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [cat, setCat] = useState("All");
  const [gen, setGen] = useState("All");
  const [user, setUser] = useStore("ss-user", null);
  const [users, setUsers] = useStore("ss-users", []);
  const [authOpen, setAuthOpen] = useState(!user);
  const [mode, setMode] = useState("login");
  const [af, setAf] = useState({ name: "", email: "", otp: "" });
  const [step, setStep] = useState("email");
  const [busy, setBusy] = useState(false);
  const finishRef = useRef(null);
  const [aerr, setAerr] = useState("");
  const [next, setNext] = useState(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("rec");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [brands, setBrands] = useState([]);
  const [detail, setDetail] = useState(null);
  const [size, setSize] = useState("");
  const [cart, setCart] = useStore("ss-cart", []);
  const [wish, setWish] = useStore("ss-wish", []);
  const [orders, setOrders] = useStore("ss-orders", []);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState("");
  const [addr, setAddr] = useState({ name: "", phone: "", pin: "", address: "", pay: "COD" });
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    fetch("/products.json").then((r) => r.json()).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);
  const say = (t) => { setToast(t); setTimeout(() => setToast(""), 1800); };
  const go = (v) => {
    if (v === "checkout" && !user) { setNext("checkout"); setMode("login"); setAerr(""); setAuthOpen(true); say("Please login to continue"); return; }
    setView(v); window.scrollTo(0, 0);
  };
  const openAuth = (m = "login") => { setMode(m); setStep("email"); setAerr(""); setAuthOpen(true); };
  const setA = (k) => (e) => setAf({ ...af, [k]: e.target.value });
  const finish = (u) => {
    if (!users.some((x) => x.email === u.email)) setUsers([...users, { name: u.name, email: u.email }]);
    setUser({ name: u.name, email: u.email }); setAuthOpen(false); setStep("email"); setAf({ name: "", email: "", otp: "" });
    say(`Welcome, ${u.name.split(" ")[0]}!`);
    if (next) { setView(next); setNext(null); window.scrollTo(0, 0); }
  };
  const callApi = async (path, body) => {
    try {
      const r = await fetch(`${API}/api/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Something went wrong");
      return d;
    } catch (err) {
      throw new Error(err instanceof TypeError ? "Can't reach the OTP server. Run `npm run server`." : err.message, { cause: err });
    }
  };
  const sendOtp = async (e) => {
    e.preventDefault();
    const email = af.email.trim().toLowerCase();
    const exists = users.some((x) => x.email === email);
    if (mode === "login" && !exists) return setAerr("No account found with this email. Please create one.");
    if (mode === "signup" && exists) return setAerr("An account with this email already exists. Please login.");
    setBusy(true); setAerr("");
    try { await callApi("send-otp", { email }); setStep("otp"); say("OTP sent to your email"); }
    catch (err) { setAerr(err.message); }
    setBusy(false);
  };
  const verifyOtp = async (e) => {
    e.preventDefault();
    const email = af.email.trim().toLowerCase();
    setBusy(true); setAerr("");
    try {
      await callApi("verify-otp", { email, otp: af.otp.trim() });
      finish({ email, name: users.find((x) => x.email === email)?.name || af.name.trim() || email.split("@")[0] });
    } catch (err) { setAerr(err.message); }
    setBusy(false);
  };
  useEffect(() => { finishRef.current = finish; });
  useEffect(() => {
    if (!authOpen || !GID) return;
    const init = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GID,
        callback: ({ credential }) => {
          const d = JSON.parse(atob(credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
          finishRef.current({ name: d.name || d.email, email: d.email.toLowerCase() });
        },
      });
      const el = document.getElementById("gbtn");
      if (el) window.google.accounts.id.renderButton(el, { theme: "outline", size: "large", width: 300, text: "continue_with" });
    };
    if (window.google) return init();
    const sc = document.createElement("script");
    sc.src = "https://accounts.google.com/gsi/client"; sc.async = true; sc.onload = init;
    document.head.appendChild(sc);
  }, [authOpen]);
  const logout = () => { setUser(null); setView("home"); say("Logged out"); };

  const allBrands = [...new Set(products.map((p) => p.brand))];
  const list = useMemo(() => {
    const r = products.filter((p) =>
      (cat === "All" || p.cat === cat) && (gen === "All" || p.gender === gen || p.gender === "Unisex") && p.price <= maxPrice && p.rating >= minRating &&
      (!brands.length || brands.includes(p.brand)) &&
      `${p.name} ${p.brand} ${p.cat}`.toLowerCase().includes(q.toLowerCase()));
    if (sort === "low") r.sort((a, b) => a.price - b.price);
    if (sort === "high") r.sort((a, b) => b.price - a.price);
    if (sort === "disc") r.sort((a, b) => off(b) - off(a));
    if (sort === "rate") r.sort((a, b) => b.rating - a.rating);
    return r;
  }, [products, cat, gen, q, sort, maxPrice, minRating, brands]);

  const myOrders = orders.filter((o) => o.email === user?.email);
  const lines = cart.map((c) => ({ ...c, p: products.find((x) => x.id === c.id) })).filter((l) => l.p);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const mrp = lines.reduce((s, l) => s + l.p.old * l.qty, 0);
  const disc = coupon && coupon !== "FREESHIP" ? Math.round((subtotal * COUPONS[coupon][0]) / 100) : 0;
  const ship = !subtotal || subtotal >= 2999 || coupon === "FREESHIP" ? 0 : 99;
  const total = subtotal - disc + ship;

  const toggleWish = (id) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const open = (p) => { setDetail(p); setSize(p.sizes.length === 1 ? p.sizes[0] : ""); };
  const add = (p, s) => {
    if (!s) return say("Please select a size");
    setCart((c) => c.some((x) => x.id === p.id && x.size === s)
      ? c.map((x) => (x.id === p.id && x.size === s ? { ...x, qty: x.qty + 1 } : x))
      : [...c, { id: p.id, size: s, qty: 1 }]);
    setDetail(null); say("Added to bag");
  };
  const qty = (i, d) => setCart((c) => c.map((x, j) => (j === i ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0));
  const applyCode = () => {
    const k = code.trim().toUpperCase();
    if (!COUPONS[k]) { setCoupon(null); return setMsg("Invalid coupon code"); }
    if (k === "WELCOME15" && subtotal < 5000) { setCoupon(null); return setMsg("Add items worth ₹5,000 to use this"); }
    setCoupon(k); setMsg(`${k} applied`);
  };
  const place = (e) => {
    e.preventDefault();
    if (!user) return openAuth("login");
    const o = { ...newOrderMeta(), email: user.email, lines, total, pay: addr.pay, status: "Confirmed" };
    setOrders((os) => [o, ...os]); setPlaced(o); setCart([]); setCoupon(null); setCode(""); setMsg(""); go("done");
  };
  const set = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });

  return (
    <div>
      <header className="hdr">
        <a className="logo" onClick={() => { setCat("All"); go("home"); }}>smart<b>save</b></a>
        <nav>{GENDERS.map((g) => (
          <a key={g} className={gen === g ? "act" : ""} onClick={() => { setGen(g); go("home"); }}>{g === "All" ? "All" : g}</a>))}</nav>
        <label className="search"><Search size={16} />
          <input placeholder="Search for products, brands and more" value={q} onChange={(e) => { setQ(e.target.value); setView("home"); }} />
        </label>
        <div className="icons">
          <a onClick={() => go("orders")}><Package size={19} /><span>Orders</span></a>
          {user ? <a onClick={logout} title="Click to logout"><User size={19} /><span>{user.name.split(" ")[0]} · Logout</span></a>
            : <a onClick={() => openAuth("login")}><User size={19} /><span>Login</span></a>}
          <a onClick={() => go("wish")}><Heart size={19} />{wish.length > 0 && <i>{wish.length}</i>}<span>Wishlist</span></a>
          <a onClick={() => go("bag")}><ShoppingBag size={19} />{count > 0 && <i>{count}</i>}<span>Bag</span></a>
        </div>
      </header>
      <div className="promo"><Tag size={14} /> Use WELCOME15 · SAVE10 · FREESHIP &nbsp;|&nbsp; <Truck size={14} /> Free delivery over ₹2,999</div>

      {view === "home" && (<main>
        {cat === "All" && gen === "All" && !q && (<section className="hero">
          <div><small>END OF REASON SALE</small><h1>Min. 30–60% OFF</h1><p>Fashion, footwear, audio & more</p>
            <button onClick={() => setCat("Clothing")}>SHOP NOW</button></div>
        </section>)}
        {cat === "All" && gen === "All" && !q && (<section className="tiles">{CATS.slice(1).map((c) => (
          <button key={c} onClick={() => setCat(c)}>{c}</button>))}</section>)}
        <div className="shop">
          <aside className="filters">
            <h4>FILTERS <a onClick={() => { setMaxPrice(10000); setMinRating(0); setBrands([]); setCat("All"); setGen("All"); }}>Clear</a></h4>
            <h5>Categories</h5>{CATS.map((c) => (
              <label key={c}><input type="radio" checked={cat === c} onChange={() => setCat(c)} /> {c}</label>))}
            <h5>Brand</h5>{allBrands.map((b) => (
              <label key={b}><input type="checkbox" checked={brands.includes(b)} onChange={() => setBrands((x) => x.includes(b) ? x.filter((y) => y !== b) : [...x, b])} /> {b}</label>))}
            <h5>Price up to {money(maxPrice)}</h5>
            <input type="range" min="500" max="10000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
            <h5>Rating</h5>{[4, 3, 0].map((r) => (
              <label key={r}><input type="radio" checked={minRating === r} onChange={() => setMinRating(r)} /> {r ? `${r}.0 & above` : "Any"}</label>))}
          </aside>
          <section className="results">
            <div className="bar"><b>{[gen !== "All" && gen, cat === "All" ? (gen === "All" ? "All Products" : "Products") : cat].filter(Boolean).join(" · ")}</b> <span>({list.length} items)</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="rec">Sort: Recommended</option><option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option><option value="disc">Better Discount</option><option value="rate">Customer Rating</option>
              </select></div>
            <div className="grid">{list.map((p) => <Card key={p.id} p={p} liked={wish.includes(p.id)} onWish={toggleWish} onOpen={open} />)}</div>
            {loading && <p className="empty">Loading products…</p>}
            {!loading && !list.length && <p className="empty">No products match your filters.</p>}
          </section>
        </div>
      </main>)}

      {view === "wish" && (<main className="page"><h2>My Wishlist <span>{wish.length} items</span></h2>
        {wish.length ? <div className="grid w5">{products.filter((p) => wish.includes(p.id)).map((p) => (
          <Card key={p.id} p={p} liked onWish={toggleWish} onOpen={open} />))}</div>
          : <p className="empty">Your wishlist is empty. Tap the heart on items you love.</p>}</main>)}

      {view === "bag" && (<main className="page">
        {!lines.length ? <p className="empty">Your bag is empty.<br /><button className="btn" onClick={() => go("home")}>CONTINUE SHOPPING</button></p> : (
          <div className="two"><div>{lines.map((l, i) => (
            <div className="line" key={i}><img src={l.p.image} alt="" />
              <div><b>{l.p.brand}</b><p>{l.p.name}</p><small>Size: {l.size}</small>
                <div className="qty"><button onClick={() => qty(i, -1)}>−</button><span>{l.qty}</span><button onClick={() => qty(i, 1)}>+</button></div>
                <b>{money(l.p.price * l.qty)}</b> <s>{money(l.p.old * l.qty)}</s></div>
              <button className="x" aria-label="Remove" onClick={() => qty(i, -99)}><Trash2 size={17} /></button></div>))}</div>
            <aside className="summary">
              <h5>COUPONS</h5>
              <div className="cp"><input placeholder="Enter code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /><button onClick={applyCode}>APPLY</button></div>
              {msg && <small className={coupon ? "ok" : "bad"}>{msg}</small>}
              <div className="chips">{Object.keys(COUPONS).map((k) => <button key={k} title={COUPONS[k][1]} onClick={() => setCode(k)}>{k}</button>)}</div>
              <h5>PRICE DETAILS ({count} items)</h5>
              <p><span>Total MRP</span><span>{money(mrp)}</span></p>
              <p><span>Discount on MRP</span><span className="ok">−{money(mrp - subtotal)}</span></p>
              {disc > 0 && <p><span>Coupon ({coupon})</span><span className="ok">−{money(disc)}</span></p>}
              <p><span>Delivery</span><span>{ship ? money(ship) : "FREE"}</span></p>
              <p className="tot"><span>Total Amount</span><span>{money(total)}</span></p>
              <button className="btn" onClick={() => go("checkout")}>PLACE ORDER</button></aside></div>)}</main>)}

      {view === "checkout" && (<main className="page"><form className="two" onSubmit={place}>
        <div className="form"><h3>Delivery Address</h3>
          <input required placeholder="Full name" value={addr.name} onChange={set("name")} />
          <input required pattern="[0-9]{10}" placeholder="Mobile (10 digits)" value={addr.phone} onChange={set("phone")} />
          <input required pattern="[0-9]{6}" placeholder="Pincode (6 digits)" value={addr.pin} onChange={set("pin")} />
          <input required placeholder="Address" value={addr.address} onChange={set("address")} />
          <h3>Payment</h3>{["COD", "UPI", "Card"].map((m) => (
            <label key={m}><input type="radio" checked={addr.pay === m} onChange={() => setAddr({ ...addr, pay: m })} /> {m === "COD" ? "Cash on Delivery" : m}</label>))}
          <small>Demo checkout — no payment is collected.</small></div>
        <aside className="summary"><h5>ORDER SUMMARY</h5>
          {lines.map((l, i) => <p key={i}><span>{l.p.name} ×{l.qty}</span><span>{money(l.p.price * l.qty)}</span></p>)}
          <p className="tot"><span>Total</span><span>{money(total)}</span></p>
          <button className="btn" disabled={!lines.length}>CONFIRM ORDER</button></aside></form></main>)}

      {view === "done" && placed && (<main className="page center"><div className="tick"><Check size={34} /></div>
        <h2>Order placed!</h2><p>Order ID <b>{placed.id}</b> · {money(placed.total)} · {placed.pay}</p>
        <button className="btn" onClick={() => go("orders")}>VIEW ORDERS</button></main>)}

      {view === "orders" && (<main className="page"><h2>My Orders</h2>
        {!user ? <p className="empty">Login to see your orders.<br /><button className="btn" onClick={() => openAuth("login")}>LOGIN</button></p> : !myOrders.length ? <p className="empty">No orders yet.</p> : myOrders.map((o) => (
          <div className="order" key={o.id}><div><b>{o.id}</b> <span className="ok">● {o.status}</span><small> {o.date} · {o.pay}</small></div>
            <div className="thumbs">{o.lines.map((l, i) => <img key={i} src={l.p.image} alt={l.p.name} title={l.p.name} />)}</div>
            <b>{money(o.total)}</b></div>))}</main>)}

      {detail && (<div className="modal" onClick={() => setDetail(null)}><div className="pd" onClick={(e) => e.stopPropagation()}>
        <button className="x" aria-label="Close" onClick={() => setDetail(null)}><X size={20} /></button>
        <img src={detail.image} alt={detail.name} />
        <div><h3>{detail.brand}</h3><p>{detail.name}</p>
          <p className="rate2"><b>{detail.rating}</b> <Star size={12} fill="#14958f" stroke="none" /> | {detail.cat}</p>
          <p><b className="big">{money(detail.price)}</b> <s>{money(detail.old)}</s> <em>({off(detail)}% OFF)</em></p>
          <h5>SELECT SIZE</h5><div className="sizes">{detail.sizes.map((s) => (
            <button key={s} className={size === s ? "sel" : ""} onClick={() => setSize(s)}>{s}</button>))}</div>
          <div className="acts"><button className="btn" onClick={() => add(detail, size)}><ShoppingBag size={16} /> ADD TO BAG</button>
            <button className="btn ghost" onClick={() => toggleWish(detail.id)}><Heart size={16} fill={wish.includes(detail.id) ? "#ff3f6c" : "none"} /> WISHLIST</button></div></div></div></div>)}
      {authOpen && (<div className="modal" onClick={() => setAuthOpen(false)}><form className="auth" onClick={(e) => e.stopPropagation()} onSubmit={step === "email" ? sendOtp : verifyOtp}>
        <button type="button" className="x" aria-label="Close" onClick={() => { setAuthOpen(false); setNext(null); }}><X size={20} /></button>
        <div className="logo">smart<b>save</b></div>
        <h3>{mode === "login" ? "Login" : "Create account"}</h3>
        <p className="sub">{next ? "Login or sign up to proceed with checkout" : "Get exclusive offers and track your orders"}</p>
        {step === "email" ? (<>
          {mode === "signup" && <input required placeholder="Full name" value={af.name} onChange={setA("name")} />}
          <input required type="email" placeholder="Email" value={af.email} onChange={setA("email")} />
          {aerr && <small className="bad">{aerr}</small>}
          <button className="btn" disabled={busy}>{busy ? "SENDING…" : "SEND OTP"}</button>
          {GID ? (<><p className="sub">or</p><div id="gbtn" className="gbtn" /></>) : <small className="sub">Google login: set VITE_GOOGLE_CLIENT_ID to enable.</small>}
        </>) : (<>
          <p className="sub">Enter the 6-digit code sent to <b>{af.email}</b></p>
          <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="------" className="otp" value={af.otp} onChange={setA("otp")} autoFocus />
          {aerr && <small className="bad">{aerr}</small>}
          <button className="btn" disabled={busy}>{busy ? "VERIFYING…" : mode === "login" ? "VERIFY & LOGIN" : "VERIFY & CREATE ACCOUNT"}</button>
          <a className="lnk skip" onClick={() => { setStep("email"); setAerr(""); }}>Change email / resend</a>
        </>)}
        <p className="sub">{mode === "login" ? "New here? " : "Already have an account? "}
          <a className="lnk" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setStep("email"); setAerr(""); }}>{mode === "login" ? "Create an account" : "Login"}</a></p>
        <a className="lnk skip" onClick={() => { setAuthOpen(false); setNext(null); }}>Skip for now</a>
      </form></div>)}
      {toast && <div className="toast">{toast}</div>}
      <footer className="ftr">© 2026 SmartSave — demo store · orders are stored in your browser</footer>
    </div>
  );
}
