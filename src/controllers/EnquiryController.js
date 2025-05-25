const Enquiry = require("../models/Enquiry");

// ✅ POST - Create a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const { fullname, email, mobile, message } = req.body;
    console.log("Enquiry Data:", req.body);
    const newEnquiry = new Enquiry({
      fullname,
      email,
      mobile,
      message,
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
    let { page, limit } = req.query; // Default page = 1, limit = 10
    page = parseInt(page);
    limit = parseInt(limit);
    const totalEnquiries = await Enquiry.countDocuments();
    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      status: true,
      message: "Enquiries fetched successfully",
      data: enquiries,
      totalEnquiries,
      currentPage: page,
      totalPages: Math.ceil(totalEnquiries / limit),
      hasNextPage: page * limit < totalEnquiries,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
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
