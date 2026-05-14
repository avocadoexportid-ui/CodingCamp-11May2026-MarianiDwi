const expenseForm = document.getElementById("expenseForm");
const itemName = document.getElementById("itemName");
const itemAmount = document.getElementById("itemAmount");
const itemCategory = document.getElementById("itemCategory");
const transactionList = document.getElementById("transactionList");
const totalBalance = document.getElementById("totalBalance");
const toast = document.getElementById("toast");

const sortOption = document.getElementById("sortOption");

const customCategory = document.getElementById("customCategory");
const addCategoryBtn = document.getElementById("addCategoryBtn");

const themeToggle = document.getElementById("themeToggle");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let chart;

function saveToLocalStorage() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function renderTransactions() {

  transactionList.innerHTML = "";

  let sortedTransactions = [...transactions];

  if (sortOption.value === "amount") {
    sortedTransactions.sort((a, b) => b.amount - a.amount);
  }

  if (sortOption.value === "category") {
    sortedTransactions.sort((a, b) =>
      a.category.localeCompare(b.category)
    );
  }

  sortedTransactions.forEach((transaction) => {

    const div = document.createElement("div");

    div.classList.add("transaction-item");

    // OPTIONAL FEATURE:
    // Highlight pengeluaran besar
    if (transaction.amount >= 500000) {
      div.classList.add("highlight");
    }

    div.innerHTML = `
      <div class="transaction-info">
        <h4>${transaction.name}</h4>
        <p>${transaction.category}</p>
        <strong>${formatRupiah(transaction.amount)}</strong>
      </div>

      <button
        class="delete-btn"
        onclick="deleteTransaction(${transaction.id})"
      >
        Hapus
      </button>
    `;

    transactionList.appendChild(div);
  });
}

function updateBalance() {

  const total = transactions.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);

  totalBalance.textContent = formatRupiah(total);
}

function updateChart() {

  const categoryTotals = {};

  transactions.forEach((transaction) => {

    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = 0;
    }

    categoryTotals[transaction.category] += transaction.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (chart) {
    chart.destroy();
  }

  const ctx = document
    .getElementById("expenseChart")
    .getContext("2d");

  chart = new Chart(ctx, {
    type: "pie",

    data: {
      labels: labels,

      datasets: [
        {
          data: data,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function addTransaction(e) {

  e.preventDefault();

  const name = itemName.value.trim();
  const amount = parseInt(itemAmount.value);
  const category = itemCategory.value;

  if (!name || !amount || !category) {
    showToast("Semua field wajib diisi!");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    name,
    amount,
    category,
  };

  transactions.push(newTransaction);

  saveToLocalStorage();

  renderTransactions();
  updateBalance();
  updateChart();

  expenseForm.reset();

  showToast("Transaksi berhasil ditambahkan!");
}

function deleteTransaction(id) {

  transactions = transactions.filter(
    (transaction) => transaction.id !== id
  );

  saveToLocalStorage();

  renderTransactions();
  updateBalance();
  updateChart();

  showToast("Transaksi dihapus!");
}

function addCustomCategory() {

  const categoryName = customCategory.value.trim();

  if (!categoryName) {
    showToast("Nama kategori kosong!");
    return;
  }

  const option = document.createElement("option");

  option.value = categoryName;
  option.textContent = categoryName;

  itemCategory.appendChild(option);

  customCategory.value = "";

  showToast("Kategori berhasil ditambahkan!");
}

function toggleTheme() {

  document.body.classList.toggle("dark");

  const isDark =
    document.body.classList.contains("dark");

  localStorage.setItem("darkMode", isDark);

  themeToggle.textContent = isDark
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
}

function loadTheme() {

  const darkMode =
    localStorage.getItem("darkMode") === "true";

  if (darkMode) {
    document.body.classList.add("dark");

    themeToggle.textContent = "☀️ Light Mode";
  }
}

expenseForm.addEventListener(
  "submit",
  addTransaction
);

sortOption.addEventListener(
  "change",
  renderTransactions
);

addCategoryBtn.addEventListener(
  "click",
  addCustomCategory
);

themeToggle.addEventListener(
  "click",
  toggleTheme
);

loadTheme();

renderTransactions();
updateBalance();
updateChart();
