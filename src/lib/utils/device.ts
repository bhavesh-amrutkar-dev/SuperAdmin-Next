export const getDeviceInfo = () => ({
  deviceMake: navigator.platform,
  deviceModel: navigator.userAgent,
  deviceOsVersion: navigator.userAgent,
});
