import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

// Minimal schemas for seeding
const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
const Branch = mongoose.models.Branch || mongoose.model('Branch', BranchSchema);

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  image: { type: String, default: '/placeholder.jpg' }
});
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const SubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String, default: '/placeholder.jpg' }
});
const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', SubcategorySchema);

const categoriesToSeed = [
  {
    name: 'Vegetables',
    subcategories: ['Pre-cut veggies', 'Whole veggies', 'Mix veggies']
  },
  {
    name: 'Deals',
    subcategories: []
  },
  {
    name: 'Frozen Items',
    subcategories: []
  },
  {
    name: 'Cooking Paste',
    subcategories: []
  },
  {
    name: 'Chutni and Pickles',
    subcategories: ['Chutni', 'Pickles']
  },
  {
    name: 'Chicken',
    subcategories: []
  },
  {
    name: 'Grocery Items',
    subcategories: ['Recipe Mix', 'Plain Spices', 'Cooking oil', 'Pulses & Rice']
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get branch
    let branchId = process.argv[2];
    if (!branchId) {
      console.log('No branch ID provided. Looking for an existing branch...');
      let branch = await Branch.findOne({});
      if (!branch) {
        console.log('No branch found. Creating a default branch...');
        branch = await Branch.create({ name: 'Freshs.pk Main Branch' });
      }
      branchId = branch._id;
    }
    console.log(`Using branch ID: ${branchId}`);

    // Create Categories and Subcategories
    for (const cat of categoriesToSeed) {
      let category = await Category.findOne({ name: cat.name, branch: branchId });
      if (!category) {
        category = await Category.create({ name: cat.name, branch: branchId, image: '/placeholder.jpg' });
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }

      for (const sub of cat.subcategories) {
        let subcategory = await Subcategory.findOne({ name: sub, category: category._id, branch: branchId });
        if (!subcategory) {
          await Subcategory.create({ name: sub, category: category._id, branch: branchId, image: '/placeholder.jpg' });
          console.log(`  Created subcategory: ${sub}`);
        } else {
          console.log(`  Subcategory already exists: ${sub}`);
        }
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seed();
