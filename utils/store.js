const SUPPLIERS = ['普通渠道商', '3W品牌渠道商', '台州伊文渠道商'];
const COST_CATEGORIES = ['代发成本', '采购成本', '人工成本', '其他成本'];
const RETURN_STATUS = ['待质检', '可二次销售', '破损', '需返修'];

const KEYS = {
  inventory: 'sfds_inventory',
  inbound: 'sfds_inbound',
  returns: 'sfds_returns',
  outbound: 'sfds_outbound',
  costs: 'sfds_costs',
  supplierBalances: 'sfds_supplier_balances'
};

function createId() {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function today() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function monthKey(date = today()) {
  return String(date).slice(0, 7);
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function getList(key) {
  return wx.getStorageSync(KEYS[key]) || [];
}

function setList(key, list) {
  wx.setStorageSync(KEYS[key], list);
}

function upsert(key, record) {
  const list = getList(key);
  const nextRecord = { ...record, id: record.id || createId(), updatedAt: new Date().toISOString() };
  const index = list.findIndex((item) => item.id === nextRecord.id);
  if (index >= 0) {
    list.splice(index, 1, nextRecord);
  } else {
    list.unshift(nextRecord);
  }
  setList(key, list);
  return nextRecord;
}

function getInventoryOptions() {
  return getList('inventory').map((item) => ({
    label: `${item.name}｜${item.spec}｜¥${money(item.price)}`,
    value: item.id,
    ...item
  }));
}

function supplierBalances() {
  const saved = wx.getStorageSync(KEYS.supplierBalances) || {};
  SUPPLIERS.forEach((name) => {
    if (saved[name] === undefined) saved[name] = 0;
  });
  return saved;
}

function saveSupplierBalance(supplier, amount) {
  const balances = supplierBalances();
  balances[supplier] = Number(amount || 0);
  wx.setStorageSync(KEYS.supplierBalances, balances);
  return balances;
}

function inventoryStats() {
  const inventory = getList('inventory');
  return inventory.reduce((stats, item) => {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    const warningQty = Number(item.warningQty || 0);
    stats.quantity += quantity;
    stats.amount += quantity * price;
    if (quantity <= warningQty) stats.warning += 1;
    return stats;
  }, { quantity: 0, amount: 0, warning: 0 });
}

function dashboardStats() {
  const inbound = getList('inbound');
  const returns = getList('returns');
  const outbound = getList('outbound');
  const costs = getList('costs');
  const now = today();
  const currentMonth = monthKey(now);
  const supplierTotal = Object.values(supplierBalances()).reduce((sum, value) => sum + Number(value || 0), 0);
  const inv = inventoryStats();
  const stat = {
    dropshipCost: 0,
    inventoryQty: inv.quantity,
    inventoryAmount: inv.amount,
    warningCount: inv.warning,
    supplierBalance: supplierTotal,
    todayOutQty: 0,
    todayOutAmount: 0,
    todayInQty: 0,
    todayInAmount: 0,
    monthInQty: 0,
    monthInAmount: 0,
    monthOutQty: 0,
    monthOutAmount: 0,
    monthReturnQty: 0
  };

  costs.forEach((item) => {
    const amount = Number(item.amount || 0);
    if (item.category === '代发成本') stat.dropshipCost += amount;
  });
  inbound.forEach((item) => {
    const qty = Number(item.quantity || 0);
    const amount = qty * Number(item.price || 0);
    if (item.date === now) {
      stat.todayInQty += qty;
      stat.todayInAmount += amount;
    }
    if (monthKey(item.date) === currentMonth) {
      stat.monthInQty += qty;
      stat.monthInAmount += amount;
    }
  });
  returns.forEach((item) => {
    const qty = Number(item.quantity || 0);
    if (item.date === now) stat.todayInQty += qty;
    if (monthKey(item.date) === currentMonth) stat.monthReturnQty += qty;
  });
  outbound.forEach((item) => {
    const qty = Number(item.quantity || 0);
    const amount = Number(item.total || 0);
    if (item.date === now) {
      stat.todayOutQty += qty;
      stat.todayOutAmount += amount;
    }
    if (monthKey(item.date) === currentMonth) {
      stat.monthOutQty += qty;
      stat.monthOutAmount += amount;
    }
  });
  return stat;
}

module.exports = {
  SUPPLIERS,
  COST_CATEGORIES,
  RETURN_STATUS,
  today,
  money,
  getList,
  setList,
  upsert,
  getInventoryOptions,
  supplierBalances,
  saveSupplierBalance,
  dashboardStats
};
