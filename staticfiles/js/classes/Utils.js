class UtilsJS {
  constructor() {}

  toFixed(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split("e-")[1]);
      if (e > 6) e = 6;
      if (e) {
        x *= Math.pow(10, e - 1);
        x = "0." + new Array(e).join("0") + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split("+")[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join("0");
      }
    }
    return x;
  }

  numberToString(num) {
    let numStr = String(num);

    if (Math.abs(num) < 1.0)
    {
        let e = parseInt(num.toString().split('e-')[1]);
        if (e)
        {
            let negative = num < 0;
            if (negative) num *= -1
            num *= Math.pow(10, e - 1);
            numStr = '0.' + (new Array(e)).join('0') + num.toString().substring(2);
            if (negative) numStr = "-" + numStr;
        }
    }
    else
    {
        let e = parseInt(num.toString().split('+')[1]);
        if (e > 20)
        {
            e -= 20;
            num /= Math.pow(10, e);
            numStr = num.toString() + (new Array(e + 1)).join('0');
        }
    }

    return numStr;
  }

  swichExchanges() {
    let radios = document.querySelectorAll(
      'input[type=radio][name="exchange-switch"]'
    );
    let labels = document.querySelectorAll('label[name="exchange-switch"]');

    Array.prototype.forEach.call(radios, function (radio) {
      radio.addEventListener("change", (e) => {
        labels.forEach((text) => {
          if (e.target.id === `${text.textContent}Switcher`) {
            $(`.${text.textContent}-table`).css("display", "block");
          } else {
            $(`.${text.textContent}-table`).css("display", "none");
          }
        });
      });
    });
  }

  doFilters() {
    let buttons = document.querySelectorAll('button[name="filterBtn"]');

    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", (e) => {
        buttons.forEach((btns) => {
          $(btns).removeClass("active");
          if (btns.id === e.target.id && btns.id !== "From") {
            $(btns).addClass("active");
          }
        });
      });
    });
  }

  titleCase(string) {
    var sentence = string.toLowerCase().split(" ");
    for (var i = 0; i < sentence.length; i++) {
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join("");
  }

  async getFilterData(from, to) {
    let data = await fetch("/exchanges/api/get_range_exchange/", {
      method: "POST",
      body: JSON.stringify({
        from: from,
        to: to,
      }),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    let res = await data.json();
    return res;
  }

  applyFilters() {
    const chartPnl = new ChartRender()
    let buttons = document.querySelectorAll('button[name="filterBtn"]');
    let types = [];
    let checkboxes = document.querySelectorAll(
      'input[name="switch-exchanges-chart"]'
    );
    checkboxes.forEach((e) => {
      if (e.checked) {
        types.push(e.getAttribute("data-id"));
      }
    });
    buttons.forEach(async (e) => {
      if ($(e).hasClass("active")) {
        if (
          (e.id === "from" || e.id === "to") &&
          $("#from")[0].textContent.trim() !== "From" &&
          $("#to")[0].textContent.trim() !== "To"
        ) {
          let res = await this.getFilterData(
            new Date($("#from")[0].textContent.trim()),
            new Date($("#to")[0].textContent.trim())
          );
          this.renderCharts(JSON.parse(res.exchanges), types);
        } else if (e.id === "week") {
          let oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          let res = await this.getFilterData(oneWeekAgo, "");
          this.renderCharts(JSON.parse(res.exchanges), types);
        } else if (e.id === "thirty") {
          let dateThirty = new Date();
          dateThirty.setDate(dateThirty.getDate() - 30);
          let res = await this.getFilterData(dateThirty, "");
          this.renderCharts(JSON.parse(res.exchanges), types);
        } else if (e.id === "month") {
          let month = new Date(
            `${new Date().getMonth() + 1}/01/${new Date().getFullYear()}`
          );
          let res = await this.getFilterData(month, "");
          this.renderCharts(JSON.parse(res.exchanges), types);
        } else if (e.id === "all") {
          let exchanges = await fetch("/exchanges/api/get_all_exchanges");
          exchanges = await exchanges.json();
          let data = JSON.parse(exchanges.exchanges)
          const chartPnl = new ChartRender()
          chartPnl.getAllocationData(data[JSON.parse(exchanges.exchanges).length - 1], types);
          renderTwoCharts(data)
        }
      }
    });
  }

  renderCharts(data, types) {
    const chartPnl = new ChartRender()
    chartPnl.getAllocationData(data[0], types);
    renderTwoCharts(data)
  }
}
