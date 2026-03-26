const STORAGE_KEY = "pulse-spend-expenses";
const BUDGET_KEY = "pulse-spend-budget";
const COUNTRY_KEY = "pulse-spend-country";
const THEME_KEY = "pulse-spend-theme";

const countrySettings = {
  US: { locale: "en-US", currency: "USD", label: "United States" },
  GB: { locale: "en-GB", currency: "GBP", label: "United Kingdom" },
  IN: { locale: "en-IN", currency: "INR", label: "India" },
  PL: { locale: "pl-PL", currency: "PLN", label: "Poland" },
  DE: { locale: "de-DE", currency: "EUR", label: "Germany" },
  FR: { locale: "fr-FR", currency: "EUR", label: "France" },
  CA: { locale: "en-CA", currency: "CAD", label: "Canada" },
  AU: { locale: "en-AU", currency: "AUD", label: "Australia" },
  JP: { locale: "ja-JP", currency: "JPY", label: "Japan" },
  AE: { locale: "en-AE", currency: "AED", label: "United Arab Emirates" },
};

const categoryColors = {
  Housing: "#4b7bff",
  Food: "#ff6b3d",
  Transport: "#0db9b3",
  Health: "#ef476f",
  Shopping: "#9b5de5",
  Entertainment: "#ffc247",
  Utilities: "#2dce89",
  Travel: "#118ab2",
  Education: "#7c6cff",
  Other: "#8d99ae",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const today = new Date();

const state = {
  expenses: loadExpenses(),
  budget: loadBudget(),
  filter: "All",
  view: "overview",
  country: loadCountry(),
  theme: loadTheme(),
};

const elements = {
  todayLabel: document.getElementById("todayLabel"),
  heroTitle: document.getElementById("heroTitle"),
  heroCopy: document.getElementById("heroCopy"),
  heroSection: document.getElementById("heroSection"),
  statsSection: document.getElementById("statsSection"),
  contentGrid: document.getElementById("contentGrid"),
  countrySelect: document.getElementById("countrySelect"),
  themeToggle: document.getElementById("themeToggle"),
  expenseForm: document.getElementById("expenseForm"),
  budgetForm: document.getElementById("budgetForm"),
  seedDataButton: document.getElementById("seedDataButton"),
  categoryFilter: document.getElementById("categoryFilter"),
  navItems: document.querySelectorAll(".nav-item"),
  viewSections: document.querySelectorAll("[data-section]"),
  transactionTableBody: document.getElementById("transactionTableBody"),
  transactionRowTemplate: document.getElementById("transactionRowTemplate"),
  formMessage: document.getElementById("formMessage"),
  expenseDate: document.getElementById("expenseDate"),
  budgetInput: document.getElementById("budgetInput"),
  totalSpent: document.getElementById("totalSpent"),
  spentTrend: document.getElementById("spentTrend"),
  remainingBudget: document.getElementById("remainingBudget"),
  budgetStatus: document.getElementById("budgetStatus"),
  dailyAverage: document.getElementById("dailyAverage"),
  dailyAverageHint: document.getElementById("dailyAverageHint"),
  largestExpense: document.getElementById("largestExpense"),
  largestExpenseHint: document.getElementById("largestExpenseHint"),
  budgetPercent: document.getElementById("budgetPercent"),
  budgetProgress: document.getElementById("budgetProgress"),
  sidebarBudget: document.getElementById("sidebarBudget"),
  topCategory: document.getElementById("topCategory"),
  monthlyTransactions: document.getElementById("monthlyTransactions"),
  streakValue: document.getElementById("streakValue"),
  chart: document.getElementById("chart"),
  chartLegend: document.getElementById("chartLegend"),
  focusCategory: document.getElementById("focusCategory"),
  focusCopy: document.getElementById("focusCopy"),
};

boot();

function boot() {
  applyTheme();
  elements.todayLabel.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  elements.expenseDate.value = formatDateInput(today);
  elements.budgetInput.value = state.budget ? state.budget.toFixed(2) : "";
  elements.countrySelect.value = state.country;

  elements.expenseForm.addEventListener("submit", handleExpenseSubmit);
  elements.budgetForm.addEventListener("submit", handleBudgetSubmit);
  elements.seedDataButton.addEventListener("click", handleSeedData);
  elements.countrySelect.addEventListener("change", handleCountryChange);
  elements.themeToggle.addEventListener("click", handleThemeToggle);
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      setView(item.dataset.view || "overview");
    });
  });
  elements.categoryFilter.addEventListener("change", (event) => {
    state.filter = event.target.value;
    renderTransactions();
  });

  render();
}

function handleExpenseSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const title = String(formData.get("title")).trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category"));
  const date = String(formData.get("date"));
  const notes = String(formData.get("notes")).trim();

  if (!title || !amount || amount <= 0 || !date) {
    elements.formMessage.textContent = "Please complete the required fields with a valid amount.";
    return;
  }

  state.expenses.unshift({
    id: crypto.randomUUID(),
    title,
    amount,
    category,
    date,
    notes,
  });

  persistExpenses();
  event.currentTarget.reset();
  elements.expenseDate.value = formatDateInput(today);
  elements.formMessage.textContent = "Expense saved successfully.";
  render();
}

function handleBudgetSubmit(event) {
  event.preventDefault();
  const value = Number(elements.budgetInput.value);

  state.budget = value > 0 ? value : 0;
  localStorage.setItem(BUDGET_KEY, String(state.budget));
  render();
}

function handleSeedData() {
  state.expenses = sampleExpenses();
  state.budget = 3200;
  localStorage.setItem(BUDGET_KEY, String(state.budget));
  persistExpenses();
  elements.budgetInput.value = state.budget.toFixed(2);
  elements.formMessage.textContent = "Sample data loaded for exploration.";
  render();
}

function render() {
  const metrics = calculateMetrics(state.expenses, state.budget);
  renderSummary(metrics);
  renderTransactions();
  renderChart(metrics.categoryTotals);
  renderView();
}

function setView(view) {
  state.view = view;
  renderView();
}

