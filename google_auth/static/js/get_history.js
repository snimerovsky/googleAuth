let history;

$(document).ready(async function () {
  history = new History()
});

function applyFiltersHistory() {
  history.applyFiltersHistory()
}