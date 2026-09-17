import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, BookOpen, Check, Flower2, Heart, Leaf, PackageCheck, Pause, Play, Plus, Search, Sparkles, Sprout, Sun, X } from 'lucide-react';
import ProductArt from './ProductArt';
import { normalizeName } from '../lib/productVisual';
import { getProductStory } from '../lib/plantStories';
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

/**
 * Modal hiển thị chi tiết câu chuyện bé cây khi người dùng bấm vào sản phẩm
 */
function ProductStoryModal({ product, onClose, onAdd }) {
  const story = getProductStory(product);
  const [talking, setTalking] = useState(false);
  const [added, setAdded] = useState(false);
  const stock = Number(product.stock) || 0;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleAdd() {
    onAdd(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  function handlePlantTap() {
    setTalking(true);
    setTimeout(() => setTalking(false), 2500);
  }

  return (
    <div className="modal-layer">
      <button className="drawer-backdrop" onClick={onClose} aria-label="Đóng" />
      <div className="product-modal story-modal-box">
        <div className="modal-heading">
          <div>
            <div className="eyebrow"><span /> Vườn Nhỏ Studio · Chuyện Của Cây</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "var(--deep)", margin: "4px 0 0" }}>
              {product.name}
            </h2>
          </div>
          <button aria-label="Đóng cửa sổ" className="close-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {/* Khối hình ảnh chuyển động có tương tác */}
        <div className="story-modal-visual" onClick={handlePlantTap} title="Chạm vào để trò chuyện cùng bé cây">
          <div className={`story-modal-art ${talking ? 'is-jumping' : ''}`}>
            <ProductArt product={product} smile />
          </div>

          <div className={`story-modal-bubble ${talking ? 'is-talking' : ''}`}>
            <span className="speech-icon">{story.sparkle}</span>
            <span className="speech-text">{talking ? story.reaction : story.voice}</span>
            <span className="speech-tail" />
          </div>

          <span className="story-tap-hint">
            <Sparkles size={12} /> Chạm vào bé để trò chuyện
          </span>
        </div>

        {/* Tính cách & Danh hiệu bé cây */}
        <div className="story-modal-character">
          <span className="char-badge-lg">{story.tag}</span>
          <span className="char-mood-lg">{story.mood}</span>
        </div>

        {/* Chi tiết câu chuyện nhỏ của bé cây */}
        <div className="story-quote-card">
          <div className="story-quote-heading">
            <BookOpen size={13} />
            <span>Chuyện nhỏ của bé cây:</span>
          </div>
          <p className="story-full-text">“{story.story}”</p>
          <div className="story-voice-box">
            <Sparkles size={13} />
            <span><b>Lời nhắn gửi:</b> {story.voice}</span>
          </div>
        </div>

        {/* Chân modal: Giá & Thêm vào giỏ */}
        <div className="story-modal-footer">
          <div className="story-price-wrap">
            <span className="story-price-label">Giá đón bé về:</span>
            <strong className="story-price-val">{money(product.price)}</strong>
          </div>
          <button
            type="button"
            className={`primary-button ${added ? 'just-added' : ''}`}
            onClick={handleAdd}
            disabled={stock <= 0}
            style={{ borderRadius: "30px", padding: "10px 20px" }}
          >
            {added ? <><Check size={17} /> Đã thêm vào giỏ</> : <><Plus size={17} /> Đón bé về nhà</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function GardenProduct({ product, index, onAdd, onOpenStory }) {
  const stock = Number(product.stock) || 0;
  const [added, setAdded] = useState(false);
  const [reacting, setReacting] = useState(false);
  const timer = useRef(null);
  const reactTimer = useRef(null);

  const story = getProductStory(product);

  useEffect(() => () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(reactTimer.current);
  }, []);

  function add(e) {
    e.stopPropagation();
    const accepted = onAdd(product.id);
    if (accepted === false) return;
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1600);
  }

  function handlePlantInteraction(e) {
    e.stopPropagation();
    setReacting(true);
    window.clearTimeout(reactTimer.current);
    reactTimer.current = window.setTimeout(() => setReacting(false), 2600);
  }

  return (
    <article
      className={`garden-product garden-tone-${index % 4} ${reacting ? 'is-interacting' : ''}`}
      data-reveal
      style={{ '--delay': `${index % 3 * 90}ms`, cursor: "pointer" }}
      onClick={() => onOpenStory(product)}
    >
      <div className="garden-product-visual" onClick={handlePlantInteraction} title="Chạm để xem câu chuyện của bé">
        <span className="product-category-label">{product.category}</span>
        <span className="product-art-spark" aria-hidden="true">✧</span>
        <div className="product-art-disc" />

        {/* Bong bóng trò chuyện có chuyển động dễ thương */}
        <div className={`plant-speech-bubble ${reacting ? 'is-speaking-excited' : ''}`} title="Bấm để lắng nghe bé cây">
          <span className="speech-icon">{story.sparkle}</span>
          <span className="speech-text">{reacting ? story.reaction : story.voice}</span>
          <span className="speech-tail" />
        </div>

        {/* Khối minh họa cây có chuyển động nhún nhảy, lắc lư vui vẻ */}
        <div className={`plant-art-wrapper ${reacting ? 'plant-jump' : ''}`}>
          <ProductArt product={product} smile />
        </div>

        <button
          type="button"
          className="tap-talk-hint"
          onClick={(e) => {
            e.stopPropagation();
            onOpenStory(product);
          }}
        >
          <BookOpen size={11} /> Bấm xem chuyện bé
        </button>
      </div>

      <div className="garden-product-info">
        <div className="product-personality-row">
          <span className="product-char-tag">{story.tag}</span>
          <span className="product-mood-tag">{story.mood}</span>
        </div>

        <div className="product-stock">
          <span className={stock > 0 ? '' : 'sold-out'} />
          {stock > 0 ? `Còn ${stock} sản phẩm` : 'Tạm hết hàng'}
        </div>

        <h3 onClick={() => onOpenStory(product)}>{product.name}</h3>

        {/* Nút bấm để mở chi tiết câu chuyện theo yêu cầu */}
        <button
          type="button"
          className="story-open-trigger"
          onClick={(e) => {
            e.stopPropagation();
            onOpenStory(product);
          }}
        >
          <span className="trigger-icon"><BookOpen size={14} /></span>
          <span className="trigger-text">Đọc chuyện bé cây</span>
          <span className="trigger-spark">✿</span>
        </button>

        <div className="garden-product-bottom">
          <strong>{money(product.price)}</strong>
          <button onClick={add} disabled={stock <= 0} className={added ? 'just-added' : ''} aria-label={`Thêm ${product.name} vào giỏ`}>
            {added ? <><Check size={17} /><span>Đã thêm</span></> : <><Plus size={17} /><span>Thêm vào giỏ</span></>}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function GardenShop({ products, allCount, search, setSearch, category, setCategory, onAdd }) {
  const root = useRef(null);
  const [selectedStoryProduct, setSelectedStoryProduct] = useState(null);
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
      {/* Tiêu đề mục catalog: Đã bỏ dòng chữ phụ theo yêu cầu */}
      <div className="garden-section-heading" data-reveal>
        <div>
          <span className="garden-eyebrow">NHỮNG NGƯỜI BẠN CỦA VƯỜN</span>
          <h2>Chọn một chút <em>xanh.</em><Leaf size={30} /></h2>
        </div>
      </div>

      <div className="garden-filters">
        <div className="garden-categories" role="group" aria-label="Lọc theo danh mục">
          {categories.map(({ name, icon: Icon }) => (
            <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)} className={category === name ? 'active' : ''}>
              <Icon size={17} />{name}
            </button>
          ))}
        </div>

        {/* Thanh tìm kiếm kéo dài ra theo yêu cầu */}
        <label className="garden-search">
          <Search size={18} />
          <input
            aria-label="Tìm sản phẩm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Bạn đang tìm cây gì? (ví dụ: sen đá, trầu bà, lưỡi hổ...)"
          />
          {search && <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm"><X size={16} /></button>}
        </label>
      </div>

      <div className="catalog-result-count" aria-live="polite">
        <span>{products.length} người bạn nhỏ{category !== 'Tất cả' ? ` · ${category}` : ''}</span>
        <span><Sprout size={14} /> Chọn bằng mắt, yêu bằng tim</span>
      </div>

      {products.length ? (
        <div className="garden-products" key={`${category}-${normalizeName(search)}`}>
          {products.map((product, index) => (
            <GardenProduct
              key={product.id}
              product={product}
              index={index}
              onAdd={onAdd}
              onOpenStory={(p) => setSelectedStoryProduct(p)}
            />
          ))}
        </div>
      ) : (
        <div className="garden-empty">
          <Search size={34} />
          <h3>Người bạn này đang trốn đâu rồi?</h3>
          <p>Thử tên khác hoặc ghé lại tất cả danh mục nhé.</p>
          <button className="garden-primary" onClick={clearFilters}>Xem cả khu vườn <ArrowRight size={17} /></button>
        </div>
      )}
    </section>

    {/* Modal hiển thị chi tiết câu chuyện khi bấm vào sản phẩm */}
    {selectedStoryProduct && (
      <ProductStoryModal
        product={selectedStoryProduct}
        onClose={() => setSelectedStoryProduct(null)}
        onAdd={onAdd}
      />
    )}

    <section className="garden-note" id="garden-note" data-reveal>
      <div className="note-illustration" aria-hidden="true">
        <ProductArt product={{ name: 'Hoa cúc' }} smile />
        <span>hello, sunshine!</span>
      </div>
      <div className="note-copy">
        <span className="garden-eyebrow">MỘT LỜI NHẮN TỪ VƯỜN NHỎ</span>
        <h2>Không cần một khu vườn lớn.<br /><em>Chỉ cần một chút yêu thương.</em></h2>
        <p>Đôi khi, chăm một cái cây cũng là cách mình chăm lại bản thân. Dành một góc nhỏ cho màu xanh, một phút mỗi sáng để ngắm lá — bình yên bắt đầu từ những điều như thế.</p>
        <a href="#catalog">Tìm người bạn đầu tiên <ArrowRight size={17} /></a>
      </div>
      <span className="note-daisy" aria-hidden="true">✿</span>
    </section>

    <section className="garden-values" aria-label="Tinh thần Vườn Nhỏ">
      {[
        { icon: Sprout, title: 'Một chút thiên nhiên', text: 'Cho không gian thêm sức sống.' },
        { icon: PackageCheck, title: 'Một chút chăm chút', text: 'Từ chậu cây đến từng chiếc lá.' },
        { icon: Heart, title: 'Thật nhiều yêu thương', text: 'Cùng bạn nuôi những niềm vui nhỏ.' },
      ].map(({ icon: Icon, title, text }) => (
        <div key={title} data-reveal>
          <span><Icon size={25} /></span>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </section>

    <footer className="garden-footer">
      <div>
        <Sprout size={24} />
        <strong>Vườn Nhỏ</strong>
        <span>Gieo xanh. Gặt bình yên.</span>
      </div>
      <span>Được chăm chút bởi Yến Duy <Heart size={13} /></span>
      <a href="#top">Về đầu vườn ↑</a>
    </footer>
  </main>;
}
