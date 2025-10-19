// This file is intentionally left blank.
// Chart.js integration for Bucks2Bar - reads income/expenses inputs and renders a net bar chart.
(function () {
  const months = [
    { key: "jan", label: "January" }, { key: "feb", label: "February" },
    { key: "mar", label: "March" },   { key: "apr", label: "April" },
    { key: "may", label: "May" },     { key: "jun", label: "June" },
    { key: "jul", label: "July" },    { key: "aug", label: "August" },
    { key: "sep", label: "September" },{ key: "oct", label: "October" },
    { key: "nov", label: "November" },{ key: "dec", label: "December" }
  ];

  const canvas = document.getElementById("chartCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months.map(m => m.label),
      datasets: [{
        label: "Net (Income − Expenses)",
        data: Array(months.length).fill(0),
        backgroundColor: months.map(() => "rgba(54,162,235,0.7)"),
        borderColor: months.map(() => "rgba(54,162,235,1)"),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: true } }
    }
  });

  function readDataAndUpdate() {
    const nets = months.map(m => {
      const inc = document.getElementById(`income-${m.key}`);
      const exp = document.getElementById(`expenses-${m.key}`);
      const income = inc ? parseFloat(inc.value) || 0 : 0;
      const expenses = exp ? parseFloat(exp.value) || 0 : 0;
      return +(income - expenses).toFixed(2);
    });
    chart.data.datasets[0].data = nets;
    chart.update();
  }

  // Attach listeners
  months.forEach(m => {
    const inc = document.getElementById(`income-${m.key}`);
    const exp = document.getElementById(`expenses-${m.key}`);
    if (inc) inc.addEventListener("input", readDataAndUpdate);
    if (exp) exp.addEventListener("input", readDataAndUpdate);
  });

  // Update when chart tab shown to ensure proper sizing
  const chartTabBtn = document.getElementById("chart-tab");
  if (chartTabBtn) {
    chartTabBtn.addEventListener("shown.bs.tab", () => {
      chart.resize();
      readDataAndUpdate();
    });
  }

function setupChartDownload(chartInstance) {
    const downloadBtn = document.getElementById('downloadChartBtn');
    const openBtn = document.getElementById('openChartBtn');

    if (!downloadBtn && !openBtn) return;

    function getDataUrl() {
      try {
        if (chartInstance && typeof chartInstance.toBase64Image === 'function') {
          return chartInstance.toBase64Image(); // Chart.js preferred
        }
      } catch (e) {
        // fall through to canvas fallback
      }
      // Fallback: use the actual canvas id used in index.html
      const canvas = document.getElementById('chartCanvas');
      return canvas ? canvas.toDataURL('image/png') : null;
    }

    downloadBtn && downloadBtn.addEventListener('click', () => {
      const url = getDataUrl();
      if (!url) { alert('Chart image not available.'); return; }
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bucks2bar-monthly.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    openBtn && openBtn.addEventListener('click', () => {
      const url = getDataUrl();
      if (!url) { alert('Chart image not available.'); return; }
      window.open(url, '_blank', 'noopener');
    });
  }

  // Call the setup so the buttons are wired
  setupChartDownload(chart);

  // Initial render
  readDataAndUpdate();

  // Expose for debugging (optional)
  window.bucks2bar = { months, readDataAndUpdate };
})();


