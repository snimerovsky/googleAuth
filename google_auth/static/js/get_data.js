const utils = new UtilsJS();
const exchange = new Exchange();
const chart = new ChartRender();

$(document).ready(async function () {
  utils.doFilters();
  let types = await fetch("/exchanges/api/get_user_exchange/", {
    method: "POST",
    body: JSON.stringify({
      id: $("#exchangeId").data("id"),
    }),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  });
  types = await types.json();
  await exchange.makeTables(types);

  const data = await chart.getData()

  renderTwoCharts(data)
});

function applyFilters() {
  utils.applyFilters()
}

async function renderTwoCharts(data) {
  chart.getTypes()
  let btc_data = [];
  let usdt_data = [];
  let btc_data_percent = [];
  let usdt_data_percent = [];
  let startDate;
  try {
    data.forEach((e) => {
      let res = 0;
      let res_percent = 0;
      chart.types.forEach((item) => {
        res += parseFloat(e.fields.data[item].totalBTC_pnl)
        res_percent += parseFloat(e.fields.data[item].totalBTC_pnl_percent)
      })
      btc_data.push(res)
      btc_data_percent.push(res_percent)
    })
    data.forEach((e) => {
      let res = 0;
      let res_percent = 0;
      chart.types.forEach((item) => {
        res += parseFloat(e.fields.data[item].totalUSDT_pnl)
        res_percent += parseFloat(e.fields.data[item].totalUSDT_pnl_percent)
      })
      usdt_data.push(res)
      usdt_data_percent.push(res_percent)
    })
    startDate = Date.parse(data[0].fields.date_time);

  } catch (error) {
    btc_data = []
    usdt_data = []
    startDate = new Date()
  }

  const seriesPnlPercent = [
    {
      showInNavigator: true,
      name: "PNL BTC",
      lineWidth: 3,
      data: btc_data_percent,
      pointStart: startDate,
      type: "spline",
      tooltip: {
        valueDecimals: 2,
      },
      color: chart.colors[0],
    },
    {
      showInNavigator: true,
      name: "PNL USDT",
      lineWidth: 3,
      data: usdt_data_percent,
      pointStart: startDate,
      type: "spline",
      tooltip: {
        valueDecimals: 2,
      },
      color: chart.colors[1],
      visible: false,
    },
  ]


  const seriesPnl = [
    {
      showInNavigator: true,
      name: "PNL BTC",
      lineWidth: 3,
      data: btc_data,
      pointStart: startDate,
      pointWidth: btc_data.length === 1 ? 100 : null,
      type: "column",
      color: chart.colors[0],
    },
    {
      showInNavigator: true,
      name: "PNL USDT",
      lineWidth: 3,
      data: usdt_data,
      pointStart: startDate,
      pointWidth: usdt_data.length === 1 ? 100 : null,
      type: "column",
      color: chart.colors[1],
      visible: false,
    },
  ]

  await chart.getChart(seriesPnlPercent, "container","selectBenchmark", {valueSuffix: '%',format:"{value} %"})
  await chart.getChart(seriesPnl, "containerPnl","selectBenchmarkPnl", {valueSuffix: '',format:"{value}"})
}