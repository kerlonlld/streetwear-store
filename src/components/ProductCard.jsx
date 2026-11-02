import React, { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductCard({ product, onAdd }) {
  const [size, setSize] = useState(product.sizes[1] || product.sizes[0]);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(product, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="product-card reveal-up">
      <div className={`product-image ${product.tone}`}>
        {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="image-placeholder"><span>ME</span><small>Imagem no painel admin</small></div>}
        {product.promo && <span className="promo-badge">Oferta</span>}
        <span className="product-index">0{product.id === 'wolf-tee' || product.id === 'hemparia-shirt' ? 1 : product.id === 'pink-hoodie' || product.id === 'hemparia-jacket' ? 2 : 3}</span>
      </div>
      <div className="product-info">
        <div className="product-heading">
          <div>
            <span className="eyebrow">{product.category}</span>
            <h3>{product.name}</h3>
          </div>
          <span className="product-price">{money(product.price)}</span>
        </div>
        {product.originalPrice && <p className="old-price">De {money(product.originalPrice)}</p>}
        <p className="product-description">{product.description}</p>
        <div className="product-actions">
          <div className="size-picker" aria-label={`Tamanho para ${product.name}`}>
            {product.sizes.map((itemSize) => (
              <button className={size === itemSize ? 'selected' : ''} key={itemSize} onClick={() => setSize(itemSize)}>{itemSize}</button>
            ))}
          </div>
          <button className={`buy-button ${added ? 'added' : ''}`} onClick={handleAdd} aria-label={`Comprar ${product.name}`}>
            {added ? <><Check size={16} /> Adicionado</> : <><ShoppingBag size={16} /> Comprar agora</>}
          </button>
        </div>
      </div>
    </article>
  );
}
