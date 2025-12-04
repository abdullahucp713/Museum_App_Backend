const User = require("../models/UserModel");

exports.createUser = async (userData) => {
  return await User.create(userData);
};

exports.findByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};

exports.findById = async (userId) => {
  return User.findById(userId);
};

exports.updateProfile = async (userId, updatedData) => {
  return User.findByIdAndUpdate(userId, updatedData, {
    new: true,
    runValidators: true,
  }).select("-password");
};

exports.findByResetToken = async (tokenHash) => {
  return await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });
};

exports.countAll = async () => {
  return await User.countDocuments();
};

exports.findAllPaginated = async (skip, limit) => {
  return await User.find({})
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

exports.getTotalUsers = async () => {
  return await User.countDocuments();
};

exports.countAdmins = async () => {
    return await User.countDocuments({ role: 'admin' });
};

exports.deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};
