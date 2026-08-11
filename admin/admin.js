/* ═══════════════════════════════════════════════
   SNACKS BY SNACKS — ADMIN DASHBOARD
   admin.js
═══════════════════════════════════════════════ */

/* ─── GUARD + SHARED ───────────────────────── */
async function guardAdmin(){
  const { data: { session } } = await sb.auth.getSession();
  if(!session){ window.location.href = 'index.html'; return null; }

  const { data: profile, error } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
  if(error || !profile || !['admin','owner'].includes(profile.role)){
    await sb.auth.signOut();
    window.location.href = 'index.html';
    return null;
  }

  const asUser = document.getElementById('asUser');
  if(asUser) asUser.innerHTML = `<strong>${profile.full_name || 'Admin'}</strong>${profile.email || session.user.email}`;

  return { session, profile };
}
async function adminLogout(){
  await sb.auth.signOut();
  window.location.href = 'index.html';
}
function toast(msg, type = ''){
  const el = document.getElementById('toast');
  if(!el) return;
  el.className = 'toast' + (type ? ' ' + type : '');
  document.getElementById('toastMsg').textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}
function togPwdAdmin(id, btn){
  const el   = document.getElementById(id);
  const show = el.type === 'text';
  el.type    = show ? 'password' : 'text';
  btn.textContent = show ? '👁️' : '🙈';
}
function fmtMoney(n){ return (n || 0).toLocaleString() + ' FRW'; }
function fmtDate(d){
  return new Date(d).toLocaleString('en-GB', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
}
function startOfTodayISO(){
  const d = new Date(); d.setHours(0,0,0,0); return d.toISOString();
}

/* ─── LOGIN PAGE ───────────────────────────── */
async function adminLogin(){
  const email = document.getElementById('laEmail').value.trim();
  const pass  = document.getElementById('laPass').value.trim();
  if(!email || !pass){ toast('⚠️ Fill in all fields', ''); return; }

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  if(error){ toast('⚠️ ' + error.message, ''); return; }

  const { data: profile } = await sb.from('profiles').select('role').eq('id', data.user.id).single();
  if(!profile || !['admin','owner'].includes(profile.role)){
    await sb.auth.signOut();
    toast('⛔ This account is not an admin', '');
    return;
  }
  window.location.href = 'dashboard.html';
}

/* ─── DASHBOARD ────────────────────────────── */
function statCard(icon, num, label){
  return `<div class="stat-card"><div class="sc-icon">${icon}</div><div class="sc-num">${num}</div><div class="sc-label">${label}</div></div>`;
}
async function initDashboard(){
  const [totalOrders, todayOrders, pendingOrders, pendingBookings, totalProducts, totalCustomers, recent] = await Promise.all([
    sb.from('orders').select('*', {count:'exact', head:true}),
    sb.from('orders').select('total').gte('created_at', startOfTodayISO()),
    sb.from('orders').select('*', {count:'exact', head:true}).eq('status','pending'),
    sb.from('bookings').select('*', {count:'exact', head:true}).eq('status','pending'),
    sb.from('products').select('*', {count:'exact', head:true}),
    sb.from('profiles').select('*', {count:'exact', head:true}),
    sb.from('orders').select('*').order('created_at',{ascending:false}).limit(6)
  ]);

  const todayRevenue = (todayOrders.data || []).reduce((a,o) => a + o.total, 0);

  document.getElementById('statGrid').innerHTML = [
    statCard('🧾', totalOrders.count || 0, 'Total Orders'),
    statCard('💰', todayRevenue.toLocaleString() + ' FRW', "Today's Revenue"),
    statCard('⏳', pendingOrders.count || 0, 'Pending Orders'),
    statCard('📅', pendingBookings.count || 0, 'Pending Bookings'),
    statCard('🍔', totalProducts.count || 0, 'Menu Items'),
    statCard('👥', totalCustomers.count || 0, 'Customers'),
  ].join('');

  const rows = recent.data || [];
  document.getElementById('recentOrders').innerHTML = rows.length
    ? rows.map(o => `
      <tr>
        <td>${o.order_code}</td>
        <td>${o.customer_name}</td>
        <td>${fmtMoney(o.total)}</td>
        <td><span class="badge ${o.status}">${o.status}</span></td>
        <td>${fmtDate(o.created_at)}</td>
      </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">No orders yet</td></tr>`;
}

/* ─── ORDERS ───────────────────────────────── */
let ordersFilter = 'all';
let ordersCache  = [];
async function loadOrders(){
  let q = sb.from('orders').select('*, order_items(*)').order('created_at', {ascending:false});
  if(ordersFilter !== 'all') q = q.eq('status', ordersFilter);
  const { data, error } = await q;
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  ordersCache = data || [];
  renderOrdersTable(ordersCache);
}
function renderOrdersTable(orders){
  const body = document.getElementById('ordersTableBody');
  if(!orders.length){
    body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No orders found</td></tr>`;
    return;
  }
  body.innerHTML = orders.map(o => `
    <tr>
      <td>${o.order_code}</td>
      <td>${o.customer_name}<br><small style="color:var(--text-muted)">${o.phone}</small></td>
      <td>${(o.order_items || []).map(it => `${it.name} ×${it.qty}`).join(', ')}</td>
      <td>${fmtMoney(o.total)}</td>
      <td>${o.payment_proof_path
        ? `<button class="btn-admin ghost sm" onclick="viewProof('${o.payment_proof_path}')"><i class="fas fa-receipt"></i> View</button>`
        : `<span style="color:var(--text-muted);font-size:.78rem">None</span>`}</td>
      <td><span class="badge ${o.status}">${o.status}</span></td>
      <td>${fmtDate(o.created_at)}</td>
      <td>
        <select class="mini-select" onchange="updateOrderStatus(${o.id}, this.value)">
          ${['pending','confirmed','preparing','delivered','cancelled'].map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>`).join('');
}
async function viewProof(path){
  const { data, error } = await sb.storage.from('payment-proofs').createSignedUrl(path, 60);
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  window.open(data.signedUrl, '_blank');
}
async function updateOrderStatus(id, status){
  const order = ordersCache.find(o => o.id === id);
  const { error } = await sb.from('orders').update({ status }).eq('id', id);
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  toast('✅ Order updated', 'g');

  if(order && (status === 'confirmed' || status === 'cancelled')){
    notifyCustomer(order, status);
  }
  loadOrders();
}

/* ─── ORDER NOTIFICATIONS (in-app + email) ────────────── */
async function notifyCustomer(order, status){
  const isConfirmed = status === 'confirmed';
  const title   = isConfirmed ? `✅ Order ${order.order_code} confirmed` : `❌ Order ${order.order_code} cancelled`;
  const message = isConfirmed
    ? `Your payment was verified. We're now preparing your order!`
    : `We couldn't verify your payment for this order. Please contact us or place a new order.`;

  if(order.user_id){
    const { error } = await sb.from('notifications').insert({
      user_id: order.user_id, order_id: order.id, title, message,
      type: isConfirmed ? 'order_confirmed' : 'order_cancelled'
    });
    if(error) console.error(error);
  }

  if(order.email) sendOrderEmail(order, isConfirmed, title, message);
}
function sendOrderEmail(order, isConfirmed, title, message){
  if(typeof emailjs === 'undefined') return;
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: order.email,
    to_name: order.customer_name,
    order_code: order.order_code,
    status_title: title,
    status_message: message
  }).catch(err => console.error('EmailJS error:', err));
}
function filterOrders(status){
  ordersFilter = status;
  document.querySelectorAll('#ordersFilterTabs .f-tab').forEach(el => el.classList.toggle('active', el.dataset.status === status));
  loadOrders();
}
async function initOrders(){
  ordersFilter = 'all';
  await loadOrders();
}

/* ─── PRODUCTS ─────────────────────────────── */
let productsCache = [];
let editingProductId = null;
let imageMode = 'url';
let currentImageUrl = '';
async function loadProductsAdmin(){
  const { data, error } = await sb.from('products').select('*').order('id');
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  productsCache = data || [];
  renderProductsTable(productsCache);
}
function renderProductsTable(products){
  const body = document.getElementById('productsTableBody');
  if(!products.length){
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">No products yet</td></tr>`;
    return;
  }
  body.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image_url || ''}" alt="${p.name}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;background:var(--bg-input)" onerror="this.style.visibility='hidden'"/></td>
      <td>${p.emoji || ''} ${p.name}</td>
      <td>${p.category}</td>
      <td>${fmtMoney(p.price)}</td>
      <td><span class="badge ${p.active ? 'delivered' : 'cancelled'}">${p.active ? 'Active' : 'Hidden'}</span></td>
      <td>
        <button class="btn-admin ghost sm" onclick="openProductForm(${p.id})"><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-admin danger sm" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i> Delete</button>
      </td>
    </tr>`).join('');
}
function openProductForm(id){
  editingProductId = id || null;
  const p = id ? productsCache.find(x => x.id === id) : null;
  document.getElementById('pfTitle').textContent = id ? 'Edit Product' : 'Add Product';
  document.getElementById('pfName').value     = p?.name || '';
  document.getElementById('pfCategory').value = p?.category || 'burgers';
  document.getElementById('pfEmoji').value    = p?.emoji || '';
  document.getElementById('pfImage').value    = p?.image_url || '';
  document.getElementById('pfPrice').value    = p?.price || '';
  document.getElementById('pfWeight').value   = p?.weight || '';
  document.getElementById('pfCalories').value = p?.calories || '';
  document.getElementById('pfProtein').value  = p?.protein || '';
  document.getElementById('pfFat').value      = p?.fat || '';
  document.getElementById('pfCarbs').value    = p?.carbs || '';
  document.getElementById('pfRating').value   = p?.rating || 4.5;
  document.getElementById('pfSold').value     = p?.sold || 0;
  document.getElementById('pfDesc').value     = p?.description || '';
  document.getElementById('pfActive').checked = p ? p.active : true;

  currentImageUrl = p?.image_url || '';
  document.getElementById('pfImageFile').value = '';
  setImageMode('url');
  updatePreview(currentImageUrl);

  document.getElementById('productOv').classList.add('open');
}
function closeProductForm(){ document.getElementById('productOv').classList.remove('open'); }

function setImageMode(mode){
  imageMode = mode;
  document.querySelectorAll('.img-mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  document.getElementById('pfImageUrlWrap').style.display  = mode === 'url'    ? 'block' : 'none';
  document.getElementById('pfImageFileWrap').style.display = mode === 'upload' ? 'block' : 'none';
}
function updatePreview(url){
  const wrap = document.getElementById('pfPreviewWrap');
  const img  = document.getElementById('pfPreview');
  if(url){ img.src = url; wrap.classList.add('show'); }
  else { img.src = ''; wrap.classList.remove('show'); }
}
function previewSelectedFile(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => updatePreview(e.target.result);
  reader.readAsDataURL(file);
}
async function uploadProductImage(file){
  const ext  = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await sb.storage.from('product-images').upload(path, file);
  if(error) return { error: error.message };
  const { data } = sb.storage.from('product-images').getPublicUrl(path);
  return { url: data.publicUrl };
}

async function saveProduct(){
  let imageUrl = currentImageUrl;

  if(imageMode === 'url'){
    imageUrl = document.getElementById('pfImage').value.trim();
  } else {
    const file = document.getElementById('pfImageFile').files[0];
    if(file){
      const upload = await uploadProductImage(file);
      if(upload.error){ toast('⚠️ Image upload failed: ' + upload.error, ''); return; }
      imageUrl = upload.url;
    }
    // no new file chosen while in upload mode → keep the existing image
  }

  const payload = {
    name:        document.getElementById('pfName').value.trim(),
    category:    document.getElementById('pfCategory').value,
    emoji:       document.getElementById('pfEmoji').value.trim(),
    image_url:   imageUrl,
    price:       parseInt(document.getElementById('pfPrice').value, 10),
    weight:      document.getElementById('pfWeight').value.trim(),
    calories:    parseInt(document.getElementById('pfCalories').value, 10) || null,
    protein:     document.getElementById('pfProtein').value.trim(),
    fat:         document.getElementById('pfFat').value.trim(),
    carbs:       document.getElementById('pfCarbs').value.trim(),
    rating:      parseFloat(document.getElementById('pfRating').value) || 4.5,
    sold:        parseInt(document.getElementById('pfSold').value, 10) || 0,
    description: document.getElementById('pfDesc').value.trim(),
    active:      document.getElementById('pfActive').checked
  };
  if(!payload.name || !payload.category || !payload.price){ toast('⚠️ Fill in name, category, and price', ''); return; }

  const { error } = editingProductId
    ? await sb.from('products').update(payload).eq('id', editingProductId)
    : await sb.from('products').insert(payload);

  if(error){ toast('⚠️ ' + error.message, ''); return; }
  toast('✅ Product saved', 'g');
  closeProductForm();
  loadProductsAdmin();
}
async function deleteProduct(id){
  if(!confirm('Delete this product? This cannot be undone.')) return;
  const { error } = await sb.from('products').delete().eq('id', id);
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  toast('🗑️ Product deleted', 'g');
  loadProductsAdmin();
}
async function initProducts(){
  await loadProductsAdmin();
}

/* ─── BOOKINGS ─────────────────────────────── */
let bookingsFilter = 'all';
async function loadBookings(){
  let q = sb.from('bookings').select('*').order('created_at', {ascending:false});
  if(bookingsFilter !== 'all') q = q.eq('status', bookingsFilter);
  const { data, error } = await q;
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  renderBookingsTable(data || []);
}
function renderBookingsTable(bookings){
  const body = document.getElementById('bookingsTableBody');
  if(!bookings.length){
    body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">No bookings found</td></tr>`;
    return;
  }
  body.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.service_type}</td>
      <td>${b.event_date}</td>
      <td>${b.guest_count}</td>
      <td>${b.event_location}</td>
      <td>${b.preferred_chef || 'Any'}</td>
      <td><span class="badge ${b.status}">${b.status}</span></td>
      <td>
        <select class="mini-select" onchange="updateBookingStatus(${b.id}, this.value)">
          ${['pending','confirmed','completed','cancelled'].map(s => `<option value="${s}" ${s === b.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>`).join('');
}
async function updateBookingStatus(id, status){
  const { error } = await sb.from('bookings').update({ status }).eq('id', id);
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  toast('✅ Booking updated', 'g');
  loadBookings();
}
function filterBookings(status){
  bookingsFilter = status;
  document.querySelectorAll('#bookingsFilterTabs .f-tab').forEach(el => el.classList.toggle('active', el.dataset.status === status));
  loadBookings();
}
async function initBookings(){
  bookingsFilter = 'all';
  await loadBookings();
}

