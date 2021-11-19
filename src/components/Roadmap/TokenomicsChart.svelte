<script>
    import { onMount } from "svelte";
   
    const fontSize = 15;

    const chartData = {
      labels: [
            "Locked in the House",
            "Public Sale", 
            "Locked in LP", 
            "Development Team", 
            "Airdrops & Contests", 
            "Marketing & Partnerships", 
        ],
      datasets: [
        {
          label: "PHI Tokenomics",
          data: [
            500000000, 
            200000000, 
            100000000, 
            100000000, 
            50000000, 
            50000000, 
            ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)"

          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"

          ],
          borderWidth: 1,
          datalabels: {
            anchor: 'center',
            backgroundColor: null,
            borderWidth: 0
          }
        }
      ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {

        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxHeight: fontSize,
                    font: {
                        size: fontSize
                    }
                }
            },
            datalabels: {
              backgroundColor: function(context) {
                return context.dataset.backgroundColor;
              },
              borderColor: 'white',
              borderRadius: 25,
              borderWidth: 2,
              color: 'white',
              display: function(context) {
                var dataset = context.dataset;
                var count = dataset.data.length;
                var value = dataset.data[context.dataIndex];
                return Math.round(value/10000000).toString() + "%";
              },
              font: {
                weight: 'bold'
              },
              padding: 6,
              formatter: Math.round
            }
        }
    };
    function createChart() {
      var ctx = document.getElementById("myPieChart");
      var myChart = new Chart(ctx, {
        type: "pie",
        data: chartData,
        options: chartOptions
      });
    }
    onMount(createChart);
  </script>
  
  <style>
    .chart {
      width: 100%;
    }
    @media (max-width: 480px) {
      .chart {
        width: 100%;
        flex: 1;
      }
    }
    @media screen and (max-width: 768px) {
      .chart {
        width: 90%;
        flex: 1;
      }
    }
    @media screen and (min-width: 769px) {
      .chart {
        width: 80%;
        flex: 1;
      }
    }
  </style>
  
  <div class="chart">
    <canvas id="myPieChart" />
  </div>
