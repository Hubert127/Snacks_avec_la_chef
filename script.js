/* ═══════════════════════════════════════════════
   SNACKS BY SNACKS — avec la chef
   script.js  |  Fresh Food. Bold Taste.
═══════════════════════════════════════════════ */

/* ─── CONSTANTS ───────────────────────────── */
const MOMO_CODE = '736568';
const DELIVERY  = 500;

/* ─── DATA ────────────────────────────────── */
const CATS = [
  {id:'all',         emoji:'🔥', label:'All Items'},
  {id:'burgers',     emoji:'🍔', label:'Burgers'},
  {id:'sandwiches',  emoji:'🥪', label:'Sandwiches'},
  {id:'shawarmas',   emoji:'🌯', label:'Shawarmas & Wraps'},
  {id:'quesadillas', emoji:'🫓', label:'Quesadillas'},
  {id:'tacos',       emoji:'🌮', label:'Tacos'},
  {id:'crepes',      emoji:'🥞', label:'Crepes & Pancakes'},
];

const PRODUCTS = [
  /* ── BURGERS  3,500 FRW ── */
  {
    id:1, name:'Beef Burger', cat:'burgers', emoji:'🍔',
    img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:520, prot:'28g', fat:'28g', carb:'42g',
    rating:4.9, sold:680,
    desc:'Juicy beef patty grilled to perfection, layered with crisp lettuce, fresh tomato, pickles, and our bold signature sauce on a toasted sesame bun. A true classic.'
  },
  {
    id:2, name:'Chicken Burger', cat:'burgers', emoji:'🍔',
    img:'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:480, prot:'32g', fat:'22g', carb:'40g',
    rating:4.8, sold:590,
    desc:'Tender grilled chicken fillet with a golden crispy coating, fresh coleslaw, and spicy sriracha mayo on a brioche bun. Bold flavour in every bite.'
  },
  {
    id:3, name:'Fish Burger', cat:'burgers', emoji:'🍔',
    img:'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:450, prot:'25g', fat:'20g', carb:'44g',
    rating:4.7, sold:340,
    desc:'Crispy battered fish fillet with fresh lettuce, homemade tartare sauce, and a squeeze of lemon on a soft bun. Light, flavorful and incredibly satisfying.'
  },

  /* ── SANDWICHES  3,500 FRW ── */
  {
    id:4, name:'Beef Sandwich', cat:'sandwiches', emoji:'🥪',
    img:'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:490, prot:'30g', fat:'24g', carb:'38g',
    rating:4.8, sold:460,
    desc:'Sliced seasoned beef with caramelized onions, melted cheese, and fresh greens packed in toasted artisan bread. Rich, hearty and deeply satisfying.'
  },
  {
    id:5, name:'Chicken Sandwich', cat:'sandwiches', emoji:'🥪',
    img:'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:430, prot:'28g', fat:'18g', carb:'40g',
    rating:4.7, sold:510,
    desc:'Grilled chicken strips with avocado, tomato, crisp lettuce, and honey mustard pressed in warm toasted bread. Fresh, clean and full of flavour.'
  },
  {
    id:6, name:'Fish Sandwich', cat:'sandwiches', emoji:'🥪',
    img:'https://images.unsplash.com/photo-1485704686097-ed47f7263ca4?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:410, prot:'24g', fat:'16g', carb:'42g',
    rating:4.6, sold:280,
    desc:'Flaky seasoned fish with fresh cucumber, ripe tomato, and a creamy dill sauce tucked in soft toasted bread. A lighter and refreshing sandwich option.'
  },

  /* ── SHAWARMAS & WRAPS  3,500 FRW ── */
  {
    id:7, name:'Beef Shawarma', cat:'shawarmas', emoji:'🌯',
    img:'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:550, prot:'32g', fat:'26g', carb:'48g',
    rating:4.9, sold:720,
    desc:'Marinated slow-cooked beef strips with garlic sauce, pickled veggies, and fresh tomatoes wrapped in warm flatbread. Authentic bold Middle Eastern flavours.'
  },
  {
    id:8, name:'Chicken Shawarma', cat:'shawarmas', emoji:'🌯',
    img:'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:500, prot:'35g', fat:'20g', carb:'46g',
    rating:4.9, sold:850,
    desc:'Tender spiced chicken with hummus, tabbouleh, pickled turnips, and garlic sauce in a warm toasted wrap. Our all-time best-seller — always fresh.'
  },
  {
    id:9, name:'Fish Wrap', cat:'shawarmas', emoji:'🌯',
    img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=380&fit=crop&auto=format',
    price:3500, weight:'1 serving',
    cal:420, prot:'26g', fat:'14g', carb:'46g',
    rating:4.6, sold:310,
    desc:'Lightly seasoned grilled fish with fresh veggies, shredded cabbage, lemon herb sauce and a hint of chili wrapped in a soft warm tortilla. Clean and delicious.'
  },

  /* ── QUESADILLAS  4,000 FRW ── */
  {
    id:10, name:'Beef Quesadilla', cat:'quesadillas', emoji:'🫓',
    img:'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=380&fit=crop&auto=format',
    price:4000, weight:'1 serving',
    cal:580, prot:'30g', fat:'30g', carb:'50g',
    rating:4.8, sold:390,
    desc:'Crispy golden tortilla packed with seasoned beef, melted stretchy cheese, jalapeños and sour cream. Grilled until perfectly crunchy outside and gooey inside.'
  },
  {
    id:11, name:'Chicken Quesadilla', cat:'quesadillas', emoji:'🫓',
    img:'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=380&fit=crop&auto=format',
    price:4000, weight:'1 serving',
    cal:540, prot:'34g', fat:'26g', carb:'48g',
    rating:4.9, sold:460,
    desc:'Golden crispy tortilla filled with grilled chicken, stretchy mozzarella, roasted peppers and smoky chipotle sauce. A flavour explosion in every single bite.'
  },
  {
    id:12, name:'Fish Quesadilla', cat:'quesadillas', emoji:'🫓',
    img:'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&h=380&fit=crop&auto=format',
    price:4000, weight:'1 serving',
    cal:490, prot:'28g', fat:'22g', carb:'48g',
    rating:4.6, sold:240,
    desc:'Crispy tortilla with flaked seasoned fish, melted cheese, caramelized onions and a squeeze of fresh lime. Light yet incredibly flavourful and satisfying.'
  },

  /* ── TACOS  4,000 FRW ── */
  {
    id:13, name:'Beef Tacos', cat:'tacos', emoji:'🌮',
    img:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=380&fit=crop&auto=format',
    price:4000, weight:'2 pieces',
    cal:520, prot:'28g', fat:'24g', carb:'46g',
    rating:4.9, sold:610,
    desc:'Two soft corn tacos loaded with spiced minced beef, fresh pico de gallo, cilantro, shredded cheese, and a drizzle of hot sauce. Absolute taco heaven.'
  },
  {
    id:14, name:'Chicken Tacos', cat:'tacos', emoji:'🌮',
    img:'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&h=380&fit=crop&auto=format',
    price:4000, weight:'2 pieces',
    cal:480, prot:'32g', fat:'18g', carb:'44g',
    rating:4.8, sold:540,
    desc:'Two soft tacos filled with grilled spiced chicken, charred corn, fresh avocado, lime slaw, and salsa verde. A fiesta of fresh, bold and vibrant flavours.'
  },
  {
    id:15, name:'Fish Tacos', cat:'tacos', emoji:'🌮',
    img:'https://images.unsplash.com/photo-1611250188496-e966043a0629?w=500&h=380&fit=crop&auto=format',
    price:4000, weight:'2 pieces',
    cal:430, prot:'26g', fat:'16g', carb:'46g',
    rating:4.7, sold:360,
    desc:'Two crispy battered fish tacos with mango salsa, pickled cabbage, chipotle crema and fresh jalapeños in warm soft tortillas. A true coastal flavour experience.'
  },

  /* ── CREPES & PANCAKES ── */
  {
    id:16, name:'Pancakes', cat:'crepes', emoji:'🥞',
    img:'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500&h=380&fit=crop&auto=format',
    price:1000, weight:'1 serving',
    cal:350, prot:'8g', fat:'12g', carb:'52g',
    rating:4.7, sold:420,
    desc:'Fluffy golden pancakes stacked high and drizzled with maple syrup, topped with fresh fruits and a dusting of powdered sugar. The ultimate sweet treat any time.'
  },
  {
    id:17, name:'Crepes', cat:'crepes', emoji:'🥞',
    img:'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=500&h=380&fit=crop&auto=format',
    price:700, weight:'1 serving',
    cal:280, prot:'6g', fat:'10g', carb:'42g',
    rating:4.6, sold:380,
    desc:'Thin, delicate French-style crepes served with a choice of sweet or savoury fillings. Light, elegant and made completely fresh to order.'
  },
  {
    id:18, name:'Fries', cat:'crepes', emoji:'🍟',
    img:'https://images.unsplash.com/photo-1573080496219-bb964701c394?w=500&h=380&fit=crop&auto=format',
    price:1000, weight:'1 serving',
    cal:312, prot:'4g', fat:'15g', carb:'40g',
    rating:4.8, sold:920,
    desc:'Crispy golden fries seasoned with our special spice blend, perfectly salted and fried to a beautiful golden crunch. The ultimate side dish or standalone snack.'
  },
];

