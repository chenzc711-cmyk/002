const store = require('../../utils/store');

const emptyForm = () => ({ id: '', date: store.today(), orderNo: '', logisticsCompany: '', trackingNo: '', name: '', spec: '', quantity: '', status: store.RETURN_STATUS[0], remark: '' });

Page({
  data: { statuses: store.RETURN_STATUS, statusIndex: 0, form: emptyForm(), productIndex: -1, productLabels: [], products: [], records: [], selectedIds: [], filterDate: '' },
  onShow() { this.loadProducts(); this.refresh(); },
  loadProducts() { const products = store.getInventoryOptions(); this.setData({ products, productLabels: products.map((item) => `${item.name}｜${item.spec}`) }); },
  refresh() { const selected = this.data.selectedIds; const records = store.getList('returns').filter((item) => !this.data.filterDate || item.date === this.data.filterDate).map((item) => ({ ...item, checked: selected.includes(item.id) })); this.setData({ records }); },
  onInput(event) { this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value }); },
  onDateChange(event) { this.setData({ 'form.date': event.detail.value }); },
  onFilterDate(event) { this.setData({ filterDate: event.detail.value }, () => this.refresh()); },
  clearFilter() { this.setData({ filterDate: '' }, () => this.refresh()); },
  onStatusChange(event) { const index = Number(event.detail.value); this.setData({ statusIndex: index, 'form.status': store.RETURN_STATUS[index] }); },
  onProductChange(event) { const index = Number(event.detail.value); const product = this.data.products[index]; if (product) this.setData({ productIndex: index, form: { ...this.data.form, name: product.name, spec: product.spec } }); },
  saveRecord() {
    const form = this.data.form;
    if (!form.date || !form.orderNo || !form.name || !form.quantity) { wx.showToast({ title: '请完善退货信息', icon: 'none' }); return; }
    store.upsert('returns', { ...form, quantity: Number(form.quantity || 0) });
    const inventory = store.getList('inventory');
    const match = inventory.find((item) => item.name === form.name && item.spec === form.spec);
    if (match && !form.id) { match.quantity = Number(match.quantity || 0) + Number(form.quantity || 0); store.setList('inventory', inventory); }
    this.resetForm(); this.refresh(); wx.showToast({ title: '已保存', icon: 'success' });
  },
  editRecord(event) { const item = store.getList('returns').find((record) => record.id === event.currentTarget.dataset.id); if (item) this.setData({ form: { ...item }, statusIndex: store.RETURN_STATUS.indexOf(item.status) }); },
  resetForm() { this.setData({ form: emptyForm(), statusIndex: 0, productIndex: -1 }); },
  onSelectChange(event) { this.setData({ selectedIds: event.detail.value }, () => this.refresh()); },
  selectAll() { this.setData({ selectedIds: this.data.records.map((item) => item.id) }, () => this.refresh()); },
  clearSelection() { this.setData({ selectedIds: [] }, () => this.refresh()); }
});
