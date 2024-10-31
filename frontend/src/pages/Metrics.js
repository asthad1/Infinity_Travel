import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function MetricsPage() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [timeRangeData, setTimeRangeData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://localhost:9001/api/metrics');
        const metrics = response.data;
        formatMetricsData(metrics);
      } catch (error) {
        console.error('Error fetching metrics data:', error);
      }
    };

    fetchMetrics();
  }, []);

  const formatMetricsData = (metrics) => {
    const monthlySearchData = {};
    const timeRangeCounts = Array(8).fill(0); // 8 time slots (3-hour ranges)

    metrics.forEach(metric => {
      // Format monthly data
      const month = new Date(metric.departure_date).toLocaleString('default', { month: 'long' });
      const route = `${metric.from_airport} to ${metric.to_airport}`;
      if (!monthlySearchData[month]) {
        monthlySearchData[month] = {};
      }
      if (!monthlySearchData[month][route]) {
        monthlySearchData[month][route] = 0;
      }
      monthlySearchData[month][route] += 1;

      // Format time range data
      const hour = new Date(metric.timestamp).getUTCHours();
      const timeRangeIndex = Math.floor(hour / 3); // Each index represents a 3-hour range
      timeRangeCounts[timeRangeIndex] += 1;
    });

    const formattedMonthlyData = Object.keys(monthlySearchData).map(month => ({
      month,
      searches: Object.keys(monthlySearchData[month]).map(route => ({
        route,
        count: monthlySearchData[month][route]
      }))
    }));

    const formattedTimeRangeData = timeRangeCounts.map((count, index) => {
      const rangeStart = index * 3;
      const rangeEnd = rangeStart + 3;
      return {
        range: `${rangeStart}:00 - ${rangeEnd}:00`,
        percentage: (count / metrics.length * 100).toFixed(2)
      };
    });

    setMonthlyData(formattedMonthlyData);
    setTimeRangeData(formattedTimeRangeData);
    setSelectedMonth(formattedMonthlyData[0]?.month || '');
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const monthSearchData = monthlyData.find(data => data.month === selectedMonth) || { searches: [] };

  const barChartData = {
    labels: monthSearchData.searches.map(s => s.route),
    datasets: [
      {
        label: `Searches for ${selectedMonth}`,
        data: monthSearchData.searches.map(s => s.count),
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
