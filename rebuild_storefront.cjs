"use strict";
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Storefront.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Mobile Delivery Badge
content = content.replace(/\{\/\* Delivery Address Condensed \*\/\}.*?title=\{merchant\.address\}\s*>\s*<span>📍<\/span>\s*<span>\{merchant\.address \? merchant\.address\.split\(\',\/\)\[1\]\?\.trim\(\) \|\| merchant\.address : \'Entrega\'\}<\/span>\s*<\/div>/s, '');

// 2. Remove Desktop Delivery Badge
content = content.replace(/\{\/\* Delivery address badge \*\/\}.*?Entregar em: \{merchant\.address \|\| \'Endereço não cadastrado\'\}\s*<\/span>\s*<\/div>/s, '');

// 3. Rewrite Categories for Mobile
const mobileCatsOld = /\/\* Mobile categories: circular scrollable list \*\/.*?\)\;\s*\}\)\}\s*<\/div>/s;
const mobileCatsNew = `/* Mobile categories: text pills */
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}>
                  {categories.map(cat => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          borderRadius: '4px',
                          padding: '8px 16px',
                          whiteSpace: 'nowrap',
                          fontWeight: 600,
                          fontSize: '13px',
                          backgroundColor: isActive ? '#f1f5f9' : '#ffffff',
                          color: isActive ? '#0f172a' : '#64748b',
                          border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                          borderBottom: isActive ? \`2px solid \${company.primaryColor}\` : '1px solid transparent',
                          cursor: 'pointer'
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>`;
content = content.replace(mobileCatsOld, mobileCatsNew);

// Rewrite Desktop Categories
const desktopCatsOld = /\/\* Desktop categories: pills \*\/.*?\)\}\s*<\/div>/s;
const desktopCatsNew = `/* Desktop categories: pills */
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '8px'
                }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        borderRadius: '4px',
                        padding: '8px 16px',
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        fontSize: '14px',
                        backgroundColor: activeCategory === cat ? '#f1f5f9' : '#ffffff',
                        color: activeCategory === cat ? '#0f172a' : '#64748b',
                        border: activeCategory === cat ? '1px solid #cbd5e1' : '1px solid transparent',
                        borderBottom: activeCategory === cat ? \`2px solid \${company.primaryColor}\` : '1px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>`;
content = content.replace(desktopCatsOld, desktopCatsNew);

// 4. Rewrite Product Cards
const productCardOld = /<div key=\{p\.id\} className="card" style=\{\{(?!.*<div key=\{p\.id\} className="card" style=\{\{).*?(?=<\/div>\s*\);\s*\}\)\}\s*<\/div>)/s;

const productCardNew = `<div key={p.id} className="card" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        textAlign: 'left',
                        boxShadow: 'none',
                        position: 'relative',
                        height: '100%',
                        overflow: 'hidden'
                      }}>
                        {/* Discount Tag */}
                        {p.packageItems && p.packageItems > 1 && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            zIndex: 2
                          }}>
                            Atacado
                          </div>
                        )}

                        <div style={{ padding: isMobile ? '8px' : '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Image */}
                          <div style={{
                            height: isMobile ? '120px' : '150px',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px',
                            width: '100%'
                          }}>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.description} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Sem Foto</span>
                            )}
                          </div>

                          {/* Brand */}
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                            {p.brand}
                          </span>
                          
                          {/* Description */}
                          <h4 style={{
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: 600,
                            color: '#0f172a',
                            lineHeight: '1.4',
                            marginTop: '0',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            flex: 1
                          }}>
                            {p.description}
                          </h4>
                          
                          {/* Packaging info */}
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', fontWeight: 500 }}>
                            {p.unit ? p.unit : 'Unidade'}
                          </div>

                          {/* Pricing details - Inverted Hierarchy for B2B */}
                          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                            {p.packagePrice && p.packageItems && p.packageItems > 1 ? (
                              <>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                  R$ {p.price.toFixed(2)}/un
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                  <span style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 800, color: '#0f172a' }}>
                                    R$ {p.packagePrice.toFixed(2)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Preço final</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                  <span style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 800, color: '#0f172a' }}>
                                    R$ {p.price.toFixed(2)}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Full width Cart Actions attached to bottom */}
                        <div style={{ width: '100%', borderTop: '1px solid #e2e8f0' }}>
                          {qty === 0 ? (
                            <button
                              onClick={() => addToCart(p)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: company.primaryColor,
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                backgroundColor: '#f8fafc',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#f8fafc'}
                            >
                              Adicionar
                            </button>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: company.primaryColor,
                              color: 'white',
                              height: '38px',
                              width: '100%'
                            }}>
                              <button 
                                onClick={() => updateCartQty(p.id, -1)}
                                style={{ border: 'none', background: 'none', flex: 1, height: '100%', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '16px' }}
                              >-</button>
                              <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>{qty}</span>
                              <button 
                                onClick={() => updateCartQty(p.id, 1)}
                                style={{ border: 'none', background: 'none', flex: 1, height: '100%', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '16px' }}
                              >+</button>
                            </div>
                          )}
                        </div>
                      </div>`;
content = content.replace(productCardOld, productCardNew);

// Remove "Retirada presencial" from orders tracking
content = content.replace(/<span style=\{\{ fontSize: '11px', color: 'var\(--text-light\)' \}\}>\s*Retirada presencial na loja: <strong>\{company\.address\}<\/strong>\s*<\/span>/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Storefront.jsx updated successfully.');
