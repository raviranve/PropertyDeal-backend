// routes/viewRoutes.js
const express = require("express");
const View = require("../models/Viewers");
const { success } = require("../utils/responseHandler");
const sendSms = require("../utils/SendSms");

exports.trackViewers = async (req, res) => {
  try {
    const page = "home";
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Try to insert only if it doesn’t exist
    const existing = await View.findOne({ page, ipAddress });
    if (!existing) {
      await View.create({ page, ipAddress });
      sendSms("New Visitor tracked from Website", `IP: ${ipAddress}`);
    }

    res.status(200).json({ message: "View tracked" });
  } catch (err) {
    res.status(500).json({ message: "Error tracking view", error: err });
  }
};

exports.getViewersCount = async (req, res) => {
  try {
    const count = await View.countDocuments({ page: "home" });
    success(res, count, "Viewers Fetched Successfully");
  } catch (err) {
    res.status(500).json({ message: "Error fetching views", error: err });
  }
};
