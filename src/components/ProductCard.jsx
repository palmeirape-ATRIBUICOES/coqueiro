import React, { useState } from 'react';

export default function ProductCard({ p, company, addToCart, updateCartQty, cart, isMobile }) {
  // If product has a wholesale option, default to it, otherwise unit
  const hasAtacado = p.packagePrice && p.packageItems && p.packageItems > 1;
  const [variant, setVariant] = useState(hasAtacado ? 'atacado' : 'unit');

  // Find this specific variant in cart
  const cartItemId = `${p.id}-${variant}`;
  const cartItem = cart.find(item => item.cartItemId === cartItemId);
  const qty = cartItem ? cartItem.qty : 0;

  const currentPrice = variant === 'atacado' ? p.packagePrice : p.price;
  const currentUnit = variant === 'atacado' ? `Cx c/ ${p.packageItems}` : (p.unit || 'Unidade');

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
            <div className="flex items-center bg-gray-100 rounded-xl p-0.5 h-9">
              <button 
                onClick={() => handleUpdate(-1)}
                className="border-none bg-transparent w-6 h-full cursor-pointer text-gray-600 font-extrabold text-sm"
              >-</button>
              <span className="text-xs font-extrabold text-gray-900 min-w-[16px] text-center">{qty}</span>
              <button 
                onClick={() => handleUpdate(1)}
                className="border-none bg-transparent w-6 h-full cursor-pointer text-gray-600 font-extrabold text-sm"
              >+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
