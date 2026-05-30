const store = require('../../utils/store');

const emptyForm = () => ({ id: '', date: store.today(), name: '', spec: '', quantity: '', price: '', total: '', purpose: '' });
const emptyCostForm = () => ({ id: '', date: store.today(), amount: '', purpose: '', category: store.COST_CATEGORIES[0], remark: '' });

Page({
  data: { categories: store.COST_CATEGORIES, categoryIndex: 0, form: emptyForm(), costForm: emptyCostForm(), productIndex: -1, productLabels: [], products: [], records: [], costs: [], selectedIds: [], selectedCostIds: [], filterDate: '' },
  onShow() { this.loadProducts(); this.refresh(); this.refreshCosts(); },
  loadProducts() { const products = store.getInventoryOptions(); this.setData({ products, productLabels: products.map((item) => item.label) }); },
  refresh() { const selected = this.data.selectedIds; const records = store.getList('outbound').filter((item) => !this.data.filterDate || item.date === this.data.filterDate).map((item) => ({ ...item, totalText: store.money(item.total), checked: selected.includes(item.id) })); this.setData({ records }); },
  refreshCosts() { const selected = this.data.selectedCostIds; const costs = store.getList('costs').map((item) => ({ ...item, amountText: store.money(item.amount), checked: selected.includes(item.id) })); this.setData({ costs }); },
  onInput(event) {
    const field = event.currentTarget.dataset.field;
    const value = event.detail.value;
    const next = { ...this.data.form, [field]: value };
    if (field === 'quantity' || field === 'price') next.total = store.money(Number(next.quantity || 0) * Number(next.price || 0));
    this.setData({ form: next });
  },
  onDateChange(event) { this.setData({ 'form.date': event.detail.value }); },
  onFilterDate(event) { this.setData({ filterDate: event.detail.value }, () => this.refresh()); },
  clearFilter() { this.setData({ filterDate: '' }, () => this.refresh()); },
  onProductChange(event) { const index = Number(event.detail.value); const product = this.data.products[index]; if (product) this.setData({ productIndex: index, form: { ...this.data.form, name: product.name, spec: product.spec, price: product.price, total: store.money(Number(this.data.form.quantity || 0) * Number(product.price || 0)) } }); },
  saveRecord() {
    const form = this.data.form;
    if (!form.date || !form.name || !form.quantity) { wx.showToast({ title: '请完善出库信息', icon: 'none' }); return; }
    store.upsert('outbound', { ...form, quantity: Number(form.quantity || 0), price: Number(form.price || 0), total: Number(form.total || 0) });
    const inventory = store.getList('inventory');
    const match = inventory.find((item) => item.name === form.name && item.spec === form.spec);
    if (match && !form.id) { match.quantity = Math.max(0, Number(match.quantity || 0) - Number(form.quantity || 0)); store.setList('inventory', inventory); }
    this.resetForm(); this.refresh(); wx.showToast({ title: '已保存', icon: 'success' });
  },
  editRecord(event) { const item = store.getList('outbound').find((record) => record.id === event.currentTarget.dataset.id); if (item) this.setData({ form: { ...item } }); },
  resetForm() { this.setData({ form: emptyForm(), productIndex: -1 }); },
  onSelectChange(event) { this.setData({ selectedIds: event.detail.value }, () => this.refresh()); },
  selectAll() { this.setData({ selectedIds: this.data.records.map((item) => item.id) }, () => this.refresh()); },
  clearSelection() { this.setData({ selectedIds: [] }, () => this.refresh()); },
  onCostInput(event) { this.setData({ [`costForm.${event.currentTarget.dataset.field}`]: event.detail.value }); },
  onCostDateChange(event) { this.setData({ 'costForm.date': event.detail.value }); },
  onCategoryChange(event) { const index = Number(event.detail.value); this.setData({ categoryIndex: index, 'costForm.category': store.COST_CATEGORIES[index] }); },
  saveCost() { const form = this.data.costForm; if (!form.amount || !form.purpose) { wx.showToast({ title: '请填写成本金额和用途', icon: 'none' }); return; } store.upsert('costs', { ...form, amount: Number(form.amount || 0) }); this.resetCostForm(); this.refreshCosts(); wx.showToast({ title: '成本已保存', icon: 'success' }); },
  editCost(event) { const item = store.getList('costs').find((record) => record.id === event.currentTarget.dataset.id); if (item) this.setData({ costForm: { ...item }, categoryIndex: store.COST_CATEGORIES.indexOf(item.category) }); },
  resetCostForm() { this.setData({ costForm: emptyCostForm(), categoryIndex: 0 }); },
  onCostSelectChange(event) { this.setData({ selectedCostIds: event.detail.value }, () => this.refreshCosts()); },
  selectAllCosts() { this.setData({ selectedCostIds: this.data.costs.map((item) => item.id) }, () => this.refreshCosts()); },
  clearCostSelection() { this.setData({ selectedCostIds: [] }, () => this.refreshCosts()); }
});