/* ─── STATE ───────────────────────────────── */
let cart        = [];
let activeCat   = 'all';
let searchQ     = '';
let currentUser = null;
let payStep     = 1;
let pdQty       = 1;
let pdId        = null;
let selMethod   = 'ussd';

/* ─── LOCALSTORAGE ────────────────────────── */
function saveCart(){
  try{ localStorage.setItem('snacks_by_snacks_cart', JSON.stringify(cart)); }catch(e){}
}
function loadCart(){
  try{
    const saved = localStorage.getItem('snacks_by_snacks_cart');
    if(saved){
      const parsed = JSON.parse(saved);
      cart = parsed
        .map(item => {
          const product = PRODUCTS.find(p => p.id === item.id);
          if(!product) return null;
          return {...product, qty: item.qty};
        })
        .filter(Boolean);
    }
  }catch(e){ cart = []; }
}

/* ─── PRIVATE PLATE FUNCTIONS ─────────────── */
function bookService(serviceType){
  document.getElementById('serviceType').value = serviceType;
  document.getElementById('eventDate').focus();
  toast(`📅 Selected ${serviceType} service`, 'g');
}

function viewChef(chefId){
  toast(`👨‍🍳 Viewing ${chefId} profile`, 'g');
  // In a real app, this would navigate to chef detail page
}

