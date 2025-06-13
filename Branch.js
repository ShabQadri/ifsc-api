const mongoose = require('mongoose');
const branchSchema = new mongoose.Schema({}, { strict: false });
const Branch = mongoose.model('Branch', branchSchema, 'branches');
module.exports = Branch;