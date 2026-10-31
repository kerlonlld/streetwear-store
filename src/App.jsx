import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { auth, db, googleProvider, isFirebaseConfigured } from './services/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import ProductCard from './components/ProductCard';
import Admin from './pages/Admin';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Header({ user, onLogout, onCheckout }) {
  const { cartCount } = useStore();
  return <>
    <header className="site-header">
      <Link to="/" className="brand"><span>ME</span><strong>MENTE EM<br />EXPANSÃO</strong></Link>
      <nav><a href="#drop">Drop 01</a><a href="#manifesto">Manifesto</a></nav>
      <div className="header-tools">
        {user ? <button className="user-chip" onClick={onLogout}>{user.email?.split('@')[0]} / sair</button> : <Link to="/login" className="login-link">Entrar</Link>}
        <button className="cart-trigger" onClick={onCheckout} aria-label="Ir para checkout"><ShoppingBag size={19} /><b>{cartCount}</b></button>
      </div>
    </header>
  </>;
}

function CartDrawer({ onClose }) {
  const { cart, subtotal, updateQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();
  return <div className="drawer-backdrop" onClick={onClose}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
    <div className="drawer-head"><div><span className="eyebrow">Seu movimento</span><h2>Carrinho <em>({cart.length})</em></h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar carrinho"><X /></button></div>
    <div className="cart-items">{cart.length ? cart.map((item) => <div className="cart-item" key={`${item.id}-${item.size}`}><img src={item.image} alt="" /><div className="cart-item-main"><strong>{item.name}</strong><span>Tamanho {item.size}</span><div className="quantity"><button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}><Minus size={13} /></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}><Plus size={13} /></button></div></div><div className="cart-item-side"><strong>{money(item.price * item.quantity)}</strong><button onClick={() => removeFromCart(item.id, item.size)} aria-label="Remover item"><Trash2 size={15} /></button></div></div>) : <div className="empty-state"><span className="empty-mark">∅</span><p>Seu carrinho ainda está vazio.</p><button className="text-link" onClick={onClose}>Explorar o drop <ArrowRight size={16} /></button></div>}</div>
    {cart.length > 0 && <div className="drawer-footer"><div className="total-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Frete calculado no checkout.</p><button className="primary-button full" onClick={() => { onClose(); navigate('/checkout'); }}>Ir para checkout <ArrowRight size={17} /></button></div>}
  </aside></div>;
}

function Home({ onBuy }) {
  const { products } = useStore();
  return <main><section className="hero" id="manifesto"><div className="hero-copy reveal-up"><span className="eyebrow">Drop 01 / 2026</span><h1>Vista o que<br /><i>expande.</i></h1><p>Streetwear para mentes inquietas. Peças que carregam sua presença antes mesmo de você falar.</p><a className="primary-button" href="#drop">Explorar peças <ArrowRight size={17} /></a></div><div className="hero-art"><div className="hero-circle"></div><span className="hero-word">EXPANSÃO</span><span className="hero-vertical">NÃO EXISTE LIMITE</span><div className="hero-scribble">Mente<br />livre.</div></div><div className="hero-footer"><span>Scroll para descobrir</span><span>↓</span><span>01 — 03</span></div></section><section className="drop-section" id="drop"><div className="section-heading"><div><span className="eyebrow">A seleção</span><h2>Drop 01<span>.</span></h2></div><p>Três peças. Uma ideia.<br />A sua expansão começa aqui.</p></div><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={onBuy} />)}</div></section><section className="statement"><span>ME</span><h2>O corpo é<br /><i>território.</i></h2><p>Feito para quem transforma pensamento em movimento.</p></section></main>;
}

function Login({ onLogin }) {
  const navigate = useNavigate(); const [mode, setMode] = useState('login'); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { if (!isFirebaseConfigured) throw new Error('Configure o Firebase no arquivo .env para entrar.'); const result = mode === 'login' ? await signInWithEmailAndPassword(auth, email, password) : await createUserWithEmailAndPassword(auth, email, password); onLogin(result.user); navigate('/'); } catch (err) { setError(err.message || 'Não foi possível continuar.'); } finally { setBusy(false); } };
  return <main className="auth-page"><div className="auth-panel"><Link to="/" className="brand"><span>ME</span><strong>MENTE EM<br />EXPANSÃO</strong></Link><span className="eyebrow">Área de acesso</span><h1>{mode === 'login' ? 'Entre no seu movimento.' : 'Faça parte da expansão.'}</h1><p>{mode === 'login' ? 'Acompanhe seus pedidos e mantenha seu drop por perto.' : 'Crie sua conta e vista ideias que não ficam paradas.'}</p><form onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button full" disabled={busy}>{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'} <ArrowRight size={17} /></button></form>{isFirebaseConfigured && <button className="google-button" onClick={async () => { const result = await signInWithPopup(auth, googleProvider); onLogin(result.user); navigate('/'); }}>Continuar com Google</button>}<button className="switch-auth" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}</button></div><div className="auth-image"><span>EXPANDA<br />O CAMPO.</span></div></main>;
}