function submitBooking(){
  const serviceType = document.getElementById('serviceType')?.value;
  const eventDate = document.getElementById('eventDate')?.value;
  const guestCount = document.getElementById('guestCount')?.value;
  const eventLocation = document.getElementById('eventLocation')?.value;
  
  if(!serviceType || !eventDate || !guestCount || !eventLocation){
    toast('⚠️ Please fill all required fields', '');
    return;
  }
  
  toast('✅ Booking request submitted! We\'ll contact you soon.', 'g');
  // Reset form
  document.getElementById('serviceType').value = '';
  document.getElementById('eventDate').value = '';
  document.getElementById('guestCount').value = '';
  document.getElementById('preferredChef').value = '';
  document.getElementById('eventLocation').value = '';
  document.getElementById('specialRequirements').value = '';
}

function toggleBookings(){
  // Placeholder for bookings sidebar functionality
  toast('📅 Bookings feature coming soon', '');
}

/* ─── INIT ──────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  loadCart();
  // Always build hero slides on index.html
  if(document.getElementById('row1')){
    buildHeroSlides();
  }
  // Only render products if we're on products page
  if(document.getElementById('catsEl')){
    renderCats(); renderProds();
    updateCartUI();
    document.getElementById('searchInp').addEventListener('keyup',e=>{searchQ=e.target.value.toLowerCase();renderProds();});
  }

  // close user dropdown on outside click
  document.addEventListener('click', e => {
    const pill = document.getElementById('userPill');
    if(pill && !pill.contains(e.target)) closeUserMenu();
  });
});

/* ─── HERO SLIDES ─────────────────────────── */
function buildHeroSlides(){
  const half  = Math.ceil(PRODUCTS.length / 2);
  const imgs1 = PRODUCTS.slice(0, half).map(p => p.img);
  const imgs2 = PRODUCTS.slice(half).map(p => p.img);
  const makeTrack = (imgs, rowId) => {
    const el = document.getElementById(rowId);
    if(!el) return;
    el.innerHTML = [...imgs, ...imgs].map((src, i) =>
      `<img class="slide-img" src="${src}" alt="food ${i}" loading="lazy" onerror="this.style.display='none'"/>`
    ).join('');
  };
  makeTrack(imgs1, 'row1');
  makeTrack(imgs2, 'row2');
}

/* ─── CATEGORIES ──────────────────────────── */
function renderCats(){
  document.getElementById('catsEl').innerHTML = CATS.map(c =>
    `<button class="cat-btn ${c.id === activeCat ? 'active' : ''}" onclick="filterCat('${c.id}')">
      ${c.emoji} ${c.label}
    </button>`
  ).join('');
}
function filterCat(id){
  activeCat = id;
  searchQ   = '';
  document.getElementById('searchInp').value = '';
  const c = CATS.find(x => x.id === id);
  document.getElementById('prodTitle').textContent = c.emoji + ' ' + c.label;
  renderCats();
  renderProds();
}

