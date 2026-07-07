import React, { useState } from 'react';

export default function ProductCard({ p, company, addToCart, updateCartQty, cart, isMobile }) {
  // Force wholesale/retail options on all items (use database package value or generate 12x default box with 5% discount)
  const packageItems = p.packageItems && p.packageItems > 1 ? p.packageItems : 12;
  const packagePrice = p.packagePrice && p.packagePrice > 0 ? p.packagePrice : parseFloat((p.price * packageItems * 0.95).toFixed(2));
  
  const hasAtacado = true;
  const [variant, setVariant] = useState('unit'); // Default to unit (varejo) as requested

  // Find this specific variant in cart
  const cartItemId = `${p.id}-${variant}`;
  const cartItem = cart.find(item => item.cartItemId === cartItemId);
  const qty = cartItem ? cartItem.qty : 0;

  const currentPrice = variant === 'atacado' ? packagePrice : p.price;
  const currentUnit = variant === 'atacado' ? `Cx c/ ${packageItems}` : (p.unit || 'un');

  const handleAdd = () => {
    addToCart(p, variant, currentPrice, currentUnit);
  };

  const handleUpdate = (delta) => {
    updateCartQty(cartItemId, delta);
  };

  const price = currentPrice;
  const isOutOfStock = p.stock <= 0;

  return (
    <div className={`card p-3 flex flex-col justify-between hover:shadow-md transition-shadow relative bg-white border border-gray-100 rounded-3xl ${isOutOfStock ? 'opacity-60' : ''}`}>
      {/* Discount Tag */}
      {hasAtacado && (
        <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full z-10 uppercase tracking-wide">
          Atacado
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Image */}
        <div className="h-32 w-full flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden p-2 relative mb-2.5">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.description} className="max-h-full max-w-full object-contain animate-fade-in" />
          ) : (
            <span className="text-xs text-gray-400 font-bold">Sem Foto</span>
          )}
          {isOutOfStock && (
            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-black uppercase tracking-wider rounded-2xl select-none">Esgotado</span>
          )}
        </div>

        {/* Description / Title */}
        <h4 className="font-extrabold text-gray-900 text-sm line-clamp-2 leading-snug uppercase">
          {p.description}
        </h4>

        {/* Brand/Subtext */}
        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
          {p.brand || 'Sem descrição'}
        </p>

        {/* Stock Badge */}
        <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md mt-1.5 w-fit
          ${p.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {p.stock > 0 ? `Estoque: ${p.stock} un` : 'Esgotado'}
        </span>
        
        {/* Variant Tabs */}
        {hasAtacado ? (
          <div className="flex bg-gray-100 rounded-full p-0.5 my-2.5 w-full">
            <button
              onClick={() => setVariant('atacado')}
              className={`flex-1 border-none py-1 px-2 text-[10px] font-bold rounded-full transition-all cursor-pointer
                ${variant === 'atacado' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500'}`}
            >
              Caixa
            </button>
            <button
              onClick={() => setVariant('unit')}
              className={`flex-1 border-none py-1 px-2 text-[10px] font-bold rounded-full transition-all cursor-pointer
                ${variant === 'unit' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500'}`}
            >
              Unid
            </button>
          </div>
        ) : (
          <div className="text-[10px] text-gray-400 my-2 font-bold">
            {currentUnit}
          </div>
        )}

        {/* Pricing details and actions Row */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-1.5">
          <div className="flex flex-col">
            {variant === 'atacado' && (
              <span className="text-[9px] text-gray-400 font-bold leading-none mb-0.5">
                R$ {Number(p.price || 0).toFixed(2)}/un
              </span>
            )}
            <span className="font-black text-sm" style={{ color: company.primaryColor }}>
              R$ {Number(currentPrice || 0).toFixed(2)}
            </span>
          </div>

          {/* Cart actions */}
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="w-9 h-9 rounded-full font-black text-lg flex items-center justify-center active:scale-90 transition-all shadow-sm text-white cursor-pointer border-none"
              style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : company.primaryColor }}
            >
              +
            </button>
          ) : (
            <div className="flex items-center bg-gray-100 rounded-xl p-1 h-9 gap-1">
              <button 
                onClick={() => handleUpdate(-1)}
                className="border-none bg-transparent w-5 h-full cursor-pointer text-gray-600 font-extrabold text-sm flex items-center justify-center active:scale-95"
              >-</button>
              <input 
                type="number"
                min="0"
                value={qty}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val <= 0) {
                    updateCartQty(cartItemId, -qty);
                  } else {
                    updateCartQty(cartItemId, val - qty);
                  }
                }}
                className="text-xs font-extrabold text-gray-900 bg-transparent border-none text-center outline-none p-0"
                style={{ width: '26px', border: 'none', background: 'transparent', textAlign: 'center' }}
              />
              <button 
                onClick={() => handleUpdate(1)}
                className="border-none bg-transparent w-5 h-full cursor-pointer text-gray-600 font-extrabold text-sm flex items-center justify-center active:scale-95"
              >+</button>
              <button
                onClick={() => updateCartQty(cartItemId, -qty)}
                title="Remover"
                className="border-none bg-transparent text-red-500 hover:text-red-700 cursor-pointer pl-1 pr-1.5 flex items-center justify-center active:scale-90"
                style={{ fontSize: '12px' }}
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
