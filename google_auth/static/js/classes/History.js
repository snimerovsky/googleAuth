class History {
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
    this.utils = new UtilsJS();
    this.chart = new ChartRender();
    this.destination = { from: "From", to: "To" };
    this.readyData()
  }

  async readyData() {
    this.renderRadios();
    this.utils.doFilters();
    let types = await fetch("/exchanges/api/get_all_user_history_api/");
    this.types = await types.json();
    await this.makeHistory(
      {
        from: JSON.parse(this.types.exchanges)[0],
        to: JSON.parse(this.types.exchanges)[
          JSON.parse(this.types.exchanges).length - 1
        ],
      },
      this.types_exchanges
    );
    await this.swichExchanges();
  }

  renderRadios() {
    this.types_exchanges = [];
    let checkboxes = document.querySelectorAll(
      'input[name="switch-exchanges-chart"]'
    );
    checkboxes.forEach((e) => {
      if (e.checked) {
        this.types_exchanges.push(e.getAttribute("data-id"));
      }
    });
    for (let i in this.types_exchanges) {
      $('div[name="radiosFrom"]').append(`
    <div class="custom-control custom-radio">
      <input
        type="radio"
        class="custom-control-input"
        id="${$(`label[data-idLabel="${this.types_exchanges[i]}"]`).data(
          "namelabel"
        )}SwitcherFrom"
        name="exchange-switch-from"
        data-id="${this.types_exchanges[i]}SwitcherFrom"
        data-name="${$(`label[data-idLabel="${this.types_exchanges[i]}"]`).data(
          "namelabel"
        )}"
        required
      />
      <label class="custom-control-label" for="${$(
        `label[data-idLabel="${this.types_exchanges[i]}"]`
      ).data("namelabel")}SwitcherFrom" data-idTable="${
        this.types_exchanges[i]
      }" name="exchange-switch-from">${$(
        `label[data-idLabel="${this.types_exchanges[i]}"]`
      ).data("namelabel")}</label>
    </div>
  `);
      $('div[name="radiosTo"]').append(`
    <div class="custom-control custom-radio">
      <input
        type="radio"
        class="custom-control-input"
        id="${$(`label[data-idLabel="${this.types_exchanges[i]}"]`).data(
          "namelabel"
        )}SwitcherTo"
        name="exchange-switch-to"
        data-id="${this.types_exchanges[i]}SwitcherTo"
        data-name="${$(`label[data-idLabel="${this.types_exchanges[i]}"]`).data(
          "namelabel"
        )}"
        required
      />
      <label class="custom-control-label" for="${$(
        `label[data-idLabel="${this.types_exchanges[i]}"]`
      ).data("namelabel")}SwitcherTo" data-idTable="${
        this.types_exchanges[i]
      }" name="exchange-switch-to">${$(
        `label[data-idLabel="${this.types_exchanges[i]}"]`
      ).data("namelabel")}</label>
    </div>
  `);
    }
  }

  async makeHistory(distinate, types) {
    for (let dest in this.destination) {
      let tablesEmptyFrom = document.querySelectorAll(
      `div[name="table${this.destination[dest]}"]`
      );
      tablesEmptyFrom.forEach((e) => {
        $(e).empty();
      });
      let totalFromBTC = 0;
      let totalFromUSDT = 0;
      let res_from = {};
      const radioInput = document.querySelectorAll(
        `input[name="exchange-switch-${dest}"]`
      )[0];
      radioInput.setAttribute("checked", true);
      let fromTables = document.querySelectorAll(
        `div[name="table${this.destination[dest]}"]`
      );
      $(fromTables[0]).css("display", "block");

      const fromTextes = document.querySelectorAll(`#${dest}`);
      let names = await fetch("/exchanges/api/get_names");
      names = await names.json();
      const dateFrom = new Date(distinate[dest].fields.date_time);
      const dateTimeFormatFrom = new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const [
        { value: monthFrom },
        ,
        { value: dayFrom },
        ,
        { value: yearFrom },
      ] = dateTimeFormatFrom.formatToParts(dateFrom);
      fromTextes.forEach((formText) => {
        $(formText).html(`${dayFrom}.${monthFrom}.${yearFrom}`);
      });
      $(`tbody#dataTable${this.destination[dest]}`).empty()
        $(`tbody#dataTable${this.destination[dest]}`).append(`
          <tr>
            <th scope="row">Total:</th>
            <td id="total-BTC-values-${dest}">0</td>
            <td id="total-USDT-values-${dest}">0</td>
            <td id="total-BTC-pnl-${dest}">0</td>
            <td id="total-USDT-pnl-${dest}">0</td>
          </tr>
        `)
      for (let type in types) {
        totalFromBTC += distinate[dest].fields.data[types[type]].totalBTC;
        totalFromUSDT += distinate[dest].fields.data[types[type]].totalUSDT;
        for (let i in distinate[dest].fields.data[types[type]].coins) {
          if (distinate[dest].fields.data[types[type]].coins[i].BTC_value > 0) {
            if (res_from[i]) {
              res_from[i] += parseFloat(
                distinate[dest].fields.data[types[type]].coins[i].BTC_value
              );
            } else {
              res_from[i] = parseFloat(
                distinate[dest].fields.data[types[type]].coins[i].BTC_value
              );
            }
          }
        }
        for (let i in distinate[dest].fields.data[types[type]]) {
          if (i === "totalBTC") {
            if (res_from["total"]) {
              res_from["total"] += distinate[dest].fields.data[types[type]][i];
            } else {
              res_from["total"] = distinate[dest].fields.data[types[type]][i];
            }
          }
        }
        $(`.${types[type]}${this.destination[dest]}-tableBox`).empty()
        $(`.${types[type]}${this.destination[dest]}-tableBox`).append(`
            <div class="card shadow mb-4" id="${types[type]}${
          this.destination[dest]
        }Box">
              <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">
                  ${$(
                    `input[data-id='${types[type]}Switcher${this.destination[dest]}']`
                  ).data("name")}
                </h6>
              </div>
              <div class="card-body">
                <div
                  class="text-center"
                  id="${types[type]}Loader${this.destination[dest]}"
                  style="display: block;"
                >
                  <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
                <div class="table-responsive">
                  <table
                    class="table table-bordered"
                    id="${types[type]}${this.destination[dest]}"
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
        $(`#${types[type]}InitialLoader${this.destination[dest]}`).css(
          "display",
          "none"
        );
        for (let i in this.dataTable) {
          $(
            `.${types[type]}${this.destination[dest]}-tableBox>div#${types[type]}${this.destination[dest]}Box>.card-body>.table-responsive>table>thead>tr`
          ).append(`<th scope="col">${this.dataTable[i]}</th>`);
        }
        for (let coin_data in distinate[dest].fields.data[types[type]].coins) {
          $(
            `.${types[type]}${this.destination[dest]}-tableBox>div#${types[type]}${this.destination[dest]}Box>.card-body>.table-responsive>table>tbody`
          ).append(`
            <tr>
              <td>${coin_data}</td>
              <td>${names[coin_data] ? names[coin_data].name : coin_data}</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data]
                    .total
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .total
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data].free
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .free
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data].used
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .used
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data]
                    .BTC_value
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .BTC_value
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data]
                    .USDT_value
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .USDT_value
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data].pnl
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .pnl
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data]
                    .BTC_pnl
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .BTC_pnl
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data]
                    .USDT_pnl
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .USDT_pnl
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data]
                    .BTC_pnl_percent
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .BTC_pnl_percent
              }</td>
              <td>${
                parseFloat(
                  distinate[dest].fields.data[types[type]].coins[coin_data]
                    .USDT_pnl_percent
                ) <= 0
                  ? 0
                  : distinate[dest].fields.data[types[type]].coins[coin_data]
                      .USDT_pnl_percent
              }</td>
          </tr>
            `);
        }
        console.log($(
            `.${types[type]}${this.destination[dest]}-tableBox>`
          )[0])
        let tableSpot = $(
          `#${types[type]}${this.destination[dest]}`
        ).DataTable();
        $(`#${types[type]}${this.destination[dest]}_length>label`)
          .after(`<div class="custom-control custom-checkbox mr-sm-2 table-checkbox" id="${types[type]}${this.destination[dest]}HideLowBalanceLabel" style="display: none;">
          <input
            type="checkbox"
            class="custom-control-input"
            id="${types[type]}${this.destination[dest]}HideLowBalance"
          />
          <label class="custom-control-label" for="${types[type]}${this.destination[dest]}HideLowBalance"
            >Hide low balance assets</label
          >
        </div>`);
        $(`#${types[type]}${this.destination[dest]}`).css("display", "table");
        $(`#${types[type]}${this.destination[dest]}HideLowBalanceLabel`).css(
          "display",
          "block"
        );
        $(`#${types[type]}Loader${this.destination[dest]}`).css(
          "display",
          "none"
        );
        $(`#${types[type]}${this.destination[dest]}HideLowBalance`).change(
          () => {
            tableSpot.draw();
          }
        );
        $(`tbody#dataTable${this.destination[dest]}`).prepend(`
            <tr>
                <th scope="row">${$(
                  `input[data-id='${types[type]}Switcher${this.destination[dest]}']`
                ).data("name")}</th>
                <td>${distinate[dest].fields.data[types[type]].totalBTC}</td>
                <td>${distinate[dest].fields.data[types[type]].totalUSDT}</td>
                <td>${
                  distinate[dest].fields.data[types[type]].totalBTC_pnl
                }</td>
                <td>${
                  distinate[dest].fields.data[types[type]].totalUSDT_pnl
                }</td>
            </tr>
        `);
        $(`#total-BTC-values-${dest}`).html(
          this.utils.toFixed(
            parseFloat($(`#total-BTC-values-${dest}`)[0].textContent) +
              parseFloat(distinate[dest].fields.data[types[type]].totalBTC)
          )
        );
        $(`#total-USDT-values-${dest}`).html(
          this.utils.toFixed(
            parseFloat($(`#total-USDT-values-${dest}`)[0].textContent) +
              parseFloat(distinate[dest].fields.data[types[type]].totalUSDT)
          )
        );
        $(`#total-BTC-pnl-${dest}`).html(
          this.utils.toFixed(
            parseFloat($(`#total-BTC-pnl-${dest}`)[0].textContent) +
              parseFloat(distinate[dest].fields.data[types[type]].totalBTC_pnl)
          )
        );
        $(`#total-USDT-pnl-${dest}`).html(
          this.utils.toFixed(
            parseFloat($(`#total-USDT-pnl-${dest}`)[0].textContent) +
              parseFloat(distinate[dest].fields.data[types[type]].totalUSDT_pnl)
          )
        );
      }
      $(`#InitialLoader${this.destination[dest]}DataTable`).css(
        "display",
        "none"
      );
      $(`#dataTableResponsive${this.destination[dest]}`).css(
        "display",
        "block"
      );

      $(`#total-BTC-value-${dest}`).html(totalFromBTC);
      $(`#total-USDT-value-${dest}`).html(totalFromUSDT);
      this.chart.makeAllocationData(
        `assetAllocationChart${this.destination[dest]}`,
        res_from
      );
      $(`#assetAllocationLoader${this.destination[dest]}`).css(
        "display",
        "none"
      );
    }
  }

  swichExchanges() {
    for (let dest in this.destination) {
      let radios = document.querySelectorAll(
        `input[type=radio][name="exchange-switch-${dest}"]`
      );
      let labels = document.querySelectorAll(
        `label[name="exchange-switch-${dest}"]`
      );

      radios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
          labels.forEach((label) => {
            if (e.target.getAttribute("data-name") === label.textContent) {
              $(
                `.${label.getAttribute("data-idTable")}${
                  this.destination[dest]
                }-tableBox`
              ).css({
                display: "block",
              });
            } else {
              $(
                `.${label.getAttribute("data-idTable")}${
                  this.destination[dest]
                }-tableBox`
              ).css({
                display: "none",
              });
            }
          });
        });
      });
    }
  }

  applyFiltersHistory() {
    for (let dest in this.destination) {
      console.log('dest')
      let tablesEmptyFrom = document.querySelectorAll(
      `div[name="table${this.destination[dest]}"]`
      );
      tablesEmptyFrom.forEach((e) => {
        $(e).empty();
      });
      let buttons = document.querySelectorAll('button[name="filterBtn"]');
      let types_exchanges = [];
      let checkboxes = document.querySelectorAll(
        'input[name="switch-exchanges-chart"]:checked'
      );
      checkboxes.forEach((e) => {
        if (e.checked) {
          types_exchanges.push(e.getAttribute("data-id"));
        }
      });
      $(`div[name="radios${this.destination[dest]}"]`).empty();
      console.log($(`div[name="radios${this.destination[dest]}"]`)[0])
      for (let i in types_exchanges) {
        $(`div[name="radios${this.destination[dest]}"]`).append(`
          <div class="custom-control custom-radio">
            <input
              type="radio"
              class="custom-control-input"
              id="${$(`label[data-idLabel="${types_exchanges[i]}"]`).data(
                "namelabel"
              )}Switcher${this.destination[dest]}"
              name="exchange-switch-${dest}"
              data-id="${types_exchanges[i]}Switcher${this.destination[dest]}"
              data-name="${$(
                `label[data-idLabel="${types_exchanges[i]}"]`
              ).data("namelabel")}"
              required
            />
            <label class="custom-control-label" for="${$(
              `label[data-idLabel="${types_exchanges[i]}"]`
            ).data("namelabel")}Switcher${
          this.destination[dest]
        }" data-idTable="${
          types_exchanges[i]
        }" name="exchange-switch-${dest}">${$(
          `label[data-idLabel="${types_exchanges[i]}"]`
        ).data("namelabel")}</label>
          </div>
        `);
      }
      for (let type in types_exchanges) {
        $(
          `input[data-id="${types_exchanges[type]}Switcher${this.destination[dest]}"]`
        ).css("display", "block");
      }
      for (let type in types_exchanges) {
        $(
          `.${types_exchanges[type]}${this.destination[dest]}-tableBox`
        ).empty();
        $(`tbody#dataTable${this.destination[dest]}`).empty();
        $(`tbody#dataTable${this.destination[dest]}`).append(`
        <tr>
          <th scope="row">Total:</th>
          <td id="total-BTC-values-${dest}">0</td>
          <td id="total-USDT-values-${dest}">0</td>
          <td id="total-BTC-pnl-${dest}">0</td>
          <td id="total-USDT-pnl-${dest}">0</td>
        </tr>
      `);
      }

      const radioInput = document.querySelectorAll(
        `input[name="exchange-switch-${dest}"]`
      )[0];
      radioInput.setAttribute("checked", true);
      let fromTables = document.querySelectorAll(
        `div[name="table${this.destination[dest]}"]`
      );
      fromTables.forEach((e) => {
        $(e).css("display", "none");
      });
      $(`.${$(`label[for="${$(radioInput).data('name')}Switcher${this.destination[dest]}"]`).data('idtable')}${this.destination[dest]}-tableBox`).css("display", "block");
      buttons.forEach(async (e) => {
        if ($(e).hasClass("active")) {
          if (
            (e.id === "from" || e.id === "to") &&
            $("#from")[0].textContent.trim() !== "From" &&
            $("#to")[0].textContent.trim() !== "To"
          ) {
            let res = await this.utils.getFilterData(
              new Date($("#from")[0].textContent.trim()),
              new Date($("#to")[0].textContent.trim())
            );
            await this.makeHistory(
              {
                from: JSON.parse(this.types.exchanges)[0],
                to: JSON.parse(this.types.exchanges)[
                  JSON.parse(this.types.exchanges).length - 1
                ],
              },
              types_exchanges
            );
          } else if (e.id === "week") {
            let oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            let res = await this.utils.getFilterData(oneWeekAgo, "");
            await this.makeHistory(
              {
                from: JSON.parse(this.types.exchanges)[0],
                to: JSON.parse(this.types.exchanges)[
                  JSON.parse(this.types.exchanges).length - 1
                ],
              },
              types_exchanges
            );
          } else if (e.id === "thirty") {
            let dateThirty = new Date();
            dateThirty.setDate(dateThirty.getDate() - 30);
            let res = await this.utils.getFilterData(dateThirty, "");
            await this.makeHistory(
              {
                from: JSON.parse(this.types.exchanges)[0],
                to: JSON.parse(this.types.exchanges)[
                  JSON.parse(this.types.exchanges).length - 1
                ],
              },
              types_exchanges
            );
          } else if (e.id === "month") {
            let month = new Date(
              `${new Date().getMonth() + 1}/01/${new Date().getFullYear()}`
            );
            let res = await this.utils.getFilterData(month, "");
            await this.makeHistory(
              {
                from: JSON.parse(this.types.exchanges)[0],
                to: JSON.parse(this.types.exchanges)[
                  JSON.parse(this.types.exchanges).length - 1
                ],
              },
              types_exchanges
            );
          } else if (e.id === "all") {
            let types = await fetch("/exchanges/api/get_all_user_history_api/");
            types = await types.json();
            console.log('all')
            await this.makeHistory(
              {
                from: JSON.parse(this.types.exchanges)[0],
                to: JSON.parse(this.types.exchanges)[
                  JSON.parse(this.types.exchanges).length - 1
                ],
              },
              types_exchanges
            );
          }
        }
      });
      this.swichExchanges();
    }
  }
}
