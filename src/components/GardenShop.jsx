import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Check, Flower2, Heart, Leaf, PackageCheck, Pause, Play, Plus, Search, Sprout, Sun, X } from 'lucide-react';
import ProductArt from './ProductArt';
import { normalizeName } from '../lib/productVisual';
import '../garden.css';

const categories = [
  { name: 'Tất cả', icon: Flower2 },
  { name: 'Cây lớn', icon: Sprout },
  { name: 'Cây leo', icon: Leaf },
  { name: 'Sen đá', icon: Sun },
  { name: 'Chậu & phụ kiện', icon: Heart },
];
const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

function GardenScene() {
  return <div className="garden-scene" role="img" aria-label="Khu vườn minh họa với cây trầu bà, xương rồng và sen đá dưới ánh nắng">
    <div className="scene-grid" />
    <div className="happy-sun"><div className="sun-face"><i /><i /><b /></div><span /></div>
    <div className="cloud cloud-one" /><div className="cloud cloud-two" />
    <div className="scene-hill hill-back" /><div className="scene-hill hill-front" />
    <div className="scene-flower flower-one">✿</div><div className="scene-flower flower-two">✿</div>
    <div className="scene-butterfly"><i /><i /><b /></div>
    <span className="scene-spark spark-one">✦</span><span className="scene-spark spark-two">✧</span>
    <div className="scene-plant scene-cactus"><ProductArt product={{ name: 'Xương rồng' }} smile /></div>
    <div className="scene-plant scene-monstera"><ProductArt product={{ name: 'Trầu bà' }} smile /></div>
    <div className="scene-plant scene-succulent"><ProductArt product={{ name: 'Sen đá' }} smile /></div>
    <div className="scene-label"><span>xin chào, người bạn mới!</span><Heart size={15} fill="currentColor" /></div>
    <div className="scene-stamp"><Sprout size={22} /><span>MỘT CHÚT XANH<br />MỘT CHÚT VUI</span></div>
    <span className="scene-ground-note">a little garden, a lot of love.</span>
  </div>;
}

function GardenProduct({ product, index, onAdd }) {
  const stock = Number(product.stock) || 0;
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  function add() {
    const accepted = onAdd(product.id);
    if (accepted === false) return;
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1600);
  }
  return <article className={`garden-product garden-tone-${index % 4}`} data-reveal style={{ '--delay': `${index % 3 * 90}ms` }}>
    <div className="garden-product-visual">
      <span className="product-category-label">{product.category}</span>
      <span className="product-art-spark" aria-hidden="true">✧</span>
      <div className="product-art-disc" />
      <ProductArt product={product} />
      <span className="illustration-note">hình minh họa</span>
    </div>
    <div className="garden-product-info">
      <div className="product-stock"><span className={stock > 0 ? '' : 'sold-out'} />{stock > 0 ? `Còn ${stock} sản phẩm` : 'Tạm hết hàng'}</div>
      <h3>{product.name}</h3>
      <p>{product.desc || product.description || 'Một món nhỏ cho không gian thêm xanh và ngày thêm vui.'}</p>
      <div className="garden-product-bottom"><strong>{money(product.price)}</strong><button onClick={add} disabled={stock <= 0} className={added ? 'just-added' : ''} aria-label={`Thêm ${product.name} vào giỏ`}>
        {added ? <><Check size={17} /><span>Đã thêm</span></> : <><Plus size={17} /><span>Thêm vào giỏ</span></>}
      </button></div>
    </div>
  </article>;
}

