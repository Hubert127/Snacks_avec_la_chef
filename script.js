/* ═══════════════════════════════════════════════
   SNACKS BY SNACKS — avec la chef
   script.js  |  Fresh Food. Bold Taste.
   Data layer: Supabase (see supabaseClient.js)
═══════════════════════════════════════════════ */

/* ─── CONSTANTS ───────────────────────────── */
const MOMO_CODE = '736568';
const DELIVERY  = 500;

/* ─── CATEGORY LABELS (display only — actual items come from Supabase) ── */
const CATS = [
  {id:'all',         emoji:'🔥', label:'All Items'},
  {id:'burgers',     emoji:'🍔', label:'Burgers'},
  {id:'sandwiches',  emoji:'🥪', label:'Sandwiches'},
  {id:'shawarmas',   emoji:'🌯', label:'Shawarmas & Wraps'},
  {id:'quesadillas', emoji:'🫓', label:'Quesadillas'},
  {id:'tacos',       emoji:'🌮', label:'Tacos'},
  {id:'crepes',      emoji:'🥞', label:'Crepes & Pancakes'},
];

/* ─── STATE ───────────────────────────────── */
let PRODUCTS    = [];
let cart        = [];
let activeCat   = 'all';
let searchQ     = '';
let currentUser = null;
let payStep     = 1;
let pdQty       = 1;
let pdId        = null;
let selMethod   = 'ussd';
let checkoutDetails = {}; // survives across payment-step re-renders (each step replaces the DOM)

/* ─── PRODUCTS (from Supabase) ────────────── */
function mapProduct(row){
  return {
    id: row.id, name: row.name, cat: row.category, emoji: row.emoji || '🍽️',
    img: row.image_url, price: row.price, weight: row.weight,
    cal: row.calories, prot: row.protein, fat: row.fat, carb: row.carbs,
    rating: row.rating, sold: row.sold, desc: row.description
  };
}
async function loadProducts(){
  const {data, error} = await sb.from('products').select('*').eq('active', true).order('id');
  if(error){ console.error(error); PRODUCTS = []; return; }
  PRODUCTS = data.map(mapProduct);
}

/* ─── LOCALSTORAGE (cart only) ────────────── */
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

async function submitBooking(){
  const serviceType         = document.getElementById('serviceType')?.value;
  const eventDate           = document.getElementById('eventDate')?.value;
  const guestCount          = document.getElementById('guestCount')?.value;
  const preferredChef       = document.getElementById('preferredChef')?.value || null;
  const eventLocation       = document.getElementById('eventLocation')?.value;
  const specialRequirements = document.getElementById('specialRequirements')?.value || null;

  if(!serviceType || !eventDate || !guestCount || !eventLocation){
    toast('⚠️ Please fill all required fields', '');
    return;
  }

  const { error } = await sb.from('bookings').insert({
    user_id: currentUser?.id || null,
    service_type: serviceType,
    event_date: eventDate,
    guest_count: parseInt(guestCount, 10),
    preferred_chef: preferredChef,
    event_location: eventLocation,
    special_requirements: specialRequirements
  });

  if(error){ toast('⚠️ Could not submit booking: ' + error.message, ''); return; }

  toast('✅ Booking request submitted! We\'ll contact you soon.', 'g');
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
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  await restoreSession();
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
    const bell = document.getElementById('notifBell');
    if(bell && !bell.contains(e.target)) document.getElementById('notifDropdown')?.classList.remove('open');
  });
});