function renderView() {
  const viewContent = getViewContent(state.view);

  elements.heroTitle.textContent = viewContent.title;
  elements.heroCopy.textContent = viewContent.copy;

  elements.navItems.forEach((item) => {
    const isActive = item.dataset.view === state.view;
    item.classList.toggle("nav-item-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  elements.viewSections.forEach((section) => {
    const visibleIn = (section.dataset.section || "").split(" ");
    section.classList.toggle("section-hidden", !visibleIn.includes(state.view));
  });

  const compactView = state.view !== "overview";
  elements.statsSection.classList.toggle("section-hidden", state.view === "transactions");
  elements.contentGrid.classList.toggle("single-focus-mode", compactView);
}

function getViewContent(view) {
  switch (view) {
    case "transactions":
      return {
        title: "Review every transaction in one focused ledger.",
        copy: "Scan daily activity, filter by category, and remove entries quickly when you need a cleaner audit trail.",
      };
    case "budgets":
      return {
        title: "Tune your monthly spending guardrails with confidence.",
        copy: "Adjust targets, monitor budget utilization, and keep your recurring expenses aligned with plan.",
      };
    case "insights":
      return {
        title: "Turn raw spending into clear, decision-ready insight.",
        copy: "Use category breakdowns and monthly patterns to see where your money is concentrating fastest.",
      };
    default:
      return {
        title: "Track every expense with clarity, rhythm, and color.",
        copy: "Log daily spending, monitor your monthly budget, and spot where your money is moving before it slips off course.",
      };
  }
}

function renderSummary(metrics) {
  elements.totalSpent.textContent = formatCurrency(metrics.monthlySpent);
  elements.spentTrend.textContent = `${metrics.monthlyTransactions} transactions recorded this month`;
  elements.remainingBudget.textContent = formatCurrency(metrics.remainingBudget);
  elements.budgetStatus.textContent = metrics.budgetStatus;
  elements.dailyAverage.textContent = formatCurrency(metrics.averageDailySpend);
  elements.dailyAverageHint.textContent = `Across ${metrics.activeDays} spending day${metrics.activeDays === 1 ? "" : "s"} this month.`;
  elements.largestExpense.textContent = formatCurrency(metrics.largestExpense.amount);
  elements.largestExpenseHint.textContent = metrics.largestExpense.title || "Your top single transaction.";
  elements.budgetPercent.textContent = `${metrics.budgetPercent}%`;
  elements.budgetProgress.style.width = `${Math.min(metrics.budgetPercent, 100)}%`;
  elements.sidebarBudget.textContent = formatCurrency(state.budget || 0);
  elements.topCategory.textContent = metrics.topCategoryLabel;
  elements.monthlyTransactions.textContent = String(metrics.monthlyTransactions);
  elements.streakValue.textContent = `${metrics.spendingStreak} days`;
  elements.focusCategory.textContent = metrics.topCategoryLabel;
  elements.focusCopy.textContent = metrics.topCategoryLabel === "No data yet"
    ? "Add a few expenses to surface your highest spending pattern."
    : `${metrics.topCategoryLabel} leads your monthly spend at ${formatCurrency(metrics.topCategoryAmount)}.`;
}

function renderTransactions() {
  const filteredExpenses = state.filter === "All"
    ? [...state.expenses]
    : state.expenses.filter((expense) => expense.category === state.filter);

  elements.transactionTableBody.innerHTML = "";

  if (!filteredExpenses.length) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="5" class="empty-state">No transactions found for this view.</td>`;
    elements.transactionTableBody.append(emptyRow);
    return;
  }

  filteredExpenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((expense) => {
      const row = elements.transactionRowTemplate.content.firstElementChild.cloneNode(true);
      row.querySelector(".transaction-title").textContent = expense.title;
      row.querySelector(".transaction-note").textContent = expense.notes || "No additional note";
      row.querySelector(".category-pill").textContent = expense.category;
      row.querySelector(".category-pill").style.background = hexToSoftColor(categoryColors[expense.category] || categoryColors.Other);
      row.querySelector(".category-pill").style.color = categoryColors[expense.category] || categoryColors.Other;
      row.querySelector(".transaction-date").textContent = dateFormatter.format(new Date(expense.date));
      row.querySelector(".transaction-amount").textContent = formatCurrency(expense.amount);
      row.querySelector(".icon-button").addEventListener("click", () => deleteExpense(expense.id));
      elements.transactionTableBody.append(row);
    });
}

function renderChart(categoryTotals) {
  elements.chart.innerHTML = "";
  elements.chartLegend.innerHTML = "";

  const entries = Object.entries(categoryTotals)
    .filter(([, total]) => total > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  if (!entries.length) {
    elements.chart.innerHTML = `<div class="empty-state">Add expenses to populate the category chart.</div>`;
    return;
  }

  const maxValue = Math.max(...entries.map(([, total]) => total));

  entries.forEach(([category, total]) => {
    const group = document.createElement("div");
    group.className = "chart-bar-group";

    const value = document.createElement("strong");
    value.className = "chart-bar-value";
    value.textContent = formatCurrency(total);

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${Math.max((total / maxValue) * 180, 24)}px`;
    bar.style.background = `linear-gradient(180deg, ${categoryColors[category] || categoryColors.Other}, rgba(13, 185, 179, 0.85))`;

    const label = document.createElement("span");
    label.className = "chart-bar-label";
    label.textContent = category;

    group.append(value, bar, label);
    elements.chart.append(group);

    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    legendItem.innerHTML = `<span>${category}</span><strong>${formatCurrency(total)}</strong>`;
    elements.chartLegend.append(legendItem);
  });
}