export default function GardenShop({ products, allCount, search, setSearch, category, setCategory, onAdd }) {
  const root = useRef(null);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('garden-motion') === 'paused' || window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  });
  useEffect(() => {
    if (!root.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    root.current.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [products]);
  function toggleMotion() {
    const next = !paused;
    setPaused(next);
    try { localStorage.setItem('garden-motion', next ? 'paused' : 'playing'); } catch { /* Motion still works when storage is unavailable. */ }
  }
  function clearFilters() { setSearch(''); setCategory('Tất cả'); }
  return <main ref={root} className={`garden-shop ${paused ? 'motion-paused' : ''}`}>
    <section className="garden-hero">
      <div className="garden-hero-copy">
        <span className="garden-eyebrow"><span className="live-dot" /> MỘT CHÚT XANH CHO NGÀY THÊM VUI</span>
        <h1>Góc nhỏ <span className="title-flower" aria-hidden="true">✿</span><br /><em>an yên,</em><br />có bạn và cây.</h1>
        <p>Mang thiên nhiên về gần hơn một chút. Một chiếc lá mới, một chậu cây xinh — những niềm vui bé tí làm nên một ngày thật dịu dàng.</p>
        <div className="garden-hero-actions"><a href="#catalog" className="garden-primary">Đi dạo trong vườn <ArrowRight size={19} /></a><a href="#garden-note" className="garden-secondary">Chuyện của vườn <ArrowDown size={16} /></a></div>
        <div className="garden-hero-footnote"><span className="tiny-plant"><Sprout size={23} /></span><span><b>{allCount} lựa chọn nhỏ xinh</b><small>Đang chờ cùng bạn lớn lên mỗi ngày.</small></span><span className="handdrawn-arrow" aria-hidden="true">⤴</span></div>
      </div>
      <div className="garden-hero-art"><GardenScene /><div className="hero-art-footer"><span><Heart size={13} /> Chăm chút từ những điều nhỏ nhất</span><button className="motion-control" aria-pressed={paused} onClick={toggleMotion} title="Bật hoặc tạm dừng chuyển động trang cửa hàng">{paused ? <Play size={13} /> : <Pause size={13} />}{paused ? 'Bật chuyển động' : 'Tạm dừng chuyển động'}</button></div></div>
    </section>

    <div className="garden-ribbon" aria-label="Chậm một chút, xanh một chút, vui nhiều chút"><div className="ribbon-track">{[0, 1].map((copy) => <div className="ribbon-copy" key={copy} aria-hidden="true">{['Chậm một chút', 'Xanh một chút', 'Vui nhiều chút', 'Lớn lên cùng nhau'].map((text) => <span key={text}><Flower2 size={20} />{text}</span>)}</div>)}</div></div>

    <section className="garden-catalog" id="catalog">
      <div className="garden-section-heading" data-reveal><div><span className="garden-eyebrow">NHỮNG NGƯỜI BẠN CỦA VƯỜN</span><h2>Chọn một chút <em>xanh.</em><Leaf size={30} /></h2></div><p>Cây xinh, chậu nhỏ và những món đáng yêu.<br />Góc nào cũng có một người bạn vừa vặn.</p></div>
      <div className="garden-filters"><div className="garden-categories" role="group" aria-label="Lọc theo danh mục">{categories.map(({ name, icon: Icon }) => <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)} className={category === name ? 'active' : ''}><Icon size={17} />{name}</button>)}</div><label className="garden-search"><Search size={18} /><input aria-label="Tìm sản phẩm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Bạn đang tìm cây gì?" />{search && <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm"><X size={16} /></button>}</label></div>
      <div className="catalog-result-count" aria-live="polite"><span>{products.length} người bạn nhỏ{category !== 'Tất cả' ? ` · ${category}` : ''}</span><span><Sprout size={14} /> Chọn bằng mắt, yêu bằng tim</span></div>
      {products.length ? <div className="garden-products" key={`${category}-${normalizeName(search)}`}>{products.map((product, index) => <GardenProduct key={product.id} product={product} index={index} onAdd={onAdd} />)}</div> : <div className="garden-empty"><Search size={34} /><h3>Người bạn này đang trốn đâu rồi?</h3><p>Thử tên khác hoặc ghé lại tất cả danh mục nhé.</p><button className="garden-primary" onClick={clearFilters}>Xem cả khu vườn <ArrowRight size={17} /></button></div>}
    </section>

    <section className="garden-note" id="garden-note" data-reveal><div className="note-illustration" aria-hidden="true"><ProductArt product={{ name: 'Hoa cúc' }} smile /><span>hello, sunshine!</span></div><div className="note-copy"><span className="garden-eyebrow">MỘT LỜI NHẮN TỪ VƯỜN NHỎ</span><h2>Không cần một khu vườn lớn.<br /><em>Chỉ cần một chút yêu thương.</em></h2><p>Đôi khi, chăm một cái cây cũng là cách mình chăm lại bản thân. Dành một góc nhỏ cho màu xanh, một phút mỗi sáng để ngắm lá — bình yên bắt đầu từ những điều như thế.</p><a href="#catalog">Tìm người bạn đầu tiên <ArrowRight size={17} /></a></div><span className="note-daisy" aria-hidden="true">✿</span></section>
    <section className="garden-values" aria-label="Tinh thần Vườn Nhỏ">{[{ icon: Sprout, title: 'Một chút thiên nhiên', text: 'Cho không gian thêm sức sống.' }, { icon: PackageCheck, title: 'Một chút chăm chút', text: 'Từ chậu cây đến từng chiếc lá.' }, { icon: Heart, title: 'Thật nhiều yêu thương', text: 'Cùng bạn nuôi những niềm vui nhỏ.' }].map(({ icon: Icon, title, text }) => <div key={title} data-reveal><span><Icon size={25} /></span><h3>{title}</h3><p>{text}</p></div>)}</section>
    <footer className="garden-footer"><div><Sprout size={24} /><strong>Vườn Nhỏ</strong><span>Gieo xanh. Gặt bình yên.</span></div><span>Được chăm chút bởi Yến Duy <Heart size={13} /></span><a href="#top">Về đầu vườn ↑</a></footer>
  </main>;
}
