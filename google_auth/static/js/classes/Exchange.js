let totalAllocation = {}
let user_exchanges_data = {}
let exchangeData = {}
let names = {}
let res_values = {}

class Exchange {
  constructor() {
    this.dataTable = [
      "Coin",
      "Name",
      "Total",
      "Available",
      "In order",
      "BTC value",
      "USDT value",
      "PNL",
      "BTC PNL",
      "USDT PNL",
      "BTC PNL %",
      "USDT PNL %",
    ];
    this.getData();
    this.benchmark_types = ["BTC", "USDT"];
    this.utils = new UtilsJS();
    this.chart = new ChartRender();
  }

  async getData() {
    let namesL = await fetch("/exchanges/api/get_names");
    names = await namesL.json();
    const values = await fetch("/exchanges/api/get_values");
    res_values = await values.json();
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let user_exchanges = await fetch(
      "/exchanges/api/get_user_exchange_date_api/",
      {
        method: "POST",
        body: JSON.stringify({
          date: yesterday,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    );
    user_exchanges_data = await user_exchanges.json();
  }

  async makeTables(types) {
    this.exchange_types = types["types"];
    this.datas = types["data"];
    for (let data in this.datas) {
      exchangeData = await fetch("/exchanges/api/get_exchanges_data_api/", {
        method: "POST",
        body: JSON.stringify({
          type: this.exchange_types[this.datas[data]["typeExchange_id"]],
          key: this.datas[data]["key"],
          secret_key: this.datas[data]["secret_key"],
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });
      exchangeData = await exchangeData.json();
      let name = this.utils.titleCase(
        `${this.exchange_types[this.datas[data]["typeExchange_id"]]} ${
          this.datas[data]["comment"]
        }`
      );
      if (
        this.exchange_types[this.datas[data]["typeExchange_id"]] === "binance"
      ) {
        new Binance(this.exchange_types, this.datas, name, data,names).render();
      }
      else if (
        this.exchange_types[this.datas[data]["typeExchange_id"]] === "bitmex"
      ) {
        new Bitmex(this.exchange_types, this.datas, name, data).render();
      }
    }
  }

  get_benchmark_values(type_currency, value_currency, benchmark, res_values) {
    let res = 0;
    try {
      let btc = res_values[`${type_currency}/${benchmark}`]["last"];
      res = parseFloat(value_currency) * parseFloat(btc)
    } catch (e) {
      try {
        let btc = res_values[`${benchmark}/${type_currency}`]["last"];
        res = parseFloat(value_currency) / parseFloat(btc)
      } catch (error) {
        if (type_currency === benchmark) {
          res = parseFloat(value_currency);
        }
      }
    }
    return res;
  }

  get_pnl(pnl_val, benchmark, last_exchange) {
    let pnl_value = 0;
    try {
      pnl_value = this.utils.numberToString(pnl_val - last_exchange[benchmark]);
    } catch (e) {
      pnl_value = this.utils.toFixed(pnl_val);
    }
    return pnl_value;
  }

  get_pnl_percent(pnl_val, benchmark, last_exchange) {
    let pnl_value = 0;
    if (last_exchange[benchmark] !== 0) {
      try {
      pnl_value =
        ((pnl_val - last_exchange[benchmark]) / last_exchange[benchmark]) * 100;
      pnl_value = pnl_value === 0 ? pnl_value : pnl_value.toFixed(2);
      } catch (e) {
        pnl_value = pnl_val;
      }
    }
    console.log(pnl_value)
    return pnl_value;
  }

  get_last_pnl_coin(val, _type, _id, exchange) {
    let pnl_value = 0;
    try {
      let value = exchange[_id]["coins"][_type]["total"];
      pnl_value = this.utils.toFixed(parseFloat(val) - parseFloat(value));
    } catch (error) {
      pnl_value = val;
    }
    return pnl_value;
  }

  get_last_pnl(val, benchmark, _type, _id, exchange) {
    let pnl_value = 0;
    try {
      let value = exchange[_id]["coins"][_type][`${benchmark}_value`];
      pnl_value = this.utils.numberToString(parseFloat(val) - parseFloat(value));
    } catch (error) {
      pnl_value = val;
    }
    return pnl_value;
  }

  get_last_pnl_percent(val, benchmark, _type, _id, exchange) {
    let pnl_value = 0;
    try {
      let value = exchange[_id]["coins"][_type][`${benchmark}_value`];
      pnl_value = this.utils.toFixed(
        parseFloat((parseFloat(val) - parseFloat(value)) / parseFloat(value)) *
          100
      );
    } catch (error) {
      pnl_value = val;
    }
    return pnl_value;
  }

  get_last_total_pnl(val, benchmark, _id, exchange) {
    let pnl_value = 0;
    try {
      let value = exchange[_id][`total${benchmark}`];
      
      pnl_value = this.utils.numberToString(parseFloat(val) - parseFloat(value));
    } catch (error) {
      pnl_value = this.utils.toFixed(parseFloat(val));
    }
    return pnl_value;
  }

  get_last_total_pnl_percent(val, benchmark, _id, exchange) {
    let pnl_value = 0;
    try {
      let value = exchange[_id][`total${benchmark}`];
      pnl_value = this.utils.toFixed(
        parseFloat((parseFloat(val) - parseFloat(value)) / parseFloat(value)) *
          100
      );
    } catch (error) {
      pnl_value = val;
    }
    return pnl_value;
  }
}