/* ─── PRODUCTS ────────────────────────────── */
function renderProds(){
  const grid = document.getElementById('prodGrid');
  let list = activeCat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeCat);
  if(searchQ) list = list.filter(p => p.name.toLowerCase().includes(searchQ));
  document.getElementById('prodCnt').textContent = list.length + ' items';

  if(!list.length){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#666">
      <div style="font-size:3rem;margin-bottom:12px">🔍</div>
      <p style="font-weight:700;color:#aaa">No items found</p></div>`;
    return;
  }

  grid.innerHTML = list.map((p, i) => `
    <div class="p-card" style="animation-delay:${i * .05}s">
      <div class="p-img" onclick="openPD(${p.id})">
        <img src="${p.img}" alt="${p.name}" loading="lazy"
          onerror="this.parentNode.innerHTML='<div class=\'p-img-fallback\'>${p.emoji}</div>'"/>
        <div class="p-view-ov"><i class="fas fa-eye"></i> View Details</div>
      </div>
      <div class="p-body">
        <div class="p-cat">${p.cat}</div>
        <div class="p-name">${p.name}</div>
        <div class="p-wt">📦 ${p.weight} &nbsp;·&nbsp; ⭐ ${p.rating}</div>
        <div class="p-foot">
          <div class="p-price">${p.price.toLocaleString()} <small>FRW</small></div>
        </div>
        <button class="btn-add" onclick="addCart(${p.id})">
          <i class="fas fa-fire"></i> Add to Order
        </button>
      </div>
    </div>`
  ).join('');
}
function doSearch(){
  searchQ = document.getElementById('searchInp').value.toLowerCase();
  renderProds();
}

/* ─── PRODUCT DETAIL ──────────────────────── */
function openPD(id){
  const p = PRODUCTS.find(x => x.id === id);
  pdId = id; pdQty = 1;
  document.getElementById('pdContent').innerHTML = `
    <div class="pd-hero">
      <img src="${p.img}" alt="${p.name}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
      <div class="pd-hero-overlay"></div>
      <div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:5rem;background:linear-gradient(135deg,#2a0a02,#1a1208)">${p.emoji}</div>
      <button class="pd-close" onclick="closeOv('pdOv')" style="position:absolute;top:13px;right:13px;z-index:2">
        <i class="fas fa-times"></i>
      </button>
      <div style="position:absolute;bottom:16px;left:18px;z-index:2">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:#fff;letter-spacing:.05em;text-shadow:0 2px 12px rgba(0,0,0,.6);line-height:1.1">${p.name}</div>
        <div style="font-size:.8rem;color:rgba(255,255,255,.75);margin-top:3px;font-weight:600">⭐ ${p.rating} &nbsp;·&nbsp; 🔥 ${p.sold}+ orders</div>
      </div>
    </div>
    <div class="pd-body">
      <div class="pd-badges">
        <span class="pd-b cat">📂 ${p.cat}</span>
        <span class="pd-b hot">🔥 ${p.sold}+ sold</span>
        <span class="pd-b" style="color:#f0a500;background:rgba(240,165,0,.1);border-color:rgba(240,165,0,.25)">⭐ ${p.rating}</span>
      </div>
      <p class="pd-desc">${p.desc}</p>
      <div class="pd-details">
        <div class="pd-d"><div class="pd-d-l">📦 Portion</div><div class="pd-d-v">${p.weight}</div></div>
        <div class="pd-d"><div class="pd-d-l">⭐ Rating</div><div class="pd-d-v">${p.rating} / 5.0</div></div>
        <div class="pd-d"><div class="pd-d-l">🔥 Orders</div><div class="pd-d-v">${p.sold}+</div></div>
        <div class="pd-d"><div class="pd-d-l">⚡ Calories</div><div class="pd-d-v">${p.cal} kcal</div></div>
      </div>
      <div class="pd-price-row">
        <div>
          <div style="font-size:.7rem;font-weight:700;color:#888;margin-bottom:2px">Unit Price</div>
          <div class="pd-price">${p.price.toLocaleString()} <small>FRW</small></div>
        </div>
        <div style="text-align:right">
          <div style="font-size:.7rem;font-weight:700;color:#888;margin-bottom:2px">Subtotal</div>
          <div class="pd-price" id="pdSub">${p.price.toLocaleString()} <small>FRW</small></div>
        </div>
      </div>
      <div class="pd-qty-row">
        <div class="pd-qc">
          <button class="pd-qb" onclick="chPDQty(-1)">−</button>
          <div class="pd-qn" id="pdQtyEl">1</div>
          <button class="pd-qb" onclick="chPDQty(1)">+</button>
        </div>
        <button class="btn-add-modal" onclick="addCartFromPD()">
          <i class="fas fa-fire"></i> Add to Order
        </button>
      </div>
      <div class="pd-nut">
        <h4>📊 Nutritional Info <span style="font-weight:500;color:#666;font-size:.76rem">(per 100g)</span></h4>
        <div class="nut-grid">
          <div class="nut-i"><div class="nut-v">${p.cal}</div><div class="nut-l">Calories</div></div>
          <div class="nut-i"><div class="nut-v">${p.prot}</div><div class="nut-l">Protein</div></div>
          <div class="nut-i"><div class="nut-v">${p.fat}</div><div class="nut-l">Fat</div></div>
          <div class="nut-i"><div class="nut-v">${p.carb}</div><div class="nut-l">Carbs</div></div>
        </div>
      </div>
    </div>`;
  openOv('pdOv');
}
function chPDQty(d){
  const p = PRODUCTS.find(x => x.id === pdId);
  pdQty   = Math.max(1, pdQty + d);
  document.getElementById('pdQtyEl').textContent = pdQty;
  document.getElementById('pdSub').innerHTML = (p.price * pdQty).toLocaleString() + ' <small>FRW</small>';
}
function addCartFromPD(){
  const p  = PRODUCTS.find(x => x.id === pdId);
  const ex = cart.find(c => c.id === p.id);
  if(ex) ex.qty += pdQty; else cart.push({...p, qty: pdQty});
  updateCartUI();
  closeOv('pdOv');
  toast(`✅ ${p.name} ×${pdQty} added`, 'g');
}

/* ─── CART ────────────────────────────────── */
function addCart(id){
  const p  = PRODUCTS.find(x => x.id === id);
  const ex = cart.find(c => c.id === id);
  if(ex) ex.qty++; else cart.push({...p, qty: 1});
  updateCartUI();
  toast(`🔥 ${p.name} added to order`, 'g');
}
function removeCart(id){ cart = cart.filter(c => c.id !== id); updateCartUI(); }
function chQty(id, d){
  const it = cart.find(c => c.id === id);
  if(!it) return;
  it.qty += d;
  if(it.qty <= 0) removeCart(id); else updateCartUI();
}
function updateCartUI(){
  saveCart();
  document.getElementById('cartBadge').textContent = cart.reduce((a, c) => a + c.qty, 0);
  renderCartBody();
}
function renderCartBody(){
  const body = document.getElementById('cBody');
  const fw   = document.getElementById('cFootWrap');
  if(!cart.length){
    body.innerHTML = `<div class="c-empty">
      <i class="fas fa-fire-alt"></i>
      <p style="font-weight:700;margin-bottom:5px;color:#aaa">Order is empty</p>
      <p style="font-size:.8rem">Pick something bold and fresh!</p></div>`;
    fw.style.display = 'none';
    return;
  }
  body.innerHTML = cart.map(it => `
    <div class="ci">
      <div class="ci-em">
        <img src="${it.img}" alt="${it.name}"
          onerror="this.parentNode.style.background='#2a0a02';this.parentNode.innerHTML='<span style=\\'font-size:1.6rem;display:flex;align-items:center;justify-content:center;height:100%\\'>${it.emoji}</span>'"/>
      </div>
      <div class="ci-inf">
        <div class="ci-nm">${it.name}</div>
        <div class="ci-pr">${(it.price * it.qty).toLocaleString()} FRW</div>
      </div>
      <div class="qc">
        <button class="qb" onclick="chQty(${it.id},-1)">−</button>
        <span class="qn">${it.qty}</span>
        <button class="qb" onclick="chQty(${it.id},1)">+</button>
      </div>
      <button class="ci-del" onclick="removeCart(${it.id})"><i class="fas fa-trash"></i></button>
    </div>`
  ).join('');

  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0);
  document.getElementById('cfSub').textContent  = sub.toLocaleString() + ' FRW';
  document.getElementById('cfTot').textContent  = (sub + DELIVERY).toLocaleString() + ' FRW';
  fw.style.display = 'block';
}
function toggleCart(){
  document.getElementById('cSidebar').classList.toggle('open');
  document.getElementById('cOverlay').classList.toggle('open');
  renderCartBody();
}

/* ─── PAYMENT ─────────────────────────────── */
function openPay(){
  if(!cart.length){ toast('⚠️ Your order is empty!', ''); return; }
  document.getElementById('cSidebar').classList.remove('open');
  document.getElementById('cOverlay').classList.remove('open');
  payStep = 1; setStep(1); renderPayStep(1); openOv('payOv');
}
function totals(){
  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0);
  return {sub, total: sub + DELIVERY};
}
function setStep(n){
  [1,2,3,4].forEach(i => {
    document.getElementById('stp'+i).className =
      'step-item' + (i < n ? ' done' : i === n ? ' active' : '');
  });
}
function renderPayStep(step){
  const body = document.getElementById('payBody');
  const {sub, total} = totals();

  if(step === 1){
    body.innerHTML = `
      <div class="or">
        <div class="or-t">📋 Order Review</div>
        ${cart.map(it =>
          `<div class="or-row"><span>${it.emoji} ${it.name} ×${it.qty}</span><span>${(it.price*it.qty).toLocaleString()} FRW</span></div>`
        ).join('')}
        <hr class="or-div"/>
        <div class="or-row"><span>🚚 Delivery</span><span>${DELIVERY} FRW</span></div>
        <div class="or-total"><span>Total</span><span>${total.toLocaleString()} FRW</span></div>
      </div>
      <p style="font-size:.8rem;color:#888;margin-bottom:16px;line-height:1.65">
        ⏱️ All orders must be placed <strong style="color:#f0a500">the day before</strong> or by <strong style="color:#f0a500">8:00 AM</strong> on the day. Lunch delivery: 12PM–2PM.
      </p>
      <button class="btn-next" onclick="goPay(2)">Next: Contact Details →</button>`;
  }

  else if(step === 2){
    body.innerHTML = `
      <div class="fg2">
        <label>Full Name <span>*</span></label>
        <input class="inp" id="pName" type="text" placeholder="Jean Paul Mugisha"
          value="${currentUser?.name || ''}"/>
      </div>
      <div class="fg2">
        <label>Delivery Address <span>*</span></label>
        <input class="inp" id="pAddr" type="text" placeholder="KG 5 Ave, Kicukiro Sector"
          value="${currentUser?.address || ''}"/>
      </div>
      <div class="fg2">
        <label>MTN MoMo Number <span>*</span></label>
        <div class="inp-wrap">
          <span class="inp-pre">+250</span>
          <input class="inp pr" id="pPhone" type="tel" maxlength="9" placeholder="078xxxxxxx"
            value="${currentUser?.phone || ''}"
            oninput="this.value=this.value.replace(/\\D/g,'')"/>
        </div>
      </div>
      <div class="fg2">
        <label>Order Note <span style="color:#666;font-weight:500">(optional)</span></label>
        <input class="inp" id="pNote" type="text" placeholder="e.g. No onions, extra spicy"/>
      </div>
      <div style="display:flex;gap:9px;margin-top:16px">
        <button class="btn-back" onclick="goPay(1)">← Back</button>
        <button class="btn-next" style="flex:1" onclick="goPay(3)">Next: Payment →</button>
      </div>`;
  }

  else if(step === 3){
    body.innerHTML = `
      <div class="or" style="margin-bottom:14px">
        <div class="or-total"><span>Amount Due</span><span>${total.toLocaleString()} FRW</span></div>
      </div>

      <p style="font-size:.76rem;font-weight:800;color:#aaa;margin-bottom:10px;text-transform:uppercase;letter-spacing:.07em">Select Payment Method</p>

      <div class="pm-card sel" id="pm-ussd" onclick="selPM('ussd')">
        <div class="pm-icon" style="background:rgba(240,165,0,.1)">📱</div>
        <div class="pm-info"><h4>USSD *182*8*1*${MOMO_CODE}#</h4><p>Dial on any phone — works without internet</p></div>
        <div class="pm-radio"><div></div></div>
      </div>
      <div class="pm-card" id="pm-app" onclick="selPM('app')">
        <div class="pm-icon" style="background:rgba(255,203,5,.08)">💛</div>
        <div class="pm-info"><h4>MTN MoMo App</h4><p>Pay directly via the MTN mobile money app</p></div>
        <div class="pm-radio"></div>
      </div>

      <div class="merchant-code-box">
        <div class="mc-label">Snacks by Snacks avec la chef — MoMo Merchant Code</div>
        <div class="mc-code">${MOMO_CODE}</div>
        <div class="mc-sub">Enter this code when completing your MoMo payment</div>
      </div>

      <div class="ussd-wrap" id="ussdWrap">
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <span class="ps-title">📲 Dial on your MTN line:</span>
            <div class="ps-string">
              <span class="ps-part">*182*8*1*</span><span class="ps-code">${MOMO_CODE}</span><span class="ps-hash">#</span>
            </div>
            <div class="ussd-copy-row">
              <button class="btn-copy" onclick="copyUSSD()"><i class="fas fa-copy"></i> Copy Code</button>
              <span class="copy-conf" id="cpConf"></span>
            </div>
          </div>
        </div>
        <div class="ussd-steps">
          📞 <strong>Step 1:</strong> Open your phone dialer<br/>
          🔢 <strong>Step 2:</strong> Dial <strong>*182*8*1*${MOMO_CODE}#</strong> and press call<br/>
          🔑 <strong>Step 3:</strong> Enter your 4-digit MoMo PIN to confirm<br/>
          📩 <strong>Step 4:</strong> You'll receive an SMS payment confirmation
        </div>
        <div class="ussd-tip">⚠️ Ensure your MTN line has sufficient MoMo balance. Your order is confirmed automatically after successful payment.</div>
      </div>

      <div style="display:flex;gap:9px;margin-top:14px">
        <button class="btn-back" onclick="goPay(2)">← Back</button>
        <button class="btn-pay" id="payBtn" onclick="doPayment()">
          <span style="font-size:1.05rem">MoMo</span> Confirm — ${total.toLocaleString()} FRW
        </button>
      </div>`;
  }

  else if(step === 'proc'){
    body.innerHTML = `
      <div class="proc-wrap">
        <div class="proc-ring"></div>
        <h3>Processing Payment…</h3>
        <p>Approve the payment prompt on your phone.</p>
        <div class="proc-ussd">*182*8*1*<span class="proc-hl">${MOMO_CODE}</span>#</div>
        <p>Or open your <strong>MTN MoMo App</strong> to approve.</p>
        <div class="proc-info">
          <strong>📱 Merchant Code:</strong> <span style="color:#f0a500;font-weight:900;font-family:monospace">${MOMO_CODE}</span><br/>
          <strong>💰 Amount:</strong> ${total.toLocaleString()} FRW<br/>
          <strong>⏱️ Timeout:</strong> 3 minutes to approve the prompt
        </div>
      </div>`;
  }

  else if(step === 'done'){
    const name    = document.getElementById('pName')?.value?.trim() || 'Customer';
    const addr    = document.getElementById('pAddr')?.value?.trim() || 'Kicukiro';
    const orderId = 'SBS-' + Date.now().toString(36).toUpperCase();
    body.innerHTML = `
      <div class="succ-wrap">
        <div class="succ-icon">🔥</div>
        <h2>Order Confirmed!</h2>
        <p>MTN MoMo payment received. Thank you, <strong>${name.split(' ')[0]}</strong>!</p>
        <div class="order-chip">📦 ${orderId}</div>
        <p>SMS confirmation sent to your MoMo number.<br/>Delivering to: <strong>${addr}</strong></p>
        <div class="tl">
          <div class="tl-item">
            <div class="tl-dot" style="background:rgba(240,165,0,.12);color:#f0a500">✅</div>
            <div class="tl-inf"><h5>Payment Received</h5><p>MoMo code <strong>${MOMO_CODE}</strong> confirmed</p></div>
          </div>
          <div class="tl-item">
            <div class="tl-dot" style="background:rgba(230,60,30,.12);color:#e63c1e">🍳</div>
            <div class="tl-inf"><h5>Order Being Prepared</h5><p>The chef is making your food fresh right now</p></div>
          </div>
          <div class="tl-item">
            <div class="tl-dot" style="background:rgba(255,203,5,.1);color:#ffcb05">🚚</div>
            <div class="tl-inf"><h5>Estimated Delivery</h5><p>30–45 minutes to your address (Lunch: 12PM–2PM)</p></div>
          </div>
        </div>
        <button class="btn-cont" onclick="closeOv('payOv');resetCart()">Continue Ordering 🔥</button>
      </div>`;
    [1,2,3,4].forEach(i => document.getElementById('stp'+i).className = 'step-item done');
  }
}

function goPay(n){
  if(n === 3){
    const name = document.getElementById('pName')?.value?.trim();
    const addr = document.getElementById('pAddr')?.value?.trim();
    const ph   = document.getElementById('pPhone')?.value?.trim();
    if(!name){ toast('⚠️ Enter your name', ''); return; }
    if(!addr){ toast('⚠️ Enter delivery address', ''); return; }
    if(!ph || ph.length < 9){ toast('⚠️ Enter valid 9-digit MoMo number', ''); return; }
  }
  payStep = n; setStep(n); renderPayStep(n);
  document.querySelector('.pay-box').scrollTop = 0;
}
function selPM(m){
  selMethod = m;
  document.getElementById('pm-ussd').className = 'pm-card' + (m === 'ussd' ? ' sel' : '');
  document.getElementById('pm-app').className  = 'pm-card' + (m === 'app'  ? ' sel' : '');
  const uw = document.getElementById('ussdWrap');
  if(uw) uw.style.display = m === 'ussd' ? 'block' : 'none';
}
function copyUSSD(){
  navigator.clipboard?.writeText(`*182*8*1*${MOMO_CODE}#`).catch(() => {});
  const el = document.getElementById('cpConf');
  el.textContent = '✅ Copied!';
  setTimeout(() => el.textContent = '', 2400);
}
function doPayment(){
  const btn = document.getElementById('payBtn');
  if(btn) btn.disabled = true;
  renderPayStep('proc');
  setTimeout(() => renderPayStep('done'), 3800);
}
function resetCart(){
  cart = [];
  saveCart();
  updateCartUI();
}

/* ─── AUTH ────────────────────────────────── */
function openAuth(){ openOv('authOv'); }
function switchTab(t){
  document.getElementById('fLogin').style.display = t === 'login' ? 'block' : 'none';
  document.getElementById('fReg').style.display   = t === 'reg'   ? 'block' : 'none';
  document.getElementById('tLogin').className = 'a-tab' + (t === 'login' ? ' active' : '');
  document.getElementById('tReg').className   = 'a-tab' + (t === 'reg'   ? ' active' : '');
}
function togPwd(id, btn){
  const el   = document.getElementById(id);
  const show = el.type === 'text';
  el.type    = show ? 'password' : 'text';
  btn.innerHTML = show ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
}
function doLogin(){
  const email = document.getElementById('lEmail').value.trim();
  const pass  = document.getElementById('lPass').value.trim();
  if(!email || !pass){ toast('⚠️ Fill in all fields', ''); return; }
  currentUser = {name:'Jean Mugisha', email, phone:'0781234567', address:'KG 5 Ave, Kicukiro'};
  applyUser(); closeOv('authOv'); toast('🔥 Welcome back!', 'g');
}
function doRegister(){
  const f  = document.getElementById('rFirst').value.trim();
  const l  = document.getElementById('rLast').value.trim();
  const e  = document.getElementById('rEmail').value.trim();
  const ph = document.getElementById('rPhone').value.trim();
  const pw = document.getElementById('rPass').value.trim();
  const a  = document.getElementById('rAddr').value.trim();
  if(!f || !l || !e || !ph || !pw || !a){ toast('⚠️ Fill in all required fields', ''); return; }
  if(ph.length < 9){ toast('⚠️ Enter valid 9-digit phone number', ''); return; }
  currentUser = {name:`${f} ${l}`, email:e, phone:ph, address:a};
  applyUser(); closeOv('authOv'); toast(`🎉 Welcome, ${f}! Account created.`, 'g');
}
function socialLogin(p){
  currentUser = {name:`${p} User`, email:'user@example.com', phone:'', address:''};
  applyUser(); closeOv('authOv'); toast(`✅ Signed in with ${p}`, 'g');
}
function applyUser(){
  document.getElementById('signinBtn').style.display = 'none';
  const pill = document.getElementById('userPill');
  pill.style.display = 'flex';
  const initial = currentUser.name[0].toUpperCase();
  document.getElementById('uAvatar').textContent  = initial;
  document.getElementById('uName').textContent    = currentUser.name.split(' ')[0];
  document.getElementById('udAvatar').textContent = initial;
  document.getElementById('udName').textContent   = currentUser.name;
  document.getElementById('udEmail').textContent  = currentUser.email || 'No email provided';
}
function toggleUserMenu(){
  const dd   = document.getElementById('userDropdown');
  const ch   = document.getElementById('uChevron');
  const open = dd.classList.contains('open');
  dd.classList.toggle('open');
  ch.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}
function closeUserMenu(){
  document.getElementById('userDropdown').classList.remove('open');
  document.getElementById('uChevron').style.transform = 'rotate(0deg)';
}
function doLogout(){
  currentUser = null;
  document.getElementById('userPill').style.display   = 'none';
  document.getElementById('signinBtn').style.display  = 'flex';
  closeUserMenu();
  cart = []; updateCartUI();
  toast('👋 Logged out. See you soon!', 'go');
}

/* ─── OVERLAY HELPERS ─────────────────────── */
function openOv(id){ document.getElementById(id).classList.add('open'); }
function closeOv(id){ document.getElementById(id).classList.remove('open'); }

/* ─── TOAST ───────────────────────────────── */
function toast(msg, type = ''){
  const el = document.getElementById('toast');
  el.className = 'toast' + (type ? ' ' + type : '');
  document.getElementById('toastMsg').textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}