function Checkout({ user }) {
  const { cart, subtotal, removeFromCart } = useStore(); const navigate = useNavigate(); const [done, setDone] = useState(false); const [loading, setLoading] = useState(false); const [form, setForm] = useState({ cep: '', street: '', number: '', neighborhood: '', city: '', state: '' });
  const submit = async (event) => { event.preventDefault(); setLoading(true); const order = { userId: user?.uid || 'guest', customerEmail: user?.email || 'guest', items: cart, address: form, subtotal, createdAt: serverTimestamp() }; try { if (isFirebaseConfigured && db) await addDoc(collection(db, 'orders'), order); else localStorage.setItem(`me-order-${Date.now()}`, JSON.stringify({ ...order, createdAt: new Date().toISOString() })); setDone(true); } finally { setLoading(false); } };
  if (done) return <main className="success-page"><span className="success-mark">✓</span><span className="eyebrow">Pedido confirmado</span><h1>Seu movimento<br /><i>está a caminho.</i></h1><p>Recebemos seu pedido. Obrigado por expandir com a gente.</p><button className="primary-button" onClick={() => navigate('/')}>Voltar à loja <ArrowRight size={17} /></button></main>;
  return <main className="checkout-page"><div className="checkout-content"><Link to="/" className="back-link">← Voltar à loja</Link><span className="eyebrow">Finalizar pedido</span><h1>Leve a ideia<br /><i>com você.</i></h1><form className="address-form" onSubmit={submit}><h2>Endereço de entrega</h2><div className="input-grid"><label>CEP<input required value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} /></label><label>Estado<input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label></div><label>Rua<input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} /></label><div className="input-grid"><label>Número<input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></label><label>Bairro<input required value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></label></div><label>Cidade<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label><button className="primary-button" disabled={loading || !cart.length}>{loading ? 'Salvando...' : 'Confirmar pedido'} <ArrowRight size={17} /></button></form></div><aside className="checkout-summary"><span className="eyebrow">Resumo <em>({cart.length})</em></span>{cart.map((item) => <div className="summary-item" key={`${item.id}-${item.size}`}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>{item.size} · {item.quantity}x</span></div><b>{money(item.price * item.quantity)}</b><button onClick={() => removeFromCart(item.id, item.size)} aria-label="Remover"><X size={14} /></button></div>)}<div className="summary-total"><span>Total</span><strong>{money(subtotal)}</strong></div></aside></main>;
}

function AdminGate() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('me-admin-unlocked') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const unlock = (event) => {
    event.preventDefault();
    if (password === (import.meta.env.VITE_ADMIN_PASSWORD || '')) {
      sessionStorage.setItem('me-admin-unlocked', 'true');
      setUnlocked(true);
      return;
    }
    setError('Senha incorreta.');
    setPassword('');
  };
  if (unlocked) return <Admin />;
  return <main className="auth-page"><div className="auth-panel"><Link to="/" className="brand"><span>ME</span><strong>MENTE EM<br />EXPANSÃO</strong></Link><span className="eyebrow">Acesso reservado</span><h1>Painel privado.</h1><p>Digite a senha para gerenciar produtos, preços e imagens.</p><form onSubmit={unlock}><label>Senha<input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button full">Entrar no painel <ArrowRight size={17} /></button></form></div><div className="auth-image"><span>CONTROLE<br />DO DROP.</span></div></main>;
}

function App() { const [user, setUser] = useState(null); const [ready, setReady] = useState(!isFirebaseConfigured); const location = useLocation(); useEffect(() => { if (!auth) return undefined; return onAuthStateChanged(auth, (current) => { setUser(current); setReady(true); }); }, []); if (!ready) return <div className="loading-screen">Carregando...</div>; return <StoreProvider><StoreShell user={user} setUser={setUser} location={location} /></StoreProvider>; }

function StoreShell({ user, setUser, location }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const goToCheckout = () => navigate(user ? '/checkout' : '/login');
  const buyNow = (product, size) => { if (!user) { navigate('/login'); return; } addToCart(product, size); navigate('/checkout'); };

  useEffect(() => {
    const revealGroups = [
      ['.site-header', '.hero-copy', '.hero-art', '.hero-footer', '.section-heading', '.statement', '.auth-panel', '.auth-image', '.checkout-content', '.checkout-summary', '.admin-top', '.admin-layout'],
      ['.product-card'],
    ];
    const elements = revealGroups.flatMap((selectors, groupIndex) => selectors.flatMap((selector) => [...document.querySelectorAll(selector)].map((element) => {
      element.classList.add(groupIndex === 1 ? 'reveal-up' : 'reveal-down');
      return element;
    })));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting)), { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [location.pathname]);

  return <><Header user={user} onLogout={() => { signOut(auth); setUser(null); }} onCheckout={goToCheckout} /><Routes><Route path="/" element={<Home onBuy={buyNow} />} /><Route path="/login" element={<Login onLogin={setUser} />} /><Route path="/checkout" element={user ? <Checkout user={user} /> : <Navigate to="/login" state={{ from: location }} replace />} /><Route path="/admin" element={<AdminGate />} /></Routes></>;
}

export default function AppRoot() { return <App />; }
