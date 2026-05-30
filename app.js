App({
  onLaunch() {
    const authed = wx.getStorageSync('sfds_authed');
    if (!authed) {
      wx.reLaunch({ url: '/pages/login/login' });
    }
  }
});
