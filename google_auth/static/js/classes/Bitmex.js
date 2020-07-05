class Bitmex extends Exchange {
  constructor(exchange_types, datas, name, data) {
    super();
    this.dataTablePositions = ["Symbol", "Size", "Price", "Value", "Leverage"];
    this.exchange_types = exchange_types;
    this.datas = datas;
    this.name = name;
    this.data = data;
    console.log(this.exchange_types,this.datas,this.name,this.data, exchangeData)
  }
  async render() {
    let openPositions = await fetch(
      "/exchanges/api/get_bitmex_positions_api/",
      {
        method: "POST",
        body: JSON.stringify({
          type: this.exchange_types[this.datas[this.data]["typeExchange_id"]],
          key: this.datas[this.data]["key"],
          secret_key: this.datas[this.data]["secret_key"],
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    );
    openPositions = await openPositions.json();
    $(`.${this.name}-table`).append(`
      <div class="card shadow mb-4" id="${this.name}Box">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">
            ${this.name}
          </h6>
        </div>
        <div class="card-body">
          <div class="text-center" id="${this.name}Loader" style="display: block;">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
          <div class="table-responsive">
            <table
              class="table table-bordered"
              id="${this.name}"
              cellspacing="0"
              style="display: none;"
            >
              <thead>
                <tr></tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="card shadow mb-4" id="${this.name}Position">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">
            Open Positions
          </h6>
        </div>
        <div class="card-body">
          <div class="text-center" id="${this.name}PotisionLoader" style="display: block;">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
          <div class="table-responsive">
            <table
              class="table table-bordered"
              id="${this.name}TableOpenPositions"
              cellspacing="0"
              style="display: none;"
            >
              <thead>
                <tr></tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    `);
    $(`#${this.name}InitialLoader`).css("display", "none");
    for (let i in this.dataTable) {
      $(
        `.${this.name}-table>div#${this.name}Box>.card-body>.table-responsive>table>thead>tr`
      ).append(`<th scope="col">${this.dataTable[i]}</th>`);
    }
    for (let coin_data in exchangeData["total"]) {
      $(
        `.${this.name}-table>div#${this.name}Box>.card-body>.table-responsive>table>tbody`
      ).append(`
          <tr>
            <td>${coin_data}</td>
            <td>${names[coin_data] ? names[coin_data].name : coin_data}</td>
            <td id="${this.name}-total-${coin_data}">0</td>
            <td id="${this.name}-free-${coin_data}">0</td>
            <td id="${this.name}-used-${coin_data}">0</td>
            <td id="${this.name}-btc-total-${coin_data}">
              0
            </td>
            <td id="${this.name}-usdt-total-${coin_data}">
              0
            </td>
            <td id="${this.name}-pnl-${coin_data}">
              0
          </td>
          <td id="${this.name}-BTC-pnl-${coin_data}">
              0
          </td>
          <td id="${this.name}-USDT-pnl-${coin_data}">
              0
          </td>
          <td id="${this.name}-BTC-pnl-percent-${coin_data}">
              0
          </td>
          <td id="${this.name}-USDT-pnl-percent-${coin_data}">
              0
          </td>
        </tr>
          `);
    }
    for (let i in this.dataTablePositions) {
      $(
        `.${this.name}-table>div#${this.name}Position>.card-body>.table-responsive>table>thead>tr`
      ).append(`<th scope="col">${this.dataTablePositions[i]}</th>`);
    }
    for (let i in openPositions) {
      $(
        `.${this.name}-table>div#${this.name}Position>.card-body>.table-responsive>table>tbody`
      ).append(`
          <tr>
            <td>${openPositions[i].symbol}</td>
            <td>${openPositions[i].currentQty}</td>
            <td
              id="${this.name}TableOpenPositions-lastPrice-${openPositions[i].symbol}"
            >
              0
            </td>
            <td
              id="${this.name}TableOpenPositions-lastValue-${openPositions[i].symbol}"
            >
              0
            </td>
            <td>${openPositions[i].leverage}</td>
        </tr>
          `);
    }
    this.get_values_bitmex(
      exchangeData["total"],
      this.name,
      openPositions,
      exchangeData
    );
    this.chart.makeAllocationData(
    "assetAllocationChart",
    totalAllocation
  );
  }

  async get_values_bitmex(types, name, openPositions, typesData) {
    let exchange_id = $(`.${name}-table`).data("id");
    let total_values = {
      BTC: this.utils.toFixed(parseFloat($(`#total-BTC-value`)[0].textContent)),
      USDT: this.utils.toFixed(parseFloat($(`#total-USDT-value`)[0].textContent)),
    };
    let total_values_margin = { BTC: 0, USDT: 0 };
    for (let i in types) {
      if (types[i] !== 0) {
        const res_val_btc = this.get_benchmark_values(
          i,
          types[i],
          "BTC",
          res_values
        );
        const res_val_usdt = this.get_benchmark_values(
          "BTC",
          res_val_btc,
          "USDT",
          res_values
        );
        total_values["BTC"] += parseFloat(res_val_btc);
        total_values["USDT"] += parseFloat(res_val_usdt);
        total_values_margin["BTC"] += parseFloat(res_val_btc);
        total_values_margin["USDT"] += parseFloat(res_val_usdt);
        $(`#${name}-total-${i}`).html(typesData[i]["total"]);
        $(`#${name}-free-${i}`).html(typesData[i]["free"]);
        $(`#${name}-used-${i}`).html(typesData[i]["used"]);

        if (totalAllocation[i]) {
          totalAllocation[i] += parseFloat(res_val_btc);
        } else {
          totalAllocation[i] = parseFloat(res_val_btc);
        }
        if (totalAllocation["total"]) {
          totalAllocation["total"] += parseFloat(res_val_btc);
        } else {
          totalAllocation["total"] = parseFloat(res_val_btc);
        }

        $(`#total-${name}-BTC-values`).html(total_values_margin["BTC"]);
        $(`#total-${name}-USDT-values`).html(total_values_margin["USDT"]);

        let pnl_coin = this.get_last_pnl_coin(
          types[i],
          i,
          `Bitmex-${exchange_id}`,
          user_exchanges_data
        );
        $(`#${name}-pnl-${i}`).html(this.utils.toFixed(pnl_coin));

        for (let currency in this.benchmark_types) {
          let pnl = this.get_last_pnl(
            this.benchmark_types[currency] === "BTC" ? res_val_btc : res_val_usdt,
            this.benchmark_types[currency],
            i,
            `Bitmex-${exchange_id}`,
            user_exchanges_data
          );
          $(`#${name}-${this.benchmark_types[currency]}-pnl-${i}`).html(pnl);
          let pnl_percent = this.get_last_pnl_percent(
            this.benchmark_types[currency] === "BTC" ? res_val_btc : res_val_usdt,
            this.benchmark_types[currency],
            i,
            `Bitmex-${exchange_id}`,
            user_exchanges_data
          );
          $(`#${name}-${this.benchmark_types[currency]}-pnl-percent-${i}`).html(
            Math.round((parseFloat(pnl_percent) + Number.EPSILON) * 100) / 100
          );
        }

        $(`#total-BTC-values`).html(total_values["BTC"]);
        $(`#total-USDT-values`).html(total_values["USDT"]);

        $(`#total-BTC-value`).html(total_values["BTC"]);
        $(`#total-USDT-value`).html(parseInt(total_values["USDT"]));
        $(`#${name}-btc-total-${i}`).html(res_val_btc);
        $(`#${name}-usdt-total-${i}`).html(res_val_usdt);
      }
    }

    for (let currency in this.benchmark_types) {
      let pnl_total = this.get_last_total_pnl(
        total_values_margin[this.benchmark_types[currency]],
        this.benchmark_types[currency],
        `Bitmex-${exchange_id}`,
        user_exchanges_data
      );
      $(`#total-${name}-${this.benchmark_types[currency]}-pnl`).html(pnl_total);
      $(`#total-${this.benchmark_types[currency]}-pnl`).html(
        this.utils.toFixed(
          parseFloat(
            $(`#total-${this.benchmark_types[currency]}-pnl`)[0].textContent
          ) + parseFloat(pnl_total)
        )
      );
    }

    for (let i in openPositions) {
      const xbt = 0.00000001; // 1 XBt(Satoshi) = 0.00000001 XBT(Bitcoin).
      const usd = 0.0001;
      let value;
      if (openPositions[i]["quoteCurrency"] === "USD") {
        value =
          (openPositions[i]["lastValue"] / openPositions[i]["lastPrice"]) * usd;
      } else if (openPositions[i]["quoteCurrency"] === "XBT") {
        value =
          (openPositions[i]["lastValue"] / openPositions[i]["lastPrice"]) * xbt;
      } else {
        value = openPositions[i]["lastValue"] / openPositions[i]["lastPrice"];
      }
      $(
        `#${name}TableOpenPositions-lastPrice-${openPositions[i]["symbol"]}`
      ).html(this.utils.toFixed(parseFloat(openPositions[i]["lastPrice"])));
      $(
        `#${name}TableOpenPositions-lastValue-${openPositions[i]["symbol"]}`
      ).html(`${this.utils.toFixed(parseFloat(value))} ${openPositions[i]["underlying"]}`);
    }
    let tableSpot = $(`#${name}`).DataTable();
    $(`#${name}_length>label`)
      .after(`<div class="custom-control custom-checkbox mr-sm-2 table-checkbox" id="${name}HideLowBalanceLabel" style="display: none;">
    <input
      type="checkbox"
      class="custom-control-input"
      id="${name}HideLowBalance"
    />
    <label class="custom-control-label" for="${name}HideLowBalance"
      >Hide low balance assets</label
    >
  </div>`);
    $(`#${name}`).css("display", "table");
    $(`#${name}HideLowBalanceLabel`).css("display", "block");
    $(`#${name}Loader`).css("display", "none");
    $(`#${name}HideLowBalance`).change(() => {
      tableSpot.draw();
    });
    $(`#${name}TableOpenPositions`).DataTable();
    $(`#${name}TableOpenPositions`).css("display", "table");
    $(`#${name}PotisionLoader`).css("display", "none");
  }
}
