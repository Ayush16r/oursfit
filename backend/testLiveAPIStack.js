const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
  await mongoose.connect('mongodb+srv://oursfit:ayush@oursfit.kvrvbyi.mongodb.net/oursfit?retryWrites=true&w=majority&appName=oursfit');
  
  try {
    const loginRes = await fetch('https://oursfit-backends.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testadmin@oursfit.com', password: 'password123' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;

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
    console.log(text);
  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
}

test();
