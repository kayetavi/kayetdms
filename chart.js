// 🔁 Global chart instance
let corrosionChart;

// 📊 Function to draw corrosion chart
function drawChart(rates, labels) {
  const ctx = document.getElementById('myChart').getContext('2d');

  // Destroy previous chart if it exists
  if (corrosionChart) {
    corrosionChart.destroy();
  }

  // Create new chart
  corrosionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels, // e.g., ["32°C"]
      datasets: [{
        label: 'Corrosion Rate (mm/year)',
        data: rates, // e.g., [0.254]
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Corrosion Rate (mm/year)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        }
      }
    }
  });
}
