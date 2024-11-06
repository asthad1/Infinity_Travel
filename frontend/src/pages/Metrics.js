import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  BarElement,
  LinearScale, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { FaCalendar, FaChartBar, FaClock, FaTable } from 'react-icons/fa';

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

// Theme constants
const THEME = {
  fonts: {
    primary: "'Helvetica Neue', 'Arial', sans-serif",
    monospace: "'SF Mono', 'Monaco', monospace"
  },
  colors: {
    primary: '#2c3e50',
    secondary: '#34495e',
    muted: '#7f8c8d',
    border: '#ecf0f1',
    highlight: '#3498db',
    background: '#ffffff',
    success: '#2ecc71',
    warning: '#f1c40f',
    danger: '#e74c3c'
  }
};

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

      const hour = new Date(metric.timestamp).getHours();
      const timeRangeIndex = Math.floor(hour / 3);
      timeRangeCounts[timeRangeIndex] += 1;
    });

    const formattedMonthlyData = Object.entries(monthlySearchData).map(([month, routes]) => ({
      month,
      searches: Object.entries(routes).map(([route, count]) => ({
        route,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
    }));

    const formattedTimeRangeData = timeRangeCounts.map((count, index) => {
      const startHour = index * 3;
      const endHour = (index * 3 + 3) % 24;
      
      const startFormatted = startHour >= 12 
        ? `${startHour === 12 ? 12 : startHour % 12} PM`
        : `${startHour === 0 ? 12 : startHour} AM`;
      
      const endFormatted = endHour >= 12
        ? `${endHour === 12 ? 12 : endHour % 12} PM`
        : `${endHour === 0 ? 12 : endHour} AM`;

      return {
        name: `${startFormatted} - ${endFormatted}`,
        value: ((count / total) * 100).toFixed(1),
        count: count
      };
    });

    setMonthlyData(formattedMonthlyData);
    setTimeRangeData(formattedTimeRangeData);
    setSelectedMonth(formattedMonthlyData[0]?.month || '');
    setTotalSearches(total);
  };

  const selectedMonthData = monthlyData.find(data => data.month === selectedMonth)?.searches || [];
  const selectedMonthTotal = selectedMonthData.reduce((sum, item) => sum + item.count, 0);

  const colorPalette = [
    'rgba(52, 152, 219, 0.85)',  // blue
    'rgba(231, 76, 60, 0.85)',   // red
    'rgba(46, 204, 113, 0.85)',  // green
    'rgba(155, 89, 182, 0.85)',  // purple
    'rgba(241, 196, 15, 0.85)',  // yellow
    'rgba(230, 126, 34, 0.85)',  // orange
    'rgba(26, 188, 156, 0.85)',  // turquoise
    'rgba(52, 73, 94, 0.85)',    // dark blue
    'rgba(149, 165, 166, 0.85)', // gray
    'rgba(211, 84, 0, 0.85)'     // dark orange
  ];

  const barChartData = {
    labels: selectedMonthData.map(item => item.route),
    datasets: [{
      data: selectedMonthData.map(item => item.count),
      backgroundColor: selectedMonthData.map((_, index) => 
        colorPalette[index % colorPalette.length]
      ),
      borderColor: selectedMonthData.map((_, index) => 
        colorPalette[index % colorPalette.length].replace('0.85', '1')
      ),
      borderWidth: 1,
    }],
  };

  const pieChartData = {
    labels: timeRangeData.map(item => item.name),
    datasets: [{
      data: timeRangeData.map(item => item.value),
      backgroundColor: timeRangeData.map((_, index) => 
        colorPalette[index % colorPalette.length]
      ),
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Flight Route Search Distribution',
        font: {
          size: 16,
          weight: 'bold',
          family: THEME.fonts.primary
        },
        padding: { top: 20, bottom: 20 },
        color: THEME.colors.primary
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: THEME.colors.primary,
        bodyColor: THEME.colors.secondary,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: THEME.fonts.primary
        },
        bodyFont: {
          size: 13,
          family: THEME.fonts.primary
        },
        padding: 12,
        borderColor: THEME.colors.border,
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.raw.toLocaleString()} searches`;
          }
        },
        displayColors: false
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12,
            family: THEME.fonts.primary
          },
          color: THEME.colors.secondary
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: THEME.colors.border,
          drawBorder: false,
          lineWidth: 0.5
        },
        ticks: {
          font: {
            size: 12,
            family: THEME.fonts.primary
          },
          color: THEME.colors.secondary,
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    },
    layout: {
      padding: 20
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: THEME.fonts.primary,
            size: 12
          },
          color: THEME.colors.secondary,
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Search Distribution by Time',
        font: {
          size: 16,
          weight: 'bold',
          family: THEME.fonts.primary
        },
        color: THEME.colors.primary,
        padding: { top: 20, bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: THEME.colors.primary,
        bodyColor: THEME.colors.secondary,
        titleFont: {
          family: THEME.fonts.primary,
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: THEME.fonts.primary,
          size: 13
        },
        padding: 12,
        borderColor: THEME.colors.border,
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const timeRange = timeRangeData[context.dataIndex];
            return `${timeRange.value}% (${timeRange.count.toLocaleString()} searches)`;
          }
        }
      }
    }
  };

  const cardStyle = {
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: `1px solid ${THEME.colors.border}`,
    borderRadius: '8px',
    transition: 'box-shadow 0.3s ease'
  };

  const headerStyle = {
    borderBottom: `1px solid ${THEME.colors.border}`,
    backgroundColor: 'rgba(236, 240, 241, 0.15)'
  };

  return (
    <Container fluid className="p-4 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-3" style={{ color: THEME.colors.primary, fontFamily: THEME.fonts.primary }}>
            Flight Search Analytics
          </h1>
          <div className="d-flex gap-4">
            <p className="text-muted mb-0" style={{ fontFamily: THEME.fonts.primary }}>
              <strong>Total searches processed:</strong> {totalSearches.toLocaleString()}
            </p>
            <p className="text-muted mb-0" style={{ fontFamily: THEME.fonts.primary }}>
              <strong>Total searches for {selectedMonth}:</strong> {selectedMonthTotal.toLocaleString()}
            </p>
          </div>
        </div>
        <Form.Group className="d-flex align-items-center">
          <FaCalendar className="me-2 text-muted" />
          <Form.Select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ 
              width: '200px',
              fontFamily: THEME.fonts.primary,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: '6px'
            }}
          >
            {monthlyData.map(data => (
              <option key={data.month} value={data.month}>
                {data.month}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      <Row className="mb-4 g-4">
        <Col md={6}>
          <Card style={cardStyle}>
            <Card.Header style={headerStyle}>
              <div className="d-flex align-items-center">
                <FaChartBar className="me-2 text-primary" />
                <div>
                  <Card.Title className="mb-0" style={{ color: THEME.colors.primary }}>
                    Monthly Route Distribution
                  </Card.Title>
                  <Card.Subtitle className="text-muted mt-1">
                    Flight searches by route for {selectedMonth}
                  </Card.Subtitle>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card style={cardStyle}>
            <Card.Header style={headerStyle}>
              <div className="d-flex align-items-center">
                <FaClock className="me-2 text-primary" />
                <div>
                  <Card.Title className="mb-0" style={{ color: THEME.colors.primary }}>
                    Search Activity by Time
                  </Card.Title>
                  <Card.Subtitle className="text-muted mt-1">
                    Distribution of searches across 3-hour intervals
                  </Card.Subtitle>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card style={cardStyle}>
        <Card.Header style={headerStyle}>
          <div className="d-flex align-items-center">
            <FaTable className="me-2 text-primary" />
            <div>
              <Card.Title className="mb-0" style={{ color: THEME.colors.primary }}>
                Detailed Search Statistics - {selectedMonth}
              </Card.Title>
              <Card.Subtitle className="text-muted mt-1">
                Search distribution across routes
              </Card.Subtitle>
            </div>
          </div>
        </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Route</th>
                <th className="text-end">Searches</th>
                <th className="text-end">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {selectedMonthData
                .sort((a, b) => b.count - a.count) // Sort by count in descending order
                .map((item, index) => (
                  <tr key={index}>
                    <td>{item.route}</td>
                    <td className="text-end">{item.count.toLocaleString()}</td>
                    <td className="text-end">
                      {((item.count / selectedMonthTotal) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              <tr className="table-secondary">
                <td><strong>Total</strong></td>
                <td className="text-end"><strong>{selectedMonthTotal.toLocaleString()}</strong></td>
                <td className="text-end"><strong>100.0%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
    </Container>
  );
};

export default MetricsDashboard;