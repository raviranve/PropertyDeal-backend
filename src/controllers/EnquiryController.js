const Enquiry = require("../models/Enquiry");

// ✅ POST - Create a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const { fullname, email, mobile, message, propertyId } = req.body;
console.log(fullname, email, mobile, message, propertyId);

    const newEnquiry = new Enquiry({
      fullname,
      email,
      mobile,
      message,
      propertyId,
    });

    await newEnquiry.save();

    res.status(201).json({
      status: true,
      message: "Enquiry submitted successfully",
      data: newEnquiry,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ GET - Fetch all enquiries
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate("propertyId");
    res.status(200).json({
      status: true,
      message: "Enquiries fetched successfully",
      data: enquiries,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ DELETE - Delete an enquiry by ID
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({
        status: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