/* ─── HERO SLIDES ─────────────────────────── */
function buildHeroSlides(){
  if(!PRODUCTS.length) return;
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
function renderPayStep(step, orderCode){
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
          value="${checkoutDetails.name || currentUser?.name || ''}"/>
      </div>
      <div class="fg2">
        <label>Delivery Address <span>*</span></label>
        <input class="inp" id="pAddr" type="text" placeholder="KG 5 Ave, Kicukiro Sector"
          value="${checkoutDetails.addr || currentUser?.address || ''}"/>
      </div>
      <div class="fg2">
        <label>Email <span>*</span></label>
        <input class="inp" id="pEmail" type="email" placeholder="you@email.com"
          value="${checkoutDetails.email || currentUser?.email || ''}"/>
      </div>
      <div class="fg2">
        <label>MTN MoMo Number <span>*</span></label>
        <div class="inp-wrap">
          <span class="inp-pre">+250</span>
          <input class="inp pr" id="pPhone" type="tel" maxlength="9" placeholder="078xxxxxxx"
            value="${checkoutDetails.phone || currentUser?.phone || ''}"
            oninput="this.value=this.value.replace(/\\D/g,'')"/>
        </div>
      </div>
      <div class="fg2">
        <label>Order Note <span style="color:#666;font-weight:500">(optional)</span></label>
        <input class="inp" id="pNote" type="text" placeholder="e.g. No onions, extra spicy" value="${checkoutDetails.note || ''}"/>
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
        <div class="ussd-tip">⚠️ Ensure your MTN line has sufficient MoMo balance. Your order will be confirmed once we verify your payment screenshot below.</div>
      </div>

      <div class="proof-upload">
        <label>Upload MoMo Payment Screenshot <span style="color:var(--fire)">*</span></label>
        <div class="proof-drop">
          <input id="pProof" type="file" accept="image/*" onchange="previewProof(this)"/>
        </div>
        <div class="proof-preview-wrap" id="proofPreviewWrap">
          <img class="proof-preview" id="proofPreview" alt="Payment screenshot preview"/>
        </div>
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
    const name = checkoutDetails.name || 'Customer';
    const addr = checkoutDetails.addr || 'Kicukiro';
    const orderId = orderCode || ('SBS-' + Date.now().toString(36).toUpperCase());
    body.innerHTML = `
      <div class="succ-wrap">
        <div class="succ-icon">🔥</div>
        <h2>Order Received!</h2>
        <p>Thank you, <strong>${name.split(' ')[0]}</strong>! We're verifying your MoMo payment screenshot.</p>
        <div class="order-chip">📦 ${orderId}</div>
        <p>You'll get a notification (and an email) as soon as it's confirmed.<br/>Delivering to: <strong>${addr}</strong></p>
        <div class="tl">
          <div class="tl-item">
            <div class="tl-dot" style="background:rgba(240,165,0,.12);color:#f0a500">📸</div>
            <div class="tl-inf"><h5>Screenshot Received</h5><p>Our team is verifying your MoMo payment</p></div>
          </div>
          <div class="tl-item">
            <div class="tl-dot" style="background:rgba(230,60,30,.12);color:#e63c1e">🍳</div>
            <div class="tl-inf"><h5>Order Prepared After Confirmation</h5><p>The chef starts once payment is verified</p></div>
          </div>
          <div class="tl-item">
            <div class="tl-dot" style="background:rgba(255,203,5,.1);color:#ffcb05">🚚</div>
            <div class="tl-inf"><h5>Estimated Delivery</h5><p>30–45 minutes after confirmation (Lunch: 12PM–2PM)</p></div>
          </div>
        </div>
        <button class="btn-cont" onclick="closeOv('payOv');resetCart()">Continue Ordering 🔥</button>
      </div>`;
    [1,2,3,4].forEach(i => document.getElementById('stp'+i).className = 'step-item done');
  }
}

