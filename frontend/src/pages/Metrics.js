import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { FaCalendar } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MetricsDashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [timeRangeData, setTimeRangeData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalSearches, setTotalSearches] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:9001/api/metrics');
        const metrics = await response.json();
        formatMetricsData(metrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  const formatMetricsData = (metrics) => {
    const monthlySearchData = {};
    const timeRangeCounts = Array(8).fill(0);
    let total = 0;

    metrics.forEach(metric => {
      // Monthly data formatting
      const month = new Date(metric.departure_date).toLocaleString('default', { month: 'long' });
      const route = `${metric.from_airport} to ${metric.to_airport}`;
      
      if (!monthlySearchData[month]) {
        monthlySearchData[month] = {};
      }
      if (!monthlySearchData[month][route]) {
        monthlySearchData[month][route] = 0;
      }
      monthlySearchData[month][route] += 1;
      total += 1;

      // Time range data formatting
      const hour = new Date(metric.timestamp).getHours();
      const timeRangeIndex = Math.floor(hour / 3);
      timeRangeCounts[timeRangeIndex] += 1;
    });

    // Format monthly data
    const formattedMonthlyData = Object.entries(monthlySearchData).map(([month, routes]) => ({
      month,
      searches: Object.entries(routes).map(([route, count]) => ({
        route,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
    }));

    // Format time range data with explicit AM/PM handling
    const formattedTimeRangeData = timeRangeCounts.map((count, index) => {
      const startHour = index * 3;
      const endHour = (index * 3 + 3) % 24;
      
      // Format start hour
      const startFormatted = startHour >= 12 
        ? `${startHour === 12 ? 12 : startHour % 12} PM`
        : `${startHour === 0 ? 12 : startHour} AM`;
      
      // Format end hour
      const endFormatted = endHour >= 12
        ? `${endHour === 12 ? 12 : endHour % 12} PM`
        : `${endHour === 0 ? 12 : endHour} AM`;

      return {
        name: `${startFormatted} - ${endFormatted}`,
        value: ((count / total) * 100).toFixed(1),
        count: count // Add raw count for potential tooltip use
      };
    });

    setMonthlyData(formattedMonthlyData);
    setTimeRangeData(formattedTimeRangeData);
    setSelectedMonth(formattedMonthlyData[0]?.month || '');
    setTotalSearches(total);
  };

  const selectedMonthData = monthlyData.find(data => data.month === selectedMonth)?.searches || [];

  const colorPalette = [
    'rgba(54, 162, 235, 0.6)',   // blue
    'rgba(255, 99, 132, 0.6)',   // pink
    'rgba(75, 192, 192, 0.6)',   // teal
    'rgba(255, 206, 86, 0.6)',   // yellow
    'rgba(153, 102, 255, 0.6)',  // purple
    'rgba(255, 159, 64, 0.6)',   // orange
    'rgba(46, 204, 113, 0.6)',   // green
    'rgba(231, 76, 60, 0.6)',    // red
    'rgba(52, 152, 219, 0.6)',   // light blue
    'rgba(155, 89, 182, 0.6)'    // violet
  ];

  const barChartData = {
      labels: selectedMonthData.map(item => item.route),
      datasets: selectedMonthData.map((item, index) => ({
        label: item.route,
        data: [item.count],
        backgroundColor: colorPalette[index % colorPalette.length],
        borderColor: colorPalette[index % colorPalette.length].replace('0.6', '1'),
        borderWidth: 1,
        barPercentage: 0.8,
      })),
  };

  const pieChartData = {
    labels: timeRangeData.map(item => item.name),
    datasets: [
      {
        data: timeRangeData.map(item => item.value),
        backgroundColor: timeRangeData.map((_, index) => 
          colorPalette[index % colorPalette.length].replace('0.6', '1')
        ),
      },
    ],
  };

  const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          align: 'center',
          labels: {
            usePointStyle: true,
            padding: 20,
            boxWidth: 10,  // Makes the colored boxes smaller
            font: {
              size: 11  // Adjust font size if needed
            }
          }
        },
        title: {
          display: true,
          text: 'Flight Searches by Route'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw.toLocaleString()} searches`;
            }
          }
        }
      },
      scales: {
        x: {
          display: false,  // Hide x-axis labels since they're in the legend
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Searches'
          }
        }
      }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Search Distribution by Time'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const timeRange = timeRangeData[context.dataIndex];
            return `${timeRange.value}% (${timeRange.count.toLocaleString()} searches)`;
          }
        }
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">Flight Search Analytics</h1>
          <p className="text-muted">
            Total searches processed: {totalSearches.toLocaleString()}
          </p>
        </div>
        <Form.Group className="d-flex align-items-center">
          <FaCalendar className="me-2" />
          <Form.Select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: '200px' }}
          >
            {monthlyData.map(data => (
              <option key={data.month} value={data.month}>
                {data.month}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <Card.Title>Monthly Route Distribution</Card.Title>
              <Card.Subtitle className="text-muted">
                Flight searches by route for {selectedMonth}
              </Card.Subtitle>
            </Card.Header>
            <Card.Body>
              <Bar data={barChartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <Card.Title>Search Activity by Time</Card.Title>
              <Card.Subtitle className="text-muted">
                Distribution of searches across 3-hour intervals
              </Card.Subtitle>
            </Card.Header>
            <Card.Body>
              <Pie data={pieChartData} options={pieChartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Card.Title>Detailed Search Statistics</Card.Title>
          <Card.Subtitle className="text-muted">
            Comprehensive breakdown of search patterns
          </Card.Subtitle>
        </Card.Header>
        <Card.Body>
          {selectedMonthData.map((item, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <div>
                <h6 className="mb-0">{item.route}</h6>
                <small className="text-muted">
                  {item.count.toLocaleString()} searches ({item.percentage}%)
                </small>
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MetricsDashboard;