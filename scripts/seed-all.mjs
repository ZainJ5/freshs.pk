/**
 * Comprehensive, idempotent seed for Freshs.pk.
 *
 * Seeds: default Branch, Categories + Subcategories, FooterInfo, NavbarInfo,
 * Delivery/Pickup settings and one sample DeliveryArea.
 *
 * Safe to re-run: existing documents are never overwritten (uses $setOnInsert
 * and find-or-create), so admin-panel edits are preserved.
 *
 * Usage:  MONGODB_URI=mongodb://localhost:27017/freshs node scripts/seed-all.mjs
 *         (falls back to mongodb://localhost:27017/freshs if MONGODB_URI unset)
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freshs';

// ── Minimal schemas (map to the same collections the app uses) ───────────────
const Branch = mongoose.models.Branch || mongoose.model('Branch', new mongoose.Schema({
  name: String,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true }));

const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
  name: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  image: String,
}, { timestamps: true }));

const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', new mongoose.Schema({
  name: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  image: String,
}, { timestamps: true }));

const FooterInfo = mongoose.models.FooterInfo || mongoose.model('FooterInfo', new mongoose.Schema({}, { strict: false, timestamps: true }));
const NavbarInfo = mongoose.models.NavbarInfo || mongoose.model('NavbarInfo', new mongoose.Schema({}, { strict: false, timestamps: true }));
const DeliveryPickup = mongoose.models.DeliveryPickup || mongoose.model('DeliveryPickup', new mongoose.Schema({}, { strict: false, timestamps: true }));
const DeliveryArea = mongoose.models.DeliveryArea || mongoose.model('DeliveryArea', new mongoose.Schema({
  name: String, fee: Number, branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, isActive: { type: Boolean, default: true },
}, { timestamps: true }));

const PLACEHOLDER_IMG = '/logo.png';

const categoriesToSeed = [
  { name: 'Vegetables', subcategories: ['Pre-cut veggies', 'Whole veggies', 'Mix veggies'] },
  { name: 'Deals', subcategories: [] },
  { name: 'Frozen Items', subcategories: [] },
  { name: 'Cooking Paste', subcategories: [] },
  { name: 'Chutni and Pickles', subcategories: ['Chutni', 'Pickles'] },
  { name: 'Chicken', subcategories: [] },
  { name: 'Grocery Items', subcategories: ['Recipe Mix', 'Plain Spices', 'Cooking oil', 'Pulses & Rice'] },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI.replace(/\/\/[^@]*@/, '//'));

  // 1. Default branch ────────────────────────────────────────────────────────
  let branch = await Branch.findOne({});
  if (!branch) {
    branch = await Branch.create({ name: 'Freshs.pk - Nazimabad', isDefault: true });
    console.log('Created branch:', branch.name);
  } else {
    if (!branch.isDefault) { branch.isDefault = true; await branch.save(); }
    console.log('Using existing branch:', branch.name);
  }

  // 2. Categories + subcategories ─────────────────────────────────────────────
  for (const cat of categoriesToSeed) {
    let category = await Category.findOne({ name: cat.name, branch: branch._id });
    if (!category) {
      category = await Category.create({ name: cat.name, branch: branch._id, image: PLACEHOLDER_IMG });
      console.log('  + category:', cat.name);
    }
    for (const sub of cat.subcategories) {
      const exists = await Subcategory.findOne({ name: sub, category: category._id, branch: branch._id });
      if (!exists) {
        await Subcategory.create({ name: sub, category: category._id, branch: branch._id, image: PLACEHOLDER_IMG });
        console.log('      - subcategory:', sub);
      }
    }
  }

  // 3. Footer info ────────────────────────────────────────────────────────────
  await FooterInfo.updateOne({}, { $setOnInsert: {
    restaurant: {
      name: 'Freshs.pk',
      address: 'Nazimabad No.5, Karachi',
      description: 'Freshs.pk – Your one-stop online grocery store, delivering farm-fresh quality, unbeatable convenience, and savings right to your doorstep!',
      establishedYear: 2024,
      mapsLink: 'https://www.google.com/maps/search/?api=1&query=Nazimabad+No.5+Karachi',
    },
    contact: {
      uanNumber: '+92 336 2069023 | +92 317 2729591',
      whatsappNumbers: ['+92 336 2069023'],
      openingHours: '09:00 AM – 12:00 AM',
      email: 'contact@freshs.pk',
    },
    appLinks: { appStore: '', googlePlay: '' },
    developer: { name: 'ZABS Creatives', contact: '923142300331' },
    sliderImages: [],
  } }, { upsert: true });
  console.log('Footer info ensured');

  // 4. Navbar info ────────────────────────────────────────────────────────────
  await NavbarInfo.updateOne({}, { $setOnInsert: {
    restaurant: { name: 'Freshs.pk', openingHours: '09:00 AM – 12:00 AM' },
    delivery: { time: '30-45 mins', minimumOrder: 'Rs. 500 Only' },
    socialLinks: [
      { platform: 'whatsapp', icon: '/icons/whatsapp.svg', url: 'https://wa.me/923362069023' },
      { platform: 'facebook', icon: '/icons/facebook.svg', url: 'https://www.facebook.com/profile.php?id=100083161330618' },
      { platform: 'instagram', icon: '/icons/instagram.svg', url: 'https://www.instagram.com/freshs.pk/' },
    ],
  } }, { upsert: true });
  console.log('Navbar info ensured');

  // 5. Delivery / Pickup settings ─────────────────────────────────────────────
  await DeliveryPickup.updateOne({}, { $setOnInsert: {
    allowDelivery: true,
    allowPickup: true,
    defaultOption: 'none',
    deliveryMessage: 'Get your fresh groceries delivered to your doorstep',
    pickupMessage: 'Pick up your order at our store',
    defaultBranchId: branch._id,
  } }, { upsert: true });
  console.log('Delivery/pickup settings ensured');

  // 6. Sample delivery area (only if none exist) ──────────────────────────────
  const areaCount = await DeliveryArea.countDocuments({});
  if (areaCount === 0) {
    await DeliveryArea.create({ name: 'Nazimabad', fee: 100, branch: branch._id, isActive: true });
    console.log('Created sample delivery area "Nazimabad" (fee Rs.100 – adjust in admin)');
  } else {
    console.log(`Delivery areas already present (${areaCount}) – left untouched`);
  }

  console.log('\n✅ Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => { console.error('Seed error:', err); process.exit(1); });
