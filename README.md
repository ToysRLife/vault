# Vault — Personal Wealth OS

A static, browser-only personal finance + retirement planning dashboard. Runs from `file://` in any modern browser. All data lives in your browser's localStorage; CSV import/export keeps your master files on disk.

No server. No account. No cloud. No telemetry. Open `index.html` and go.

## Highlights

- **Net Worth Dashboard** with investor-grade KPIs: Liquid Net Worth, Debt-to-Asset Ratio, Months of Runway, Savings Rate, FI (Financial Independence) Coverage
- **Path to Financial Independence** panel: FI Number (25× annual expense), Years to FI, FI Year + age, gradient progress bar
- **Liquidity Ladder**: classify investments into Emergency / Short / Medium / Long buckets with rebalancing insights
- **Future Projection** with year-by-year segments (income, investments, expenses) and per-year overrides
- **Real-return toggle**: switch projection between nominal and today's purchasing power
- **Monte Carlo Simulation**: 200 random paths with per-asset-class volatility, success rate, percentile fan chart, automatic diagnostics + fix suggestions
- **Retirement milestones**: Equity → Debt rebalance year, PF/NPS unlock at age 60 with regulatory 60/40 split into Pension Annuity
- **Goals tracker**: time-bound milestones (retirement, education, home, etc.) with on-track status and required-contribution math
- **Plan vs Actual** with monthly/annual view modes and editable Actual cells (per-period overrides)
- **Expenses** with monthly/yearly/category filters and trend charts
- **Statement upload**: auto-detects ICICI, SBI, Axis credit card PDFs and extracts transactions
- **Master categories**: pickable from dropdowns when adding transactions; full CRUD in Settings
- **Light & Dark theme** with smooth transitions
- **Mobile-friendly**: slide-out drawer nav via hamburger menu

## Quick Start

1. Clone or download this repo
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari)
3. Seed data auto-loads on first visit
4. Click **Settings → Load Seed Data** anytime to reset to defaults
5. Use **Settings → Export All CSVs** to back up your data to disk
6. Use **Import All CSVs** to restore from disk

## Project Layout

```
vault/
├── index.html              Entry point — single page app
├── css/styles.css          Design system, dark + light themes
├── js/
│   ├── seed-data.js        Embedded sample CSVs (file:// fallback)
│   └── app.js              All app logic (single file, no build step)
├── data/                   Master CSV files (sample data)
│   ├── investments.csv
│   ├── loans.csv
│   ├── real_estate.csv
│   ├── transactions.csv
│   ├── planned_budget.csv
│   ├── projection_segments.csv
│   ├── projection_segment_yearly.csv
│   ├── actual_overrides.csv
│   ├── future_projections.csv
│   ├── goals.csv
│   ├── reward_targets.csv
│   ├── taxonomy.csv
│   └── README.md (this file)
└── README.md
```

## How It Works

### Data Model
- CSV-first. Every entity has a schema in `CSV_SCHEMAS` inside `js/app.js`.
- On first run, app loads sample seeds from `js/seed-data.js` (works without a server).
- Edits are saved to `localStorage` continuously.
- `Settings → Export All CSVs` writes your current state to disk as CSV downloads.
- Bumping `SEED_VERSION` only **adds** missing sections; never overwrites your data.

### Projection Engine
- Each investment segment has its own ROI, volatility, contribution schedule, and current balance.
- Net worth = sum of investment balances over time.
- Income and expenses are tracked separately (income assumed already allocated to investments + expenses).
- Cash-flow shortfalls (income < expenses + contributions) draw proportionally from balances.
- Per-year overrides let you lock specific year values for what-if scenarios.

### Monte Carlo
- 200 simulations with normal-distribution returns per segment.
- Default volatility: Equity 18% · Gold 15% · FD 2% · Real Estate 8% · Retirement 4% · Business 30%.
- Reports success rate (% staying positive through horizon), 10th/50th/90th percentile outcomes, and auto-generated fix suggestions when the plan is fragile.

### Retirement Milestones
- **Equity → Debt rebalance year**: at the chosen year, all Equity moves to FD (kills sequence-of-returns risk post-retirement).
- **PF/NPS unlock year** (default age 60): regulatory 60/40 split — 60% to FD, 40% to a Pension Annuity segment.
- Both apply in deterministic projection and Monte Carlo.

## Credit Card Statement Parsing

Drop a PDF in the **Statements** tab. The parser auto-detects the bank:

| Bank | Format detected |
|---|---|
| ICICI | "ICICI Bank" / "Emeralde Private Metal" |
| SBI | "SBI Card" / "sbicard.com" |
| Axis | "Axis Bank" / "Airtel Axis" |

Transactions are extracted, auto-categorized via merchant rules, and shown for review before import. Generic CSV upload is also supported for any other bank.

## Privacy

- All data in your browser's localStorage. Nothing leaves your machine.
- The only network calls are to CDNs for Chart.js, PapaParse, and pdf.js. To go fully offline, download those files to a local `lib/` folder and update the `<script>` src paths in `index.html`.
- The seed data shipped in this repo is **sample data only** — replace with your own via the UI or by editing CSVs.

## Tech Stack

- Vanilla HTML / CSS / JS — no build step, no framework
- [Chart.js](https://www.chartjs.org/) for visualizations
- [PapaParse](https://www.papaparse.com/) for CSV parsing
- [pdf.js](https://mozilla.github.io/pdf.js/) for credit card PDF extraction
- All via CDN — no `npm install` needed

## License

MIT — do whatever you want with it.

## Status

Experimental / personal-use. Built with [Claude Code](https://claude.com/claude-code) as a long-form coding exercise.