function goPay(n){
  if(n === 3){
    const name  = document.getElementById('pName')?.value?.trim();
    const addr  = document.getElementById('pAddr')?.value?.trim();
    const email = document.getElementById('pEmail')?.value?.trim();
    const ph    = document.getElementById('pPhone')?.value?.trim();
    const note  = document.getElementById('pNote')?.value?.trim() || null;
    if(!name){ toast('⚠️ Enter your name', ''); return; }
    if(!addr){ toast('⚠️ Enter delivery address', ''); return; }
    if(!email || !email.includes('@')){ toast('⚠️ Enter a valid email (used for order updates)', ''); return; }
    if(!ph || ph.length < 9){ toast('⚠️ Enter valid 9-digit MoMo number', ''); return; }
    // save before this DOM gets replaced by step 3's markup
    checkoutDetails = {name, addr, email, phone: ph, note};
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

function previewProof(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('proofPreview').src = e.target.result;
    document.getElementById('proofPreviewWrap').classList.add('show');
  };
  reader.readAsDataURL(file);
}

async function placeOrder({name, addr, email, phone, note, proofFile}){
  const {sub, total} = totals();
  const orderCode = 'SBS-' + Date.now().toString(36).toUpperCase();

  const ext  = proofFile.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await sb.storage.from('payment-proofs').upload(path, proofFile);
  if(uploadError) return { error: 'Could not upload screenshot: ' + uploadError.message };

  const { data: order, error } = await sb.from('orders').insert({
    order_code: orderCode,
    user_id: currentUser?.id || null,
    customer_name: name,
    email,
    phone: '250' + phone,
    address: addr,
    note,
    subtotal: sub,
    delivery_fee: DELIVERY,
    total,
    payment_method: selMethod,
    payment_proof_path: path
  }).select().single();

  if(error) return { error: error.message };

  const items = cart.map(it => ({ order_id: order.id, product_id: it.id, name: it.name, price: it.price, qty: it.qty }));
  const { error: itemsError } = await sb.from('order_items').insert(items);
  if(itemsError) console.error(itemsError);

  return { orderCode };
}

async function doPayment(){
  // read the file BEFORE switching views — renderPayStep('proc') replaces
  // the whole form's HTML, so #pProof won't exist afterward. name/addr/
  // email/phone/note were already captured in goPay(3) into checkoutDetails,
  // since step 2's fields are long gone by the time we're on step 3.
  const proofFile = document.getElementById('pProof')?.files?.[0];
  if(!proofFile){ toast('⚠️ Please upload your MoMo payment screenshot', ''); return; }

  const btn = document.getElementById('payBtn');
  if(btn) btn.disabled = true;
  renderPayStep('proc');

  const [result] = await Promise.all([
    placeOrder({...checkoutDetails, proofFile}),
    new Promise(r => setTimeout(r, 1800))
  ]);

  if(result.error){
    toast('⚠️ Could not place order: ' + result.error, '');
    renderPayStep(3);
    return;
  }
  renderPayStep('done', result.orderCode);
}
function resetCart(){
  cart = [];
  checkoutDetails = {};
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
async function doLogin(){
  const email = document.getElementById('lEmail').value.trim();
  const pass  = document.getElementById('lPass').value.trim();
  if(!email || !pass){ toast('⚠️ Fill in all fields', ''); return; }

  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  if(error){ toast('⚠️ ' + error.message, ''); return; }

  await restoreSession();
  closeOv('authOv'); toast('🔥 Welcome back!', 'g');
}
async function doRegister(){
  const f  = document.getElementById('rFirst').value.trim();
  const l  = document.getElementById('rLast').value.trim();
  const e  = document.getElementById('rEmail').value.trim();
  const ph = document.getElementById('rPhone').value.trim();
  const pw = document.getElementById('rPass').value.trim();
  const a  = document.getElementById('rAddr').value.trim();
  if(!f || !l || !e || !ph || !pw || !a){ toast('⚠️ Fill in all required fields', ''); return; }
  if(ph.length < 9){ toast('⚠️ Enter valid 9-digit phone number', ''); return; }

  const { data, error } = await sb.auth.signUp({
    email: e, password: pw,
    options: { data: { full_name: `${f} ${l}`, phone: ph, address: a } }
  });
  if(error){ toast('⚠️ ' + error.message, ''); return; }

  if(data.session){
    await restoreSession();
    closeOv('authOv'); toast(`🎉 Welcome, ${f}! Account created.`, 'g');
  } else {
    closeOv('authOv');
    toast('📧 Check your email to confirm your account, then sign in', 'g');
  }
}
function socialLogin(p){
  toast(`⚠️ ${p} sign-in isn't set up yet`, '');
}
async function restoreSession(){
  const { data: { session } } = await sb.auth.getSession();
  if(!session){ currentUser = null; return; }

  const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
  currentUser = {
    id: session.user.id,
    name: profile?.full_name || session.user.email,
    email: session.user.email,
    phone: profile?.phone || '',
    address: profile?.address || '',
    role: profile?.role || 'customer'
  };
  applyUser();
  loadNotifications();
  subscribeNotifs();
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
  const adminLink = document.getElementById('udAdminLink');
  if(adminLink) adminLink.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
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

/* ─── NOTIFICATIONS ────────────────────────── */
async function loadNotifications(){
  if(!currentUser) return;
  const { data, error } = await sb.from('notifications').select('*').eq('user_id', currentUser.id).order('created_at', {ascending:false}).limit(20);
  if(error) return;
  renderNotifs(data || []);
}
function renderNotifs(list){
  const bell  = document.getElementById('notifBell');
  const badge = document.getElementById('notifBadge');
  if(!bell) return;
  bell.style.display = 'flex';
  const unread = list.filter(n => !n.read).length;
  badge.style.display = unread ? 'flex' : 'none';
  badge.textContent = unread;
  document.getElementById('notifList').innerHTML = list.length
    ? list.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
        <div class="ni-title">${n.title}</div>
        <div class="ni-msg">${n.message}</div>
        <div class="ni-time">${new Date(n.created_at).toLocaleString('en-GB', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
      </div>`).join('')
    : `<div class="notif-empty">No notifications yet</div>`;
}
function toggleNotifs(e){
  if(e) e.stopPropagation();
  document.getElementById('notifDropdown').classList.toggle('open');
}
async function markNotifRead(id){
  await sb.from('notifications').update({read:true}).eq('id', id);
  loadNotifications();
}
function subscribeNotifs(){
  if(!currentUser) return;
  sb.channel('notif-' + currentUser.id)
    .on('postgres_changes', {event:'INSERT', schema:'public', table:'notifications', filter:`user_id=eq.${currentUser.id}`}, payload => {
      toast('🔔 ' + payload.new.title, 'g');
      loadNotifications();
    })
    .subscribe();
}
async function doLogout(){
  await sb.auth.signOut();
  currentUser = null;
  document.getElementById('userPill').style.display   = 'none';
  document.getElementById('signinBtn').style.display  = 'flex';
  const bell = document.getElementById('notifBell');
  if(bell){ bell.style.display = 'none'; document.getElementById('notifDropdown').classList.remove('open'); }
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
