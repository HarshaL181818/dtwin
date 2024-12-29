// utils/aqiUtils.js
export const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#66ff66';
    if (aqi <= 100) return '#ffff66';
    if (aqi <= 150) return '#ff9966';
    if (aqi <= 200) return '#ff6666';
    if (aqi <= 300) return '#cc33cc';
    return '#cc0000';
  };