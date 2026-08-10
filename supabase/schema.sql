-- ═══════════════════════════════════════════════════════════
-- SNACKS BY SNACKS — Supabase schema + Row Level Security
-- Paste this whole file into Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════

-- ─── PROFILES (extends auth.users with app fields + role) ───
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  address     text,
  role        text not null default 'customer' check (role in ('customer','admin','owner')),
  created_at  timestamptz not null default now()
);

-- auto-create a profile row whenever someone signs up via Supabase Auth
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, address)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper used by RLS policies below (security definer bypasses RLS
-- recursion when checking the caller's own role). 'owner' counts as
-- an admin too — it's a superset with one extra privilege (Manage Users).
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','owner')
  );
$$ language sql security definer stable set search_path = public;

-- only the owner can create/revoke other admins
create or replace function public.is_owner()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$ language sql security definer stable set search_path = public;

-- ─── PRODUCTS ─────────────────────────────────────────────
create table public.products (
  id          bigint generated always as identity primary key,
  name        text not null,
  category    text not null,
  emoji       text,
  image_url   text,
  price       integer not null,
  weight      text,
  calories    integer,
  protein     text,
  fat         text,
  carbs       text,
  rating      numeric(2,1) default 4.5,
  sold        integer default 0,
  description text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index products_category_idx on public.products(category);

-- ─── ORDERS ───────────────────────────────────────────────
create table public.orders (
  id                 bigint generated always as identity primary key,
  order_code         text not null unique,
  user_id            uuid references auth.users(id),
  customer_name      text not null,
  email              text,
  phone              text not null,
  address            text not null,
  note               text,
  subtotal           integer not null,
  delivery_fee       integer not null default 500,
  total              integer not null,
  payment_method     text not null default 'ussd',
  payment_proof_path text,
  status             text not null default 'pending'
                     check (status in ('pending','confirmed','preparing','delivered','cancelled')),
  created_at         timestamptz not null default now()
);

create index orders_status_idx  on public.orders(status);
create index orders_user_idx    on public.orders(user_id);

create table public.order_items (
  id         bigint generated always as identity primary key,
  order_id   bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id),
  name       text not null,
  price      integer not null,
  qty        integer not null
);

create index order_items_order_idx on public.order_items(order_id);

-- ─── BOOKINGS (Private Plate chef bookings) ──────────────
create table public.bookings (
  id                    bigint generated always as identity primary key,
  user_id               uuid references auth.users(id),
  service_type          text not null,
  event_date            date not null,
  guest_count           integer not null,
  preferred_chef        text,
  event_location        text not null,
  special_requirements  text,
  status                text not null default 'pending'
                        check (status in ('pending','confirmed','completed','cancelled')),
  created_at            timestamptz not null default now()
);

create index bookings_status_idx on public.bookings(status);
create index bookings_user_idx   on public.bookings(user_id);

-- ─── NOTIFICATIONS (order confirmed/cancelled alerts) ────
create table public.notifications (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    bigint references public.orders(id) on delete cascade,
  title       text not null,
  message     text not null,
  type        text not null default 'info',
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id);

-- enables the in-app bell to update live without a page refresh
alter publication supabase_realtime add table public.notifications;

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.bookings    enable row level security;
alter table public.notifications enable row level security;

-- profiles: read/update your own row; admins read everyone's
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
-- only the owner can change someone else's role (grant/revoke admin)
create policy "profiles_update_owner" on public.profiles
  for update using (public.is_owner());

-- products: public reads active items; admins read everything and write
create policy "products_select_public" on public.products
  for select using (active = true or public.is_admin());
create policy "products_write_admin" on public.products
  for insert with check (public.is_admin());
create policy "products_update_admin" on public.products
  for update using (public.is_admin());
create policy "products_delete_admin" on public.products
  for delete using (public.is_admin());

-- orders: anyone can place one (guest or signed-in); you can only
-- read your own, admins read/update all
create policy "orders_insert_anyone" on public.orders
  for insert with check (user_id is null or user_id = auth.uid());
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());

-- order_items: follow the parent order's visibility/ownership
create policy "order_items_insert_with_order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id is null or o.user_id = auth.uid())
    )
  );
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- bookings: same shape as orders
create policy "bookings_insert_anyone" on public.bookings
  for insert with check (user_id is null or user_id = auth.uid());
