const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function test() {
  await mongoose.connect('mongodb+srv://oursfit:ayush@oursfit.kvrvbyi.mongodb.net/oursfit?retryWrites=true&w=majority&appName=oursfit');
  
  try {
    // Find an admin user to use
    let admin = await User.findOne({ email: 'testadmin@oursfit.com' });
    if (!admin) {
      admin = new User({
        name: 'Test Admin',
        email: 'testadmin@oursfit.com',
        password: 'password123',
        role: 'admin'
      });
      await admin.save();
      console.log("Created test admin user");
    } else {
      admin.password = 'password123';
      await admin.save();
      console.log("Updated test admin password");
    }

    // Now login via live API
    const loginRes = await fetch('https://oursfit-backends.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testadmin@oursfit.com', password: 'password123' })
    });
    
    const loginData = await loginRes.json();
    console.log("Login Status:", loginRes.status);
    
    if (!loginData.token) {
      console.log("Login Failed:", loginData);
      process.exit(1);
    }
    
    const token = loginData.token;
    console.log("Got token!");

    // Test product creation
    const productData = {
      name: "Oversized Anime Print T-Shirt",
      description: "Test description",
      price: 100,
      originalPrice: 0,
      images: [],
      category: "T-Shirts",
      status: "draft",
      variants: [],
      tags: [],
      details: [],
      fabric: "",
      seoTitle: "",
      seoDescription: "",
      isFeatured: false,
      isTrending: false,
      isNewArrival: false,
      _id: "",
      __v: 0
    };

    const res = await fetch('https://oursfit-backends.onrender.com/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    
    const text = await res.text();
    console.log("Create Product Status:", res.status);
    console.log("Create Product Response:", text);

  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
}

test();
