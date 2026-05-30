const store = require('../../utils/store');

const emptyForm = () => ({ id: '', date: store.today(), name: '', spec: '', price: '', quantity: '', supplier: store.SUPPLIERS[0], remark: '' });

Page({
  data: { suppliers: store.SUPPLIERS, supplierIndex: 0, form: emptyForm(), productIndex: -1, productLabels: [], products: [], records: [], selectedIds: [], filterDate: '' },
  onShow() { this.loadProducts(); this.refresh(); },
  loadProducts() {
    const products = store.getInventoryOptions();
    this.setData({ products, productLabels: products.map((item) => item.label) });
  },
  refresh() {
    const selected = this.data.selectedIds;
    const records = store.getList('inbound')
      .filter((item) => !this.data.filterDate || item.date === this.data.filterDate)
      .map((item) => ({ ...item, totalText: store.money(Number(item.price || 0) * Number(item.quantity || 0)), checked: selected.includes(item.id) }));
    this.setData({ records });
  },
  onInput(event) { this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value }); },
  onDateChange(event) { this.setData({ 'form.date': event.detail.value }); },
  onFilterDate(event) { this.setData({ filterDate: event.detail.value }, () => this.refresh()); },
  clearFilter() { this.setData({ filterDate: '' }, () => this.refresh()); },
  onSupplierChange(event) { const index = Number(event.detail.value); this.setData({ supplierIndex: index, 'form.supplier': store.SUPPLIERS[index] }); },
  onProductChange(event) {
    const index = Number(event.detail.value);
    const product = this.data.products[index];
    if (!product) return;
    this.setData({ productIndex: index, form: { ...this.data.form, name: product.name, spec: product.spec, price: product.price, supplier: product.supplier } });
  },
  saveRecord() {
    const form = this.data.form;
    if (!form.name || !form.spec || !form.quantity) { wx.showToast({ title: '请完善入库信息', icon: 'none' }); return; }
    store.upsert('inbound', { ...form, price: Number(form.price || 0), quantity: Number(form.quantity || 0) });
    const inventory = store.getList('inventory');
    const match = inventory.find((item) => item.name === form.name && item.spec === form.spec);
    if (match && !form.id) {
      match.quantity = Number(match.quantity || 0) + Number(form.quantity || 0);
      store.setList('inventory', inventory);
    }
    this.resetForm(); this.refresh(); wx.showToast({ title: '已保存', icon: 'success' });
  },
  editRecord(event) { const item = store.getList('inbound').find((record) => record.id === event.currentTarget.dataset.id); if (item) this.setData({ form: { ...item }, supplierIndex: store.SUPPLIERS.indexOf(item.supplier) }); },
  resetForm() { this.setData({ form: emptyForm(), supplierIndex: 0, productIndex: -1 }); },
  onSelectChange(event) { this.setData({ selectedIds: event.detail.value }, () => this.refresh()); },
  selectAll() { this.setData({ selectedIds: this.data.records.map((item) => item.id) }, () => this.refresh()); },
  clearSelection() { this.setData({ selectedIds: [] }, () => this.refresh()); }
});
