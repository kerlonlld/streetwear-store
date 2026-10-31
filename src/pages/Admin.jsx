import React, { useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Plus, Save, Tag, Trash2, Upload } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { isFirebaseConfigured, storage } from '../services/firebase';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const empty = { name: '', description: '', price: '', category: 'Camisetas', promo: false };

export default function Admin({ user }) {
  const { products, setProducts } = useStore();
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (id, changes) => setProducts((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item));
  const addProduct = async (event) => {
    event.preventDefault();
    if (!imageFile) { setNotice('Escolha uma imagem para continuar.'); return; }
    setBusy(true);
    try {
      if (!isFirebaseConfigured || !storage) throw new Error('Firebase Storage não está configurado.');
      const imageRef = ref(storage, `product-images/${Date.now()}-${imageFile.name}`);
      await uploadBytes(imageRef, imageFile, { contentType: imageFile.type });
      const image = await getDownloadURL(imageRef);
      const product = { ...form, image, id: `custom-${Date.now()}`, price: Number(form.price), sizes: ['P', 'M', 'G', 'GG'], tone: 'black' };
      setProducts((items) => [...items, product]);
      setForm(empty); setImageFile(null); event.target.reset(); setNotice('Produto adicionado com imagem no Firebase.');
    } catch (error) { setNotice(error.message || 'Não foi possível enviar a imagem.'); }
    finally { setBusy(false); }
  };
  const uploadProductImage = async (product, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (!isFirebaseConfigured || !storage) throw new Error('Firebase Storage não está configurado.');
      const imageRef = ref(storage, `product-images/${product.id}-${Date.now()}-${file.name}`);
      await uploadBytes(imageRef, file, { contentType: file.type });
      update(product.id, { image: await getDownloadURL(imageRef) });
      setNotice(`Imagem de ${product.name} atualizada.`);
    } catch (error) { setNotice(error.message || 'Não foi possível enviar a imagem.'); }
    finally { setBusy(false); event.target.value = ''; }
  };
  const savePrice = (product) => { update(product.id, { price: Number(product.value) }); setEditing(null); setNotice('Preço atualizado.'); };
  return <main className="admin-page"><div className="admin-top"><div><span className="eyebrow">Painel interno</span><h1>Controle do<br /><i>movimento.</i></h1><p>Olá, {user.email}. Gerencie o drop sem perder o foco.</p></div><a className="secondary-button" href="/">Ver loja</a></div>{notice && <div className="notice">{notice}</div>}<section className="admin-layout"><div className="admin-products"><div className="admin-section-title"><h2>Produtos <span>{products.length}</span></h2><span>Catálogo ativo</span></div>{products.map((product) => <div className="admin-product" key={product.id}><img src={product.image} alt="" /><div className="admin-product-name"><strong>{product.name}</strong><span>{product.category}</span></div><div className="admin-price">{editing?.id === product.id ? <input data-edit={product.id} autoFocus type="number" defaultValue={product.price} onKeyDown={(e) => e.key === 'Enter' && savePrice({ ...product, value: e.currentTarget.value })} /> : <strong>{money(product.price)}</strong>}</div><button className={`tag-button ${product.promo ? 'active' : ''}`} onClick={() => update(product.id, { promo: !product.promo })}><Tag size={15} /> Oferta</button>{editing?.id === product.id ? <button className="save-icon" onClick={() => savePrice({ ...product, value: document.querySelector(`[data-edit="${product.id}"]`)?.value || product.price })}><Save size={16} /></button> : <button className="save-icon" onClick={() => setEditing({ id: product.id, value: product.price })}><span>R$</span></button>}<button className="delete-icon" onClick={() => setProducts((items) => items.filter((item) => item.id !== product.id))}><Trash2 size={16} /></button></div>)}</div><form className="new-product" onSubmit={addProduct}><div className="admin-section-title"><h2><Plus size={18} /> Novo produto</h2></div><label>Nome<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Descrição<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="input-grid"><label>Preço<input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label>Categoria<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Camisetas</option><option>Moletons</option><option>Acessórios</option></select></label></div><label className="file-field"><span><Upload size={15} /> Imagem do produto</span><input required type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />{imageFile && <small>{imageFile.name}</small>}</label><label className="check-label"><input type="checkbox" checked={form.promo} onChange={(e) => setForm({ ...form, promo: e.target.checked })} /> Marcar como oferta</label><button className="primary-button full" disabled={busy}>{busy ? 'Enviando imagem...' : 'Adicionar produto'} <Plus size={17} /></button></form></section></main>;
}
