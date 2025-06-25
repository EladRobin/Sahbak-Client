import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

// הנתונים שלך
const desktopOS = [
  { label: 'Windows', value: 72.72 },
  { label: 'OS X', value: 16.38 },
  { label: 'Linux', value: 3.83 },
  { label: 'Chrome OS', value: 2.42 },
  { label: 'Other', value: 4.65 },
];

const mobileOS = [
  { label: 'Android', value: 70.48 },
  { label: 'iOS', value: 28.8 },
  { label: 'Other', value: 0.71 },
];

const platforms = [
  { label: 'Mobile', value: 59.12 },
  { label: 'Desktop', value: 40.88 },
];

const normalize = (v, v2) => Number.parseFloat(((v * v2) / 100).toFixed(2));

const mobileAndDesktopOS = [
  ...mobileOS.map((v) => ({
    ...v,
    label: v.label === 'Other' ? 'Other (Mobile)' : v.label,
    value: normalize(v.value, platforms[0].value),
  })),
  ...desktopOS.map((v) => ({
    ...v,
    label: v.label === 'Other' ? 'Other (Desktop)' : v.label,
    value: normalize(v.value, platforms[1].value),
  })),
];

const valueFormatter = (item) => `${item.value}%`;

const EquipmentPieChart = () => {
  return (
    <PieChart
      series={[
        {
          data: mobileAndDesktopOS,
          valueFormatter,
        },
      ]}
      height={300}
      width={300}
    />
  );
};

export default EquipmentPieChart;
