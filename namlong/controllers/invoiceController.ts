const Invoice = require('../Database/models/Invoice');

// Get all invoices
exports.getAllInvoices = async (req: any, res: any) => {
  try {
    const invoices = await Invoice.find().sort({ created_date: -1 });
    res.status(200).json(invoices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new invoice
exports.addInvoice = async (req: any, res: any) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Update a invoice
exports.updateInvoice = async (req: any, res: any) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a invoice
exports.deleteInvoice = async (req: any, res: any) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
