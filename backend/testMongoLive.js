const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

async function test() {
  try {
    console.log("Testing Order validation...");
    const order = new Order({
      orderItems: [{
        name: "Test",
        qty: 1,
        image: "test.jpg",
        price: 100,
        product: new mongoose.Types.ObjectId()
      }],
      user: new mongoose.Types.ObjectId(),
      shippingAddress: {
        street: "123 Main St", // Frontend sends street, NOT address
        city: "Test",
        postalCode: "12345",
        country: "Test"
      },
      paymentMethod: "COD",
      itemsPrice: 100,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 100,
    });
    
    // validateSync runs validation synchronously without needing connection
    const orderErr = order.validateSync();
    if (orderErr) {
      console.error("Order validation failed:", orderErr.message);
    } else {
      console.log("Order validation passed!");
    }
  } catch (err) {
    console.error("Order error:", err);
  }

  try {
    console.log("\nTesting Product validation...");
    const productData = {
      name: "Oversized Anime Print T-Shirt",
      description: "Test description",
      price: 100,
      originalPrice: 0,
      images: ['/images/sample.jpg'], // with backend fix
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
    };
    const p = new Product(productData);
    const prodErr = p.validateSync();
    if (prodErr) {
      console.error("Product validation failed:", prodErr.message);
    } else {
      console.log("Product validation passed!");
    }
  } catch (err) {
    console.error("Product error:", err);
  }
  
  process.exit(0);
}

test();
