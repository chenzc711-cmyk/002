Page({
  data: {
    companyCode: ''
  },
  onInput(event) {
    this.setData({ companyCode: event.detail.value.trim() });
  },
  login() {
    if (this.data.companyCode === 'sfds') {
      wx.setStorageSync('sfds_authed', true);
      wx.switchTab({ url: '/pages/dashboard/dashboard' });
      return;
    }
    wx.showToast({ title: '公司代码不正确', icon: 'none' });
  }
});
