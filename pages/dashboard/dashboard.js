const store = require('../../utils/store');

function formatStats(stats) {
  return {
    ...stats,
    dropshipCostText: store.money(stats.dropshipCost),
    inventoryAmountText: store.money(stats.inventoryAmount),
    supplierBalanceText: store.money(stats.supplierBalance),
    todayOutAmountText: store.money(stats.todayOutAmount),
    todayInAmountText: store.money(stats.todayInAmount),
    monthInAmountText: store.money(stats.monthInAmount),
    monthOutAmountText: store.money(stats.monthOutAmount)
  };
}

Page({
  data: {
    stats: formatStats(store.dashboardStats())
  },
  onShow() {
    if (!wx.getStorageSync('sfds_authed')) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.setData({ stats: formatStats(store.dashboardStats()) });
  }
});