function calculateMetrics(expenses, budget) {
  const currentMonthExpenses = expenses.filter((expense) => isCurrentMonth(expense.date));
  const monthlySpent = sumExpenses(currentMonthExpenses);
  const monthlyTransactions = currentMonthExpenses.length;
  const activeDays = new Set(currentMonthExpenses.map((expense) => expense.date)).size;
  const averageDailySpend = activeDays ? monthlySpent / activeDays : 0;
  const largestExpense = currentMonthExpenses.reduce((largest, current) => {
    return current.amount > largest.amount ? current : largest;
  }, { amount: 0, title: "" });
  const categoryTotals = currentMonthExpenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});
  const [topCategoryLabel = "No data yet", topCategoryAmount = 0] = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)[0] || [];
  const remainingBudget = Math.max((budget || 0) - monthlySpent, 0);
  const budgetPercent = budget > 0 ? Math.round((monthlySpent / budget) * 100) : 0;
  const budgetStatus = budget <= 0
    ? "Set a monthly budget to start tracking."
    : monthlySpent > budget
      ? `You are over budget by ${formatCurrency(monthlySpent - budget)}.`
      : `${formatCurrency(remainingBudget)} left before reaching your target.`;

  return {
    monthlySpent,
    monthlyTransactions,
    activeDays,
    averageDailySpend,
    largestExpense,
    categoryTotals,
    topCategoryLabel,
    topCategoryAmount,
    remainingBudget,
    budgetPercent,
    budgetStatus,
    spendingStreak: calculateSpendingStreak(currentMonthExpenses),
  };
}

function calculateSpendingStreak(expenses) {
  if (!expenses.length) {
    return 0;
  }

  const uniqueDates = [...new Set(expenses.map((expense) => expense.date))]
    .sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dateString of uniqueDates) {
    const expenseDate = new Date(dateString);
    expenseDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((cursor - expenseDate) / 86400000);

    if (diffDays === 0 || diffDays === 1) {
      streak += 1;
      cursor = expenseDate;
      continue;
    }

    break;
  }

  return streak;
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter((expense) => expense.id !== id);
  persistExpenses();
  render();
}

function handleCountryChange(event) {
  state.country = event.target.value in countrySettings ? event.target.value : "US";
  localStorage.setItem(COUNTRY_KEY, state.country);
  render();
}

function handleThemeToggle() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, state.theme);
  applyTheme();
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
  elements.themeToggle.textContent = state.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

function persistExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
}

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function loadBudget() {
  const raw = localStorage.getItem(BUDGET_KEY);
  return raw ? Number(raw) : 0;
}

function loadCountry() {
  const raw = localStorage.getItem(COUNTRY_KEY);

  if (raw && raw in countrySettings) {
    return raw;
  }

  const region = Intl.DateTimeFormat().resolvedOptions().locale.split("-")[1];
  return region && region in countrySettings ? region : "US";
}

function loadTheme() {
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "dark" ? "dark" : "light";
}

function sumExpenses(expenses) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

function formatCurrency(amount) {
  const settings = countrySettings[state.country] || countrySettings.US;
  return new Intl.NumberFormat(settings.locale, {
    style: "currency",
    currency: settings.currency,
  }).format(amount);
}

function isCurrentMonth(dateString) {
  const expenseDate = new Date(dateString);
  return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
}

function formatDateInput(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function hexToSoftColor(hex) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, 0.14)`;
}

function sampleExpenses() {
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

  return [
    { id: crypto.randomUUID(), title: "Groceries", amount: 142.35, category: "Food", date: `${currentYear}-${currentMonth}-02`, notes: "Weekly home essentials" },
    { id: crypto.randomUUID(), title: "Metro card", amount: 48.0, category: "Transport", date: `${currentYear}-${currentMonth}-05`, notes: "Monthly commute refill" },
    { id: crypto.randomUUID(), title: "Streaming bundle", amount: 19.99, category: "Entertainment", date: `${currentYear}-${currentMonth}-07`, notes: "Video and music plan" },
    { id: crypto.randomUUID(), title: "Electric bill", amount: 88.7, category: "Utilities", date: `${currentYear}-${currentMonth}-10`, notes: "Online payment" },
    { id: crypto.randomUUID(), title: "Client lunch", amount: 64.5, category: "Food", date: `${currentYear}-${currentMonth}-12`, notes: "Downtown cafe" },
    { id: crypto.randomUUID(), title: "Pharmacy", amount: 36.4, category: "Health", date: `${currentYear}-${currentMonth}-17`, notes: "Prescription refill" },
    { id: crypto.randomUUID(), title: "New headset", amount: 129.9, category: "Shopping", date: `${currentYear}-${currentMonth}-21`, notes: "Work setup upgrade" },
    { id: crypto.randomUUID(), title: "Rent", amount: 1450.0, category: "Housing", date: `${currentYear}-${currentMonth}-01`, notes: "Monthly apartment rent" },
  ];
}
