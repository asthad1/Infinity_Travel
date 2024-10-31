import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import faker from 'faker';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const generateFakeData = () => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const origins = ["SEA", "LAX", "JFK", "ORD", "ATL"];
  const destinations = ["IAD", "MIA", "DFW", "BOS", "SFO"];

  // Generate monthly search data
  const monthlyData = months.map((month) => ({
    month,
    searches: origins.map((origin) => ({
      origin,
      destinations: destinations.map((destination) => ({
        destination,
        count: faker.datatype.number({ min: 50, max: 300 })
      }))
    }))
  }));

  // Generate time-range search data
  const timeRanges = ["12AM-3AM", "3AM-6AM", "6AM-9AM", "9AM-12PM", "12PM-3PM", "3PM-6PM", "6PM-9PM", "9PM-12AM"];
  const timeRangeData = timeRanges.map(range => ({
    range,
    percentage: faker.datatype.number({ min: 1, max: 20 })
  }));

  return { monthlyData, timeRangeData };
};

function MetricsPage() {
  const { monthlyData, timeRangeData } = generateFakeData();
  const [selectedMonth, setSelectedMonth] = useState(monthlyData[0].month);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const monthSearchData = monthlyData.find(data => data.month === selectedMonth);

  const barChartData = {
    labels: monthSearchData.searches.flatMap(s => s.destinations.map(d => `${s.origin} to ${d.destination}`)),
    datasets: [
      {
        label: `Searches for ${selectedMonth}`,
        data: monthSearchData.searches.flatMap(s => s.destinations.map(d => d.count)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: timeRangeData.map(data => data.range),
    datasets: [
      {
        label: 'Percentage of Searches by Time Range',
        data: timeRangeData.map(data => data.percentage),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#36A2EB'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#36A2EB'
        ],
      },
    ],
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Metrics Dashboard</h2>

      {/* Monthly Search Data */}
      <div style={{ marginBottom: '20px' }}>
        <label>Select Month: </label>
        <select value={selectedMonth} onChange={handleMonthChange}>
          {monthlyData.map(data => (
            <option key={data.month} value={data.month}>{data.month}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '40px', width: '80%', margin: 'auto' }}>
        <h3>Flight Searches by Month</h3>
        <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      </div>

      {/* Time Range Search Data */}
      <div style={{ width: '50%', margin: 'auto' }}>
        <h3>Search Activity by Time Range</h3>
        <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
      </div>
    </div>
  );
}

export default MetricsPage;
