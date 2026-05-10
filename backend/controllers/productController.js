const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    delete productData._id; // Prevent CastError if empty _id is passed
    delete productData.__v;
    if (!productData.images || productData.images.length === 0) {
      productData.images = ['/images/sample.jpg'];
    }
    const product = new Product(productData);

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { 
    name, price, originalPrice, description, images, 
    sizes, category, stock, tags, details,
    variants, fabric, seoTitle, seoDescription,
    isFeatured, isTrending, isNewArrival, status, launchDate 
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (name !== undefined) product.name = name;
      if (price !== undefined) product.price = price;
      if (originalPrice !== undefined) product.originalPrice = originalPrice;
      if (description !== undefined) product.description = description;
      if (images !== undefined) product.images = images;
      if (sizes !== undefined) product.sizes = sizes;
      if (category !== undefined) product.category = category;
      if (stock !== undefined) product.stock = stock;
      if (tags !== undefined) product.tags = tags;
      if (details !== undefined) product.details = details;
      
      // New fields
      if (variants !== undefined) product.variants = variants;
      if (fabric !== undefined) product.fabric = fabric;
      if (seoTitle !== undefined) product.seoTitle = seoTitle;
      if (seoDescription !== undefined) product.seoDescription = seoDescription;
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (isTrending !== undefined) product.isTrending = isTrending;
      if (isNewArrival !== undefined) product.isNewArrival = isNewArrival;
      if (status !== undefined) product.status = status;
      if (launchDate !== undefined) product.launchDate = launchDate;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Apply Global Sale
// @route   POST /api/products/sale
// @access  Private/Admin
const applyGlobalSale = async (req, res) => {
  try {
    const { discountPercentage, category } = req.body;
    if (discountPercentage === undefined || discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ message: 'Valid discount percentage (0-100) is required.' });
    }

    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    const products = await Product.find(query);
    
    // If discount is 0, we reset the sale (price = originalPrice)
    for (let product of products) {
      if (discountPercentage === 0) {
         if (product.originalPrice) {
            product.price = product.originalPrice;
            product.originalPrice = undefined; // Clear the original price
         }
      } else {
         // If product doesn't have an original price, it means it's not currently on sale.
         // Save the current price as original price.
         if (!product.originalPrice) {
           product.originalPrice = product.price;
         }
         
         // Apply discount to the original price
         product.price = product.originalPrice - (product.originalPrice * (discountPercentage / 100));
      }
      await product.save();
    }

    const targetMsg = category && category !== 'All' ? `products in category '${category}'` : 'all products';
    res.json({ message: `Sale of ${discountPercentage}% applied to ${targetMsg}.` });
  } catch (error) {
    console.error('Global Sale Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  applyGlobalSale,
};
