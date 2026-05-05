const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  try {
    // 1. Create order in Razorpay
    const options = {
      amount: Math.round(totalPrice * 100), // amount in the smallest currency unit (paise)
      currency: "INR", 
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    // 2. Create order in MongoDB (pending status)
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
    });

    const createdOrder = await order.save();

    // 3. Return order details to frontend
    res.status(201).json({
      orderId: createdOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;

      const updatedOrder = await order.save();

      // Create Admin Notification
      const notification = new Notification({
        type: 'NEW_ORDER',
        message: `New order received from ${req.user.name || 'User'} for ₹${updatedOrder.totalPrice.toFixed(2)}`,
        orderId: updatedOrder._id,
      });
      await notification.save();

      // Send Email to User using Nodemailer
      const sendEmail = require('../utils/sendEmail');
      sendEmail({
        email: req.user.email,
        subject: `OursFit Order Confirmed - #${updatedOrder._id.toString().substring(0, 8)}`,
        message: `Hello ${req.user.name},\n\nYour payment was successful and your order for ₹${updatedOrder.totalPrice.toFixed(2)} has been confirmed!\n\nThank you for shopping with OursFit.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #e50914; text-transform: uppercase;">OursFit</h2>
            <h3>Order Confirmed! 🎉</h3>
            <p>Hello <strong>${req.user.name}</strong>,</p>
            <p>We've received your order and payment of <strong>₹${updatedOrder.totalPrice.toFixed(2)}</strong>.</p>
            <p>Order ID: #${updatedOrder._id.toString().substring(0, 8)}</p>
            <p>Your items will be shipped soon. Thank you for shopping with us!</p>
          </div>
        `
      }).catch(emailError => {
        console.error('Error sending confirmation email:', emailError);
      });

      return res.status(200).json({ message: "Payment verified successfully", order: updatedOrder });
    } else {
      // Payment verification failed
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Confirm COD Order
// @route   POST /api/payment/confirm-cod
// @access  Private
const confirmCOD = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // COD is paid on delivery, but we mark it placed/confirmed
    order.paymentStatus = 'pending'; // Will be 'paid' upon delivery
    order.isPaid = false; 
    
    const updatedOrder = await order.save();

    // Create Admin Notification
    const Notification = require('../models/Notification');
    const notification = new Notification({
      type: 'NEW_ORDER',
      message: `New COD order received from ${req.user.name || 'User'} for ₹${updatedOrder.totalPrice.toFixed(2)}`,
      orderId: updatedOrder._id,
    });
    await notification.save();

    // Send Email to User using Nodemailer
    const sendEmail = require('../utils/sendEmail');
    sendEmail({
      email: req.user.email,
      subject: `OursFit Order Confirmed - #${updatedOrder._id.toString().substring(0, 8)}`,
      message: `Hello ${req.user.name},\n\nYour COD order for ₹${updatedOrder.totalPrice.toFixed(2)} has been confirmed!\n\nThank you for shopping with OursFit.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #e50914; text-transform: uppercase;">OursFit</h2>
          <h3>Order Confirmed! 🎉</h3>
          <p>Hello <strong>${req.user.name}</strong>,</p>
          <p>We've received your Cash on Delivery (COD) order of <strong>₹${updatedOrder.totalPrice.toFixed(2)}</strong>.</p>
          <p>Order ID: #${updatedOrder._id.toString().substring(0, 8)}</p>
          <p>Your items will be shipped soon. You can pay via cash or UPI at the time of delivery.</p>
        </div>
      `
    }).catch(emailError => {
      console.error('Error sending confirmation email:', emailError);
    });

    return res.status(200).json({ message: "COD Order confirmed successfully", order: updatedOrder });
  } catch (error) {
    console.error('Confirm COD Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  confirmCOD,
};
