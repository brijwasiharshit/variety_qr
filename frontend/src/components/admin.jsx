import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const navigate = useNavigate();
  const host = process.env.REACT_APP_HOST;
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesTodayRes, weeklyTrendRes, totalOrdersRes, avgOrderValueRes] = await Promise.all([
          axios.get(`${host}/api/admin/salesToday`, { withCredentials: true }),
          axios.get(`${host}/api/admin/oneWeekComparison`, { withCredentials: true }),
          axios.get(`${host}/api/admin/totalOrders`, { withCredentials: true }),
          axios.get(`${host}/api/admin/avgOrderValue`, { withCredentials: true }),
        ]);

        const trendData = weeklyTrendRes.data.salesLast7Days;
        const dates = trendData.map(d => d.date); // e.g., ["2025-05-09", ...]
        const dailySales = trendData.map(d => d.totalSales);
        const totalWeekSales = dailySales.reduce((a, b) => a + b, 0);

        setSalesData({
          todaySales: salesTodayRes.data.totalSalesToday,
          weeklySales: totalWeekSales,
          totalOrders: totalOrdersRes.data.totalOrders,
          avgOrderValue: avgOrderValueRes.data.avgOrderValue,
          dates,
          dailySales
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, host]);

  const chartData = {
    labels: salesData?.dates || [],
    datasets: [{
      label: 'Daily Sales (₹)',
      data: salesData?.dailySales || [],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 fw-bold text-primary">
            <i className="bi bi-graph-up me-2"></i>
            Sales Dashboard
          </h1>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-2">Today's Sales</h6>
                  <h3 className="mb-0">₹{(salesData?.todaySales || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-currency-rupee text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-2">Weekly Sales</h6>
                  <h3 className="mb-0">₹{(salesData?.weeklySales || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-calendar-week text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-2">Total Orders</h6>
                  <h3 className="mb-0">{(salesData?.totalOrders || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cart-check text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-2">Avg. Order Value</h6>
                  <h3 className="mb-0">₹{(salesData?.avgOrderValue || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-graph-up text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">7-Day Sales Trend</h5>
              <div style={{ height: '400px' }}>
                <Line 
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            return `₹${context.raw.toLocaleString()}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        grid: { drawBorder: false },
                        ticks: {
                          callback: function(value) {
                            return `₹${value.toLocaleString()}`;
                          }
                        }
                      },
                      x: {
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
