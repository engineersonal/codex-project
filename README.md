# PulseSpend Expense Tracker

PulseSpend is a polished single-page expense tracker built for daily personal finance use. It combines a vibrant dashboard, category insights, budget tracking, local currency formatting, and light/dark theme support in a lightweight frontend that runs directly in the browser.

## Highlights

- Add, review, filter, and delete daily expenses from a clean dashboard UI.
- Track a monthly budget with live utilization and remaining balance.
- View category-based spending insights and summary metrics for the current month.
- Switch between country-specific currencies such as USD, GBP, INR, PLN, EUR, CAD, AUD, JPY, and AED.
- Toggle between light mode and dark mode, with preferences saved locally.
- Load sample data instantly for demos or quick exploration.
- Persist expenses, budget, country, and theme settings in `localStorage`.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage` for persistence

## Project Structure

```text
.
|-- index.html   # Application layout and dashboard structure
|-- styles.css   # Visual design, responsive layout, and theme styling
|-- app.js       # App state, rendering, persistence, and interactions
|-- README.md    # Project documentation
```

## Features

### 1. Expense Management

Users can add new expenses with:

- title
- amount
- category
- date
- optional notes

Saved expenses appear in the transaction ledger and can be deleted individually.

### 2. Budget Tracking

The application lets users define a monthly budget and automatically calculates:

- total spent this month
- remaining budget
- budget utilization percentage
- average daily spend
- largest monthly expense

### 3. Insights and Visualization

PulseSpend summarizes monthly financial activity through:

- top spending category
- transaction count for the month
- recent spending streak
- category spend chart
- quick insight cards

### 4. Country-Based Currency Support

The sidebar includes a country selector. When users switch countries, all amounts across the app are reformatted using that country's locale and currency.

Supported countries currently include:

- United States
- United Kingdom
- India
- Poland
- Germany
- France
- Canada
- Australia
- Japan
- United Arab Emirates

### 5. Light and Dark Theme

The app includes a theme toggle in the sidebar. Theme preference is persisted locally and applied automatically on the next visit.

## How to Run

This project does not require a build step.

1. Open the project folder.
2. Open [index.html](./index.html) in any modern browser.

You can also use a simple local server if preferred. For example:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## How to Use

### Add an Expense

1. Enter a title.
2. Enter the amount.
3. Choose a category.
4. Pick the date.
5. Optionally add notes.
6. Click `Save expense`.

### Set a Budget

1. Enter the monthly budget amount.
2. Click `Update budget`.

### Explore the App

- Click `Load sample data` to populate demo transactions.
- Use the left navigation to switch between Overview, Transactions, Budgets, and Insights.
- Use the transaction filter to narrow expenses by category.
- Delete an entry directly from the ledger when needed.

### Change Currency

1. Use the `Country` selector in the sidebar.
2. The dashboard will immediately reformat all monetary values.

### Change Theme

1. Click the theme toggle button in the sidebar.
2. The interface switches between light and dark mode instantly.

## Data Persistence

PulseSpend stores data in the browser using `localStorage`.

Stored keys include:

- `pulse-spend-expenses`
- `pulse-spend-budget`
- `pulse-spend-country`
- `pulse-spend-theme`

Because the app uses local browser storage:

- data stays on the same browser and device
- clearing browser storage will remove saved data
- there is no backend or cloud sync yet

## Current Behavior Notes

- Summary metrics are calculated for the current month.
- The category chart shows the top spending categories for the current month.
- Sample data is generated using the current month and year.
- Currency formatting changes display values only; it does not perform exchange-rate conversion between currencies.

## Customization Ideas

You can extend the app further with:

- recurring expenses
- multi-user accounts
- CSV or PDF export
- charts by week, month, or year
- income tracking
- savings goals
- real exchange-rate conversion
- backend storage and authentication

## Development Notes

- The UI is intentionally designed as a premium-feeling dashboard rather than a minimal form app.
- The app uses vanilla JavaScript for simplicity and portability.
- All rendering logic is centralized in `app.js`.
- Theme styling is controlled through CSS variables and `body[data-theme="dark"]`.

## Verification

JavaScript syntax was verified with:

```powershell
node --check app.js
```

## License

This project currently has no explicit license file. Add one if you plan to distribute or open-source it.
