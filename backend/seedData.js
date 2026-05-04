const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Clear existing data (optional, but good for a fresh start)
    console.log('Clearing old data...');
    await User.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();

    // 1. Create Admin User
    console.log('Creating Admin User...');
    const adminUser = new User({
      name: 'Admin OursFit',
      email: 'admin@oursfit.com',
      password: 'adminpassword', // Will be hashed by pre-save hook
      role: 'admin',
      isMember: true,
    });
    await adminUser.save();
    console.log('Admin user created: admin@oursfit.com / adminpassword');

    // 2. Create Sample Products
    console.log('Creating Products...');
    const products = [
      {
        name: 'Oversized Anime Print T-Shirt',
        description: 'Premium quality oversized t-shirt with aesthetic anime back print.',
        price: 899,
        images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800'],
        sizes: ['M', 'L', 'XL'],
        stock: 50,
        category: 'T-Shirts',
        tags: ['oversized', 'anime', 'streetwear'],
        details: ['100% Premium Cotton', '240 GSM', 'Puff Print'],
      },
      {
        name: 'Classic Black Cargo Pants',
        description: 'Relaxed fit multi-pocket cargo pants.',
        price: 1499,
        images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 30,
        category: 'Pants',
        tags: ['cargo', 'bottoms', 'streetwear'],
        details: ['Cotton Blend', '6 Pockets', 'Adjustable ankles'],
      },
      {
        name: 'Vintage Wash Hoodie',
        description: 'Heavyweight vintage wash hoodie with embroidered logo.',
        price: 1999,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        stock: 20,
        category: 'Hoodies',
        tags: ['winter', 'heavyweight', 'vintage'],
        details: ['350 GSM', 'Fleece inner', 'Drop shoulder'],
      }
    ];
    await Product.insertMany(products);
    console.log(`Created ${products.length} products.`);

    // 3. Create Sample Coupon
    console.log('Creating Coupon...');
    const coupon = new Coupon({
      code: 'AYUSH',
      discountPercentage: 50,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expires in 1 year
      isActive: true,
    });
    await coupon.save();
    console.log('Created coupon code: AYUSH (50% off)');

    console.log('==============================');
    console.log('Database successfully seeded!');
    console.log('==============================');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
