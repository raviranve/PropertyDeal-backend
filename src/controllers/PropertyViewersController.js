// routes/viewRoutes.js
const express = require("express");
const View = require("../models/Viewers");
const { success } = require("../utils/responseHandler");
const sendSms = require("../utils/SendSms");

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  return forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
};

exports.trackViewers = async (req, res) => {
  try {
    const ipAddress = getClientIp(req);

    const existing = await View.findOne({ ipAddress });

    if (!existing) {
      await View.create({ ipAddress });
      sendSms("New Visitor tracked from Website", `IP: ${ipAddress}`);
    }

    res.status(200).json({ message: "View tracked" });
  } catch (err) {
    res.status(500).json({ message: "Error tracking view", error: err });
  }
};

exports.getViewersCount = async (req, res) => {
  try {
    const count = await View.countDocuments();
    success(res, count, "Viewers Fetched Successfully");
  } catch (err) {
    res.status(500).json({ message: "Error fetching views", error: err });
  }
};