/* ─── CUSTOMERS ────────────────────────────── */
async function initCustomers(){
  const [{ data: profiles, error }, { data: orders }] = await Promise.all([
    sb.from('profiles').select('*').order('created_at', {ascending:false}),
    sb.from('orders').select('user_id, total')
  ]);
  if(error){ toast('⚠️ ' + error.message, ''); return; }

  const orderStats = {};
  (orders || []).forEach(o => {
    if(!o.user_id) return;
    if(!orderStats[o.user_id]) orderStats[o.user_id] = {count:0, total:0};
    orderStats[o.user_id].count++;
    orderStats[o.user_id].total += o.total;
  });

  const body = document.getElementById('customersTableBody');
  if(!profiles || !profiles.length){
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">No customers yet</td></tr>`;
    return;
  }
  body.innerHTML = profiles.map(p => {
    const stats = orderStats[p.id] || {count:0, total:0};
    const badgeClass = p.role === 'owner' ? 'owner' : p.role === 'admin' ? 'preparing' : 'delivered';
    return `
    <tr>
      <td>${p.full_name || '—'}</td>
      <td>${p.email || '—'}</td>
      <td>${p.phone || '—'}</td>
      <td>${p.address || '—'}</td>
      <td>${stats.count} orders · ${fmtMoney(stats.total)}</td>
      <td><span class="badge ${badgeClass}">${p.role}</span></td>
    </tr>`;
  }).join('');
}

/* ─── MANAGE USERS (owner only) ────────────── */
async function initManageUsers(ctx){
  if(!ctx || ctx.profile.role !== 'owner'){
    window.location.href = 'dashboard.html';
    return;
  }
  await loadManageUsers();
}
async function loadManageUsers(){
  const { data, error } = await sb.from('profiles').select('*').in('role', ['admin','owner']).order('created_at');
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  const body = document.getElementById('adminsTableBody');
  body.innerHTML = data.map(p => `
    <tr>
      <td>${p.full_name || '—'}</td>
      <td>${p.email || '—'}</td>
      <td><span class="badge ${p.role === 'owner' ? 'owner' : 'preparing'}">${p.role}</span></td>
      <td>${p.role === 'owner'
        ? `<span style="color:var(--text-muted);font-size:.78rem">—</span>`
        : `<button class="btn-admin danger sm" onclick="revokeAdmin('${p.id}')"><i class="fas fa-user-slash"></i> Revoke</button>`}</td>
    </tr>`).join('');
}
async function createAdminUser(){
  const full_name = document.getElementById('nuName').value.trim();
  const email      = document.getElementById('nuEmail').value.trim();
  const password   = document.getElementById('nuPassword').value.trim();
  if(!email || !password){ toast('⚠️ Fill in email and password', ''); return; }
  if(password.length < 6){ toast('⚠️ Password must be at least 6 characters', ''); return; }

  const { data: { session } } = await sb.auth.getSession();
  const btn = document.getElementById('nuSubmitBtn');
  if(btn) btn.disabled = true;

  try{
    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-admin-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password, full_name })
    });
    const result = await res.json();
    if(!res.ok){ toast('⚠️ ' + (result.error || 'Could not create admin'), ''); return; }

    toast('✅ Admin account created', 'g');
    document.getElementById('nuName').value = '';
    document.getElementById('nuEmail').value = '';
    document.getElementById('nuPassword').value = '';
    loadManageUsers();
  }catch(err){
    toast('⚠️ ' + err.message, '');
  }finally{
    if(btn) btn.disabled = false;
  }
}
async function promoteToAdmin(){
  const email = document.getElementById('puEmail').value.trim();
  if(!email){ toast('⚠️ Enter an email', ''); return; }

  const { data: profile, error } = await sb.from('profiles').select('id, role').eq('email', email).single();
  if(error || !profile){ toast('⚠️ No account found with that email', ''); return; }
  if(profile.role !== 'customer'){ toast('⚠️ That account is already ' + profile.role, ''); return; }

  const { error: updErr } = await sb.from('profiles').update({ role: 'admin' }).eq('id', profile.id);
  if(updErr){ toast('⚠️ ' + updErr.message, ''); return; }

  toast('✅ Promoted to admin', 'g');
  document.getElementById('puEmail').value = '';
  loadManageUsers();
}
async function revokeAdmin(id){
  if(!confirm('Revoke admin access for this user? They will become a regular customer.')) return;
  const { error } = await sb.from('profiles').update({ role: 'customer' }).eq('id', id);
  if(error){ toast('⚠️ ' + error.message, ''); return; }
  toast('✅ Admin access revoked', 'g');
  loadManageUsers();
}

/* ─── PAGE BOOT ────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if(document.getElementById('loginPage')) return; // admin/index.html (login page) handles itself

  const ctx = await guardAdmin();
  if(!ctx) return;

  const navManageUsers = document.getElementById('navManageUsers');
  if(navManageUsers) navManageUsers.style.display = ctx.profile.role === 'owner' ? 'flex' : 'none';

  if(document.getElementById('statGrid'))          await initDashboard();
  if(document.getElementById('ordersTableBody'))    await initOrders();
  if(document.getElementById('productsTableBody'))  await initProducts();
  if(document.getElementById('bookingsTableBody'))  await initBookings();
  if(document.getElementById('customersTableBody')) await initCustomers();
  if(document.getElementById('adminsTableBody'))    await initManageUsers(ctx);
});
