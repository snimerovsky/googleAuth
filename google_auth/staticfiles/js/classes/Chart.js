class ChartRender {
  constructor(colors = ["#43CDCB", "#495DF3", "#754695"], time = 86400000) {
    this.colors = colors;
    this.day_milliseconds = time;
    this.getTypes()
  }

  getTypes() {
    let types = [];
    let checkboxes = document.querySelectorAll(
      'input[name="switch-exchanges-chart"]'
    );
    checkboxes.forEach((e) => {
      if (e.checked) {
        types.push(e.getAttribute("data-id"));
      }
    });
    this.types = types;
  }

  async getData() {
    let data = await fetch("/exchanges/api/get_all_exchanges");
    data = await data.json();
    return JSON.parse(data.exchanges);
  }

  getChart(seriesData,containerId,selectId=false,options) {
    console.log(selectId)
      let chart = Highcharts.stockChart(containerId, {
        lang: {
          loading: "Идет загрузка...",
        },
        plotOptions: {
          spline: {
            pointInterval: 86400000,
            linecap: "butt",
          },
          column: {
            pointInterval: 86400000,
            linecap: "butt",
          },
          bar: {
            pointInterval: 86400000,
            linecap: "butt",
          },
          series: {
            dataGrouping: {
              enabled: false,
            },
          },
        },
        colors: this.colors,
        rangeSelector: {
          enabled: false,
        },
        scrollbar: {
          enabled: false,
          liveRedraw: true,
        },
        tooltip: {
          xDateFormat: "%d.%m.%Y",
          valueSuffix: options.valueSuffix,
        },
        legend: {
          enabled: false,
        },
        title: {
          enabled: false,
        },
        chart: {
          height: "50%",
          backgroundColor: "#22273A",
          plotBorderColor: "#111111",
          style: {
            fontFamily: "OpenSans-Light, sans-serif",
          },
        },
        loading: {
          style: {
            fontSize: "35px",
            color: "#ccc",
            backgroundColor: "#22273A",
          },
        },
        labels: {
          backgroundColor: "#ccc",
        },
        navigator: {
          enabled: false,
          adaptToUpdatedData: true,
        },
        series: [...seriesData],
        exporting: {
          enabled: false,
        },
        xAxis: {
          startOnTick: false,
          endOnTick: true,
          dateTimeLabelFormats: {
            day: {
              main: "%d.%m.%Y",
            },
            month: {
              main: "%m.%Y",
            },
            millisecond: {
              main: "%d.%m.%Y",
            },
          },
          tickLength: 0,
          lineColor: "#4f5464",
          gridLineColor: "#4f5464",
          gridLineWidth: 1,
          tickPixelInterval: 164,
          labels: {
            style: {
              color: "#ccc",
              fontSize: "12px",
            },
          },
        },
        yAxis: [
          {
            lineColor: "#4f5464",
            lineWidth: 1,
            gridLineColor: "#4f5464",
            labels: {
              align: "left",
              format: options.format,
              style: {
                fontSize: "12px",
                color: "#ccc",
              },
            },
          },
        ],
      });
      if (selectId !== false) {
        let mySelect = document.getElementById(selectId);
        function chose(selected) {
          chart.series.forEach((series) => {
            if (selected === series.name) {
              series.show();
            } else {
              series.hide();
            }
          });
        }
        
        mySelect.addEventListener("change", (event) => {
          chose(event.target.value);
        });
      }
  }

  getPieChart(
    chartId,
    data,
    pointFormat = "allocates: <b>{point.percentage:.1f}%</b>",
    format = "<b>{point.name}</b>: {point.percentage:.1f} %"
  ) {
    try {
      Highcharts.chart(chartId, {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: "pie",
        },
        title: {
          enabled: false,
          text: "",
        },
        tooltip: {
          pointFormat,
        },
        accessibility: {
          point: {
            valueSuffix: "%",
          },
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              format,
            },
          },
        },
        series: [
          {
            colorByPoint: true,
            data: data,
          },
        ],
      });
    } catch (error) {}
  }

  async makeAllocationData(chartId, totalAllocation) {
    let seriesValues = [];
    let names = await fetch("/exchanges/api/get_names");
    names = await names.json();

    for (let j in totalAllocation) {
      if (j === "total") continue;
      let name = names[j] ? names[j]["name"] : j;
      seriesValues.push({
        name: name,
        y: (totalAllocation[j] / totalAllocation["total"]) * 100,
      });
    }
    let sortedValues = seriesValues.slice(0);
    sortedValues.sort(function (a, b) {
      return b.y - a.y;
    });
    this.getPieChart(chartId, sortedValues);
    $("#assetAllocationLoader").css("display", "none");
  }

  getAllocationData(array, types) {
    let res = {};
    types.forEach((type) => {
      try {
        for (let i in array.fields.data[type].coins) {
          if (array.fields.data[type].coins[i].BTC_value > 0) {
            console.log(array.fields.data[type].coins[i].BTC_value);
            if (res[i]) {
              res[i] += parseFloat(array.fields.data[type].coins[i].BTC_value);
            } else {
              res[i] = parseFloat(array.fields.data[type].coins[i].BTC_value);
            }
          }
        }
        for (let i in array.fields.data[type]) {
          if (i === "totalBTC") {
            if (res["total"]) {
              res["total"] += array.fields.data[type][i];
            } else {
              res["total"] = array.fields.data[type][i];
            }
          }
        }
      } catch {}
    });
    this.makeAllocationData("assetAllocationChart", res);
  }
}
