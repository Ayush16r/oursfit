const Settings = require('../models/Settings');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    settings.deliveryDays = req.body.deliveryDays !== undefined ? req.body.deliveryDays : settings.deliveryDays;
    settings.freeShippingThreshold = req.body.freeShippingThreshold !== undefined ? req.body.freeShippingThreshold : settings.freeShippingThreshold;
    settings.codFee = req.body.codFee !== undefined ? req.body.codFee : settings.codFee;
    settings.gstPercentage = req.body.gstPercentage !== undefined ? req.body.gstPercentage : settings.gstPercentage;
    settings.gstThreshold = req.body.gstThreshold !== undefined ? req.body.gstThreshold : settings.gstThreshold;
    
    if (req.body.announcementText !== undefined) settings.announcementText = req.body.announcementText;
    if (req.body.announcementActive !== undefined) settings.announcementActive = req.body.announcementActive;
    if (req.body.flashSaleName !== undefined) settings.flashSaleName = req.body.flashSaleName;
    if (req.body.flashSaleEndTime !== undefined) settings.flashSaleEndTime = req.body.flashSaleEndTime;
    if (req.body.campaignTitle !== undefined) settings.campaignTitle = req.body.campaignTitle;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
