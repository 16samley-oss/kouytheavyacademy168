import React, { useEffect, useRef } from 'react';

const ChartComponent = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart instance
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Revenue',
              data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Enrollments',
              data: [100, 150, 220, 300, 200, 350, 400],
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)',
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold">Revenue & Enrollments</h3>
          <p className="text-sm text-gray-500">Last 7 months</p>
        </div>
        <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
          <option>Last 7 months</option>
          <option>Last 30 days</option>
          <option>Last year</option>
        </select>
      </div>
      <canvas ref={chartRef} height="250"></canvas>
    </div>
  );
};

export default ChartComponent;