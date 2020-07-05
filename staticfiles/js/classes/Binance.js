class Binance extends Exchange {
  constructor(exchange_types, datas, name, data) {
    super();
    this.exchange_types = exchange_types;
    this.datas = datas;
    this.name = name;
    this.data = data;
    console.log(this.exchange_types,this.datas,this.name,this.data, exchangeData)
  }

  async render() {
    let exchangeDataTotal;
    let exchangeDataMargin = await fetch(
      "/exchanges/api/get_exchanges_data_margin_api/",
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
    exchangeDataMargin = await exchangeDataMargin.json();
    let dataKeys = Object.keys(exchangeDataMargin["total"]);
    let dataMarginKeys = Object.keys(exchangeData["total"]);
    exchangeDataTotal = [...new Set(dataKeys.concat(dataMarginKeys))];
    let typesTable = {
      SpotMargin: "spot+margin",
      Spot: "spot",
      Margin: "margin",
    };
    for (let typeTable in typesTable) {
      $(`.${this.name}-table`).append(`
            <div class="card shadow mb-4" id="${this.name}${typeTable}Box">
              <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">
                  ${this.name} ${typesTable[typeTable]}
                </h6>
              </div>
              <div class="card-body">
                <div
                  class="text-center"
                  id="${this.name}${typeTable}Loader"
                  style="display: block;"
                >
                  <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
                <div class="table-responsive">
                  <table
                    class="table table-bordered"
                    id="${this.name}${typeTable}"
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
          `.${this.name}-table>div#${this.name}${typeTable}Box>.card-body>.table-responsive>table>thead>tr`
        ).append(`<th scope="col">${this.dataTable[i]}</th>`);
      }
      let forDataLoop;
      if (typesTable[typeTable] === "margin") {
        forDataLoop = Object.keys(exchangeDataMargin["total"]);
      } else if (typesTable[typeTable] === "spot") {
        forDataLoop = Object.keys(exchangeData["total"]);
      } else {
        forDataLoop = exchangeDataTotal;
      }
      console.log(forDataLoop,names)
      for (let coin_data in forDataLoop) {
        $(
          `.${this.name}-table>div#${this.name}${typeTable}Box>.card-body>.table-responsive>table>tbody`
        ).append(`
            <tr>
              <td>${forDataLoop[coin_data]}</td>
              <td>${
                names[forDataLoop[coin_data]]
                  ? names[forDataLoop[coin_data]].name
                  : forDataLoop[coin_data]
              }</td>
              <td id="${this.name}${typeTable}-total-${
          forDataLoop[coin_data]
        }">0</td>
              <td id="${this.name}${typeTable}-free-${
          forDataLoop[coin_data]
        }">0</td>
              <td id="${this.name}${typeTable}-used-${
          forDataLoop[coin_data]
        }">0</td>
              <td id="${this.name}${typeTable}-btc-total-${
          forDataLoop[coin_data]
        }">
                0
              </td>
              <td id="${this.name}${typeTable}-usdt-total-${
          forDataLoop[coin_data]
        }">
                0
              </td>
              <td id="${this.name}${typeTable}-pnl-${forDataLoop[coin_data]}">
                0
              </td>
              <td id="${this.name}${typeTable}-BTC-pnl-${
          forDataLoop[coin_data]
        }">
                0
              </td>
              <td id="${this.name}${typeTable}-USDT-pnl-${
          forDataLoop[coin_data]
        }">
                0
              </td>
              <td id="${this.name}${typeTable}-BTC-pnl-percent-${
          forDataLoop[coin_data]
        }">
                0
              </td>
              <td id="${this.name}${typeTable}-USDT-pnl-percent-${
          forDataLoop[coin_data]
        }">
                0
              </td>
          </tr>
            `);
      }
      if (typeTable === "Spot") {
        this.get_values_binance(
          exchangeData["total"],
          this.name,
          typeTable,
          exchangeData
        );
      }
      if (typeTable === "Margin") {
        this.get_values_binance(
          exchangeDataMargin["total"],
          this.name,
          typeTable,
          exchangeDataMargin
        );
      }
    }
    this.chart.makeAllocationData(
    "assetAllocationChart",
    totalAllocation
  );
  }

  async get_values_binance(types, name, exchangeTypeUser, typesData) {
    const id = exchangeTypeUser === "Spot" ? "Binance" : "BinanceMargin";
    let exchange_id = $(`.${name}-table`).data("id");
    let total_values = {
      BTC: this.utils.toFixed(parseFloat($(`#total-BTC-value`)[0].textContent)),
      USDT: this.utils.toFixed(parseFloat($(`#total-USDT-value`)[0].textContent)),
    };
    let total_values_exchange = { BTC: 0, USDT: 0 };
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
        total_values_exchange["BTC"] += parseFloat(res_val_btc);
        total_values_exchange["USDT"] += parseFloat(res_val_usdt);
        $(`#${name}${exchangeTypeUser}-total-${i}`).html(typesData[i]["total"]);
        $(`#${name}${exchangeTypeUser}-free-${i}`).html(typesData[i]["free"]);
        $(`#${name}${exchangeTypeUser}-used-${i}`).html(typesData[i]["used"]);

        
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

        if (exchangeTypeUser !== "SpotMargin") {
          let totalSpot, freeSpot, usedSpot;

          try {
            totalSpot = this.utils.toFixed(
              parseFloat(
                $(`#${name}${exchangeTypeUser}-total-${i}`)[0].textContent
              ) + parseFloat($(`#${name}SpotMargin-total-${i}`)[0].textContent)
            );
            freeSpot = this.utils.toFixed(
              parseFloat(
                $(`#${name}${exchangeTypeUser}-free-${i}`)[0].textContent
              ) + parseFloat($(`#${name}SpotMargin-free-${i}`)[0].textContent)
            );
            usedSpot = this.utils.toFixed(
              parseFloat(
                $(`#${name}${exchangeTypeUser}-used-${i}`)[0].textContent
              ) + parseFloat($(`#${name}SpotMargin-used-${i}`)[0].textContent)
            );
          } catch {}

          $(`#${name}SpotMargin-total-${i}`).html(totalSpot);
          $(`#${name}SpotMargin-free-${i}`).html(freeSpot);
          $(`#${name}SpotMargin-used-${i}`).html(usedSpot);

          let pnl_coin = this.get_last_pnl_coin(
            types[i],
            i,
            `${id}-${exchange_id}`,
            user_exchanges_data
          );
          $(`#${name}${exchangeTypeUser}-pnl-${i}`).html(this.utils.toFixed(pnl_coin));
          $(`#${name}SpotMargin-pnl-${i}`).html(
            this.utils.toFixed(
              parseFloat($(`#${name}SpotMargin-pnl-${i}`)[0].textContent) +
                parseFloat(pnl_coin)
            )
          );

          for (let currency in this.benchmark_types) {
            let pnl = this.get_last_pnl(
              this.benchmark_types[currency] === "BTC" ? res_val_btc : res_val_usdt,
              this.benchmark_types[currency],
              i,
              `${id}-${exchange_id}`,
              user_exchanges_data
            );
            $(
              `#${name}${exchangeTypeUser}-${this.benchmark_types[currency]}-pnl-${i}`
            ).html(pnl);
            $(`#${name}SpotMargin-${this.benchmark_types[currency]}-pnl-${i}`).html(
              this.utils.toFixed(
                parseFloat(
                  $(
                    `#${name}SpotMargin-${this.benchmark_types[currency]}-pnl-${i}`
                  )[0].textContent
                ) + parseFloat(pnl)
              )
            );
            let pnl_percent = this.get_last_pnl_percent(
              this.benchmark_types[currency] === "BTC" ? res_val_btc : res_val_usdt,
              this.benchmark_types[currency],
              i,
              `${id}-${exchange_id}`,
              user_exchanges_data
            );
            $(
              `#${name}${exchangeTypeUser}-${this.benchmark_types[currency]}-pnl-percent-${i}`
            ).html(
              Math.round(
                (parseFloat(pnl_percent) + Number.EPSILON) * 100
              ) / 100
            );
            $(
              `#${name}SpotMargin-${this.benchmark_types[currency]}-pnl-percent-${i}`
            ).html(
              this.utils.toFixed(
                parseFloat(
                  $(
                    `#${name}SpotMargin-${this.benchmark_types[currency]}-pnl-percent-${i}`
                  )[0].textContent
                ) +
                  parseFloat(
                    Math.round(
                      (parseFloat(pnl_percent) + Number.EPSILON) * 100
                    ) / 100
                  )
              )
            );
          }
        }

        if (exchangeTypeUser === "Margin") {
          $(`#total-${name}-margin-BTC-values`).html(
            total_values_exchange["BTC"]
          );
          $(`#total-${name}-margin-USDT-values`).html(
            total_values_exchange["USDT"]
          );
        } else {
          $(`#total-${name}-BTC-values`).html(total_values_exchange["BTC"]);
          $(`#total-${name}-USDT-values`).html(total_values_exchange["USDT"]);
        }
        $(`#total-BTC-values`).html(total_values["BTC"]);
        $(`#total-USDT-values`).html(total_values["USDT"]);

        $(`#total-BTC-value`).html(total_values["BTC"]);
        $(`#total-USDT-value`).html(total_values["USDT"]);

        $(`#${name}${exchangeTypeUser}-btc-total-${i}`).html(res_val_btc);
        $(`#${name}${exchangeTypeUser}-usdt-total-${i}`).html(res_val_usdt);

        $(`#${name}SpotMargin-btc-total-${i}`).html(
          this.utils.toFixed(
            parseFloat(res_val_btc) +
              parseFloat($(`#${name}SpotMargin-btc-total-${i}`)[0].textContent)
          )
        );
        $(`#${name}SpotMargin-usdt-total-${i}`).html(
          this.utils.toFixed(
            parseFloat(res_val_usdt) +
              parseFloat($(`#${name}SpotMargin-usdt-total-${i}`)[0].textContent)
          )
        );
      }
    }

    for (let currency in this.benchmark_types) {
      let pnl_total = this.get_last_total_pnl(
        total_values_exchange[this.benchmark_types[currency]],
        this.benchmark_types[currency],
        `${id}-${exchange_id}`,
        user_exchanges_data
      );
      if (exchangeTypeUser === "Margin") {
        $(`#total-${name}-margin-${this.benchmark_types[currency]}-pnl`).html(
          pnl_total
        );
      } else {
        $(`#total-${name}-${this.benchmark_types[currency]}-pnl`).html(pnl_total);
      }
      $(`#total-${this.benchmark_types[currency]}-pnl`).html(
        this.utils.toFixed(
          parseFloat(
            $(`#total-${this.benchmark_types[currency]}-pnl`)[0].textContent
          ) + parseFloat(pnl_total)
        )
      );
    }

    let tableSpot = $(`#${name}${exchangeTypeUser}`).DataTable();
    $(`#${name}${exchangeTypeUser}_length>label`)
      .after(`<div class="custom-control custom-checkbox mr-sm-2 table-checkbox" id="${name}${exchangeTypeUser}HideLowBalanceLabel" style="display: none;">
    <input
      type="checkbox"
      class="custom-control-input"
      id="${name}${exchangeTypeUser}HideLowBalance"
    />
    <label class="custom-control-label" for="${name}${exchangeTypeUser}HideLowBalance"
      >Hide low balance assets</label
    >
  </div>`);
    $(`#${name}${exchangeTypeUser}`).css("display", "table");
    $(`#${name}${exchangeTypeUser}HideLowBalanceLabel`).css("display", "block");
    $(`#${name}${exchangeTypeUser}Loader`).css("display", "none");
    $(`#${name}${exchangeTypeUser}HideLowBalance`).change(() => {
      tableSpot.draw();
    });
    if (exchangeTypeUser === "Margin") {
      let tableSpotMargin = $(`#${name}SpotMargin`).DataTable();
      $(`#${name}SpotMargin_length>label`)
        .after(`<div class="custom-control custom-checkbox mr-sm-2 table-checkbox" id="${name}SpotMarginHideLowBalanceLabel" style="display: none;">
    <input
      type="checkbox"
      class="custom-control-input"
      id="${name}SpotMarginHideLowBalance"
    />
    <label class="custom-control-label" for="${name}SpotMarginHideLowBalance"
      >Hide low balance assets</label
    >
  </div>`);
      $(`#${name}SpotMargin`).css("display", "table");
      $(`#${name}SpotMarginHideLowBalanceLabel`).css("display", "block");
      $(`#${name}SpotMarginLoader`).css("display", "none");
      $(`#${name}SpotMarginHideLowBalance`).change(() => {
        tableSpotMargin.draw();
      });
    }
  }
}
