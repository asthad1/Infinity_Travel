import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { DateRangePicker } from 'react-dates';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminRevenue = () => {
  const [revenueData, setRevenueData] = useState({ airline: [], car_rental: [], hotel: [] });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [startDate, endDate]);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(
        `http://localhost:9001/api/revenue?start_date=${startDate.format('YYYY-MM-DD')}&end_date=${endDate.format('YYYY-MM-DD')}`
      );
      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const formatChartData = (data, label) => ({
    labels: data.map((item) => item.destination),
    datasets: [
      {
        label: `${label} Revenue`,
        data: data.map((item) => item.revenue),
        backgroundColor: 'rgba(52, 152, 219, 0.85)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: {
        display: true,
        text: 'Revenue Distribution',
        font: { size: 16, weight: 'bold' },
        padding: { top: 20, bottom: 20 },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <Container fluid className="p-4 bg-light">
      <h1 className="h2 mb-4">Revenue Dashboard</h1>

      {/* Date Range Picker */}
      <Row className="mb-4">
        <Col md={6}>
          <DateRangePicker
            startDate={startDate} // Moment.js object for start date
            endDate={endDate}     // Moment.js object for end date
            onDatesChange={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
            }}
            focusedInput={focusedInput}
            onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
            displayFormat="YYYY-MM-DD"
            isOutsideRange={() => false} // Allows all dates to be selectable
            numberOfMonths={1}           // Display only one month at a time
            showClearDates={true}        // Show clear button
            reopenPickerOnClearDates={true}
            startDateId="start_date_id"
            endDateId="end_date_id"
          />
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button variant="primary" onClick={fetchRevenueData} disabled={!startDate || !endDate}>
            Fetch Revenue Data
          </Button>
        </Col>
      </Row>

      {/* Revenue Charts */}
      <Row className="mb-4 g-4">
        <Col md={4}>
          <Card>
            <Card.Header>
              <strong>Airline Revenue</strong>
            </Card.Header>
            <Card.Body style={{ height: '400px' }}>
              <Bar data={formatChartData(revenueData.airline, 'Airline')} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <strong>Car Rental Revenue</strong>
            </Card.Header>
            <Card.Body style={{ height: '400px' }}>
              <Bar data={formatChartData(revenueData.car_rental, 'Car Rental')} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <strong>Hotel Revenue</strong>
            </Card.Header>
            <Card.Body style={{ height: '400px' }}>
              <Bar data={formatChartData(revenueData.hotel, 'Hotel')} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Total Revenue Pie Chart */}
      <Row className="mb-4">
        <Col md={6} className="offset-md-3">
          <Card>
            <Card.Header>
              <strong>Total Revenue by Travel Type</strong>
            </Card.Header>
            <Card.Body style={{ height: '400px' }}>
              <Pie
                data={{
                  labels: ['Airline', 'Car Rental', 'Hotel'],
                  datasets: [
                    {
                      label: 'Total Revenue',
                      data: [
                        revenueData.airline.reduce((sum, item) => sum + item.revenue, 0),
                        revenueData.car_rental.reduce((sum, item) => sum + item.revenue, 0),
                        revenueData.hotel.reduce((sum, item) => sum + item.revenue, 0),
                      ],
                      backgroundColor: [
                        'rgba(52, 152, 219, 0.85)', // blue for airline
                        'rgba(231, 76, 60, 0.85)',  // red for car rental
                        'rgba(46, 204, 113, 0.85)', // green for hotel
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'right' },
                    title: {
                      display: true,
                      text: 'Revenue Distribution by Travel Type',
                      font: { size: 16, weight: 'bold' },
                      padding: { top: 20, bottom: 20 },
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminRevenue;