create policy "bookings_select_own_or_admin" on public.bookings
  for select using (auth.uid() = user_id or public.is_admin());
create policy "bookings_update_admin" on public.bookings
  for update using (public.is_admin());

-- notifications: you only ever see/update your own; only admins create them
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);
create policy "notifications_insert_admin" on public.notifications
  for insert with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════
-- SEED PRODUCTS (the same 18 items currently hardcoded in script.js)
-- ═══════════════════════════════════════════════════════════
insert into public.products (name, category, emoji, image_url, price, weight, calories, protein, fat, carbs, rating, sold, description) values
('Beef Burger','burgers','🍔','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=380&fit=crop&auto=format',3500,'1 serving',520,'28g','28g','42g',4.9,680,'Juicy beef patty grilled to perfection, layered with crisp lettuce, fresh tomato, pickles, and our bold signature sauce on a toasted sesame bun. A true classic.'),
('Chicken Burger','burgers','🍔','https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&h=380&fit=crop&auto=format',3500,'1 serving',480,'32g','22g','40g',4.8,590,'Tender grilled chicken fillet with a golden crispy coating, fresh coleslaw, and spicy sriracha mayo on a brioche bun. Bold flavour in every bite.'),
('Fish Burger','burgers','🍔','https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&h=380&fit=crop&auto=format',3500,'1 serving',450,'25g','20g','44g',4.7,340,'Crispy battered fish fillet with fresh lettuce, homemade tartare sauce, and a squeeze of lemon on a soft bun. Light, flavorful and incredibly satisfying.'),
('Beef Sandwich','sandwiches','🥪','https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&h=380&fit=crop&auto=format',3500,'1 serving',490,'30g','24g','38g',4.8,460,'Sliced seasoned beef with caramelized onions, melted cheese, and fresh greens packed in toasted artisan bread. Rich, hearty and deeply satisfying.'),
('Chicken Sandwich','sandwiches','🥪','https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=500&h=380&fit=crop&auto=format',3500,'1 serving',430,'28g','18g','40g',4.7,510,'Grilled chicken strips with avocado, tomato, crisp lettuce, and honey mustard pressed in warm toasted bread. Fresh, clean and full of flavour.'),
('Fish Sandwich','sandwiches','🥪','https://images.unsplash.com/photo-1485704686097-ed47f7263ca4?w=500&h=380&fit=crop&auto=format',3500,'1 serving',410,'24g','16g','42g',4.6,280,'Flaky seasoned fish with fresh cucumber, ripe tomato, and a creamy dill sauce tucked in soft toasted bread. A lighter and refreshing sandwich option.'),
('Beef Shawarma','shawarmas','🌯','https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=380&fit=crop&auto=format',3500,'1 serving',550,'32g','26g','48g',4.9,720,'Marinated slow-cooked beef strips with garlic sauce, pickled veggies, and fresh tomatoes wrapped in warm flatbread. Authentic bold Middle Eastern flavours.'),
('Chicken Shawarma','shawarmas','🌯','https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&h=380&fit=crop&auto=format',3500,'1 serving',500,'35g','20g','46g',4.9,850,'Tender spiced chicken with hummus, tabbouleh, pickled turnips, and garlic sauce in a warm toasted wrap. Our all-time best-seller — always fresh.'),
('Fish Wrap','shawarmas','🌯','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=380&fit=crop&auto=format',3500,'1 serving',420,'26g','14g','46g',4.6,310,'Lightly seasoned grilled fish with fresh veggies, shredded cabbage, lemon herb sauce and a hint of chili wrapped in a soft warm tortilla. Clean and delicious.'),
('Beef Quesadilla','quesadillas','🫓','https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=380&fit=crop&auto=format',4000,'1 serving',580,'30g','30g','50g',4.8,390,'Crispy golden tortilla packed with seasoned beef, melted stretchy cheese, jalapeños and sour cream. Grilled until perfectly crunchy outside and gooey inside.'),
('Chicken Quesadilla','quesadillas','🫓','https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=380&fit=crop&auto=format',4000,'1 serving',540,'34g','26g','48g',4.9,460,'Golden crispy tortilla filled with grilled chicken, stretchy mozzarella, roasted peppers and smoky chipotle sauce. A flavour explosion in every single bite.'),
('Fish Quesadilla','quesadillas','🫓','https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&h=380&fit=crop&auto=format',4000,'1 serving',490,'28g','22g','48g',4.6,240,'Crispy tortilla with flaked seasoned fish, melted cheese, caramelized onions and a squeeze of fresh lime. Light yet incredibly flavourful and satisfying.'),
('Beef Tacos','tacos','🌮','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=380&fit=crop&auto=format',4000,'2 pieces',520,'28g','24g','46g',4.9,610,'Two soft corn tacos loaded with spiced minced beef, fresh pico de gallo, cilantro, shredded cheese, and a drizzle of hot sauce. Absolute taco heaven.'),
('Chicken Tacos','tacos','🌮','https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&h=380&fit=crop&auto=format',4000,'2 pieces',480,'32g','18g','44g',4.8,540,'Two soft tacos filled with grilled spiced chicken, charred corn, fresh avocado, lime slaw, and salsa verde. A fiesta of fresh, bold and vibrant flavours.'),
('Fish Tacos','tacos','🌮','https://images.unsplash.com/photo-1611250188496-e966043a0629?w=500&h=380&fit=crop&auto=format',4000,'2 pieces',430,'26g','16g','46g',4.7,360,'Two crispy battered fish tacos with mango salsa, pickled cabbage, chipotle crema and fresh jalapeños in warm soft tortillas. A true coastal flavour experience.'),
('Pancakes','crepes','🥞','https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500&h=380&fit=crop&auto=format',1000,'1 serving',350,'8g','12g','52g',4.7,420,'Fluffy golden pancakes stacked high and drizzled with maple syrup, topped with fresh fruits and a dusting of powdered sugar. The ultimate sweet treat any time.'),
('Crepes','crepes','🥞','https://images.unsplash.com/photo-1519676867240-f03562e64548?w=500&h=380&fit=crop&auto=format',700,'1 serving',280,'6g','10g','42g',4.6,380,'Thin, delicate French-style crepes served with a choice of sweet or savoury fillings. Light, elegant and made completely fresh to order.'),
('Fries','crepes','🍟','https://images.unsplash.com/photo-1573080496219-bb964701c394?w=500&h=380&fit=crop&auto=format',1000,'1 serving',312,'4g','15g','40g',4.8,920,'Crispy golden fries seasoned with our special spice blend, perfectly salted and fried to a beautiful golden crunch. The ultimate side dish or standalone snack.');

-- ═══════════════════════════════════════════════════════════
-- STORAGE — bucket for uploaded product photos (admin dashboard
-- "Upload Image" option). Public read so the storefront can
-- display them; only admins can upload/replace/remove.
-- ═══════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- STORAGE — private bucket for MoMo payment screenshots. Anyone
-- checking out can upload one (guest or signed-in); only admins
-- can view them (that's what makes it "proof" review-only).
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy "payment_proofs_insert_anyone" on storage.objects
  for insert with check (bucket_id = 'payment-proofs');
create policy "payment_proofs_select_admin" on storage.objects
  for select using (bucket_id = 'payment-proofs' and public.is_admin());

-- ═══════════════════════════════════════════════════════════
-- ALREADY RAN AN EARLIER VERSION OF THIS FILE (without the
-- profiles.email column)? Run this once instead of the whole
-- script again:
-- ═══════════════════════════════════════════════════════════
-- alter table public.profiles add column if not exists email text;
-- update public.profiles p set email = u.email from auth.users u where p.id = u.id and p.email is null;

-- ═══════════════════════════════════════════════════════════
-- MAKE YOURSELF THE OWNER (run this AFTER you sign up once
-- through the site with the account you want to use for the
-- dashboard — replace the email below with that account's email)
-- The owner is the only role that can create/revoke other admins
-- from the Manage Users page. Everyone else you promote should
-- get 'admin', not 'owner'.
-- ═══════════════════════════════════════════════════════════
-- update public.profiles set role = 'owner'
-- where id = (select id from auth.users where email = 'you@example.com');
