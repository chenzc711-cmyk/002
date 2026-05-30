const store = require('../../utils/store');

const emptyForm = () => ({ id: '', name: '', spec: '', price: '', quantity: '', supplier: store.SUPPLIERS[0], remark: '', warningQty: '' });

Page({
  data: {
    suppliers: store.SUPPLIERS,
    supplierIndex: 0,
    balanceSupplierIndex: 0,
    form: emptyForm(),
    balanceForm: { supplier: store.SUPPLIERS[0], amount: '' },
    inventory: [],
    selectedIds: [],
    balanceList: []
  },
  onShow() {
    this.refresh();
  },
  refresh() {
    const selected = this.data.selectedIds;
    const inventory = store.getList('inventory').map((item) => ({ ...item, checked: selected.includes(item.id) }));
    const balances = store.supplierBalances();
    const balanceList = store.SUPPLIERS.map((supplier) => ({ supplier, amountText: store.money(balances[supplier]) }));
    this.setData({ inventory, balanceList });
  },
  onFormInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },
  onSupplierChange(event) {
    const index = Number(event.detail.value);
    this.setData({ supplierIndex: index, 'form.supplier': store.SUPPLIERS[index] });
  },
  saveInventory() {
    const form = this.data.form;
    if (!form.name || !form.spec) {
      wx.showToast({ title: '请填写商品名称和规格', icon: 'none' });
      return;
    }
    store.upsert('inventory', {
      ...form,
      price: Number(form.price || 0),
      quantity: Number(form.quantity || 0),
      warningQty: Number(form.warningQty || 0)
    });
    this.resetForm();
    this.refresh();
    wx.showToast({ title: '已保存', icon: 'success' });
  },
  editInventory(event) {
    const item = store.getList('inventory').find((record) => record.id === event.currentTarget.dataset.id);
    if (!item) return;
    this.setData({ form: { ...item }, supplierIndex: store.SUPPLIERS.indexOf(item.supplier) });
  },
  resetForm() {
    this.setData({ form: emptyForm(), supplierIndex: 0 });
  },
  onSelectChange(event) {
    this.setData({ selectedIds: event.detail.value }, () => this.refresh());
  },
  selectAll() {
    this.setData({ selectedIds: this.data.inventory.map((item) => item.id) }, () => this.refresh());
  },
  clearSelection() {
    this.setData({ selectedIds: [] }, () => this.refresh());
  },
  onBalanceSupplierChange(event) {
    const index = Number(event.detail.value);
    const supplier = store.SUPPLIERS[index];
    const balances = store.supplierBalances();
    this.setData({ balanceSupplierIndex: index, balanceForm: { supplier, amount: balances[supplier] } });
  },
  onBalanceInput(event) {
    this.setData({ 'balanceForm.amount': event.detail.value });
  },
  saveBalance() {
    store.saveSupplierBalance(this.data.balanceForm.supplier, this.data.balanceForm.amount);
    this.refresh();
    wx.showToast({ title: '余额已保存', icon: 'success' });
  }
});
