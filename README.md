# 📅 Academic Course Timetable Builder

An interactive, responsive, and lightweight client-side web application designed to create, organize, customize, and export academic course schedules. Built entirely with **vanilla HTML5, CSS3, and modern JavaScript**, with **zero dependencies** and no build step required.

---

## ✨ Features

- **🎯 Drag-and-Drop Interface**
  - Drag course cards smoothly across time slots and days.
  - Automatic swapping when dropping a card onto an already occupied slot.
- **🎨 Visual Card Editor & Color Palette**
  - Customize Course Code, Subject Title, Professor name, and Room/Location.
  - 10 vibrant gradient swatches (Cyan, Red, Amber, Green, Purple, Blue, Pink, Teal, Orange, Gray) with accented borders for clear visual categorization.
- **⏱️ Smart Grid Customization**
  - **Dynamic Time Rows**: Add or delete time rows on the fly. The smart time-slot generator analyzes previous intervals and breaks (e.g. 50/55 min classes with 5/10 min breaks, 12h AM/PM or 24h formats) to suggest the next slot.
  - **Dynamic Days**: Add or remove day columns (e.g. Monday–Friday, Saturday/Sunday, or custom day names) with auto-adjusting CSS grid columns.
- **⌨️ Clipboard & Productivity Shortcuts**
  - Copy and paste course cards using standard `Ctrl+C` / `Ctrl+V` (or `Cmd+C` / `Cmd+V`).
  - Double-click an empty cell to paste the copied card.
  - Double-click a card to inspect and edit its properties.
- **💾 Auto-Save & Data Portability**
  - **Session Auto-Save**: Utilizes a `MutationObserver` to automatically preserve changes to `sessionStorage` as you edit.
  - **CSV Export & Import**: Save your timetable to a portable CSV file and restore it anytime.
  - **PDF Export**: Built-in print preview optimized with high-contrast, print-accurate dark styling (`print-color-adjust: exact`).
- **🌙 Modern Dark UI**
  - Sleek dark aesthetic with frosted-glass panels (`backdrop-filter`), smooth hover transitions, and responsive grid scrolling.

---

## 🚀 Quick Start

No installation, Node.js, or compilation needed!

### Method 1: Open Directly in Browser
Simply double-click [`index.html`](index.html) or open it with your favorite browser:
```bash
xdg-open index.html   # Linux
open index.html       # macOS
start index.html      # Windows
```

### Method 2: Serve via a Local HTTP Server (Optional)
If you prefer running through a local development server:

Using Python:
```bash
python3 -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000).

Using Node.js:
```bash
npx serve .
```

---

## 📖 How to Use

### 1. Managing Course Cards
- **Create Card**: Click **"Create new card"** in the top bar to place a card in the selected or first available empty cell.
- **Edit Card**: Click any card to load its details into the **Card editor** side panel. Changes update live in the timetable.
- **Move Card**: Click and drag any card to another cell. If the target cell already has a card, their positions will swap automatically.
- **Delete Card**: Select a card and click **"Delete card"** in the top bar.
- **Clear All**: Click **"Clear table"** to remove all cards from the grid.

### 2. Customizing Timetable Grid
- **Add Time Row**: Type a custom time range (e.g. `14:00 - 15:00`) into the **New time value** input, or leave it blank to use the smart calculated suggestion, then click **"Add time row"**.
- **Delete Time Row**: Click a time slot header on the left to select it, then click **"Delete time row"**.
- **Add Day Column**: Enter a day name (e.g. `Saturday`) in the **New day name** input and click **"Add day"**. The day is inserted next to the currently selected day header.
- **Delete Day Column**: Click a day header to select it, then click **"Delete day"**.

### 3. Saving & Exporting
- **Save to File**: Click **"Save"** to download a `timetable.csv` file containing the complete grid structure and course metadata.
- **Open File**: Click **"Open"** to select a previously exported CSV or TXT file and restore your timetable.
- **Download PDF**: Click **"Download PDF"** to open a print-optimized window and save your timetable as a PDF or send it directly to a printer.

---

## ⌨️ Shortcuts & Interactions

| Action | Mouse / Keyboard Shortcut |
| :--- | :--- |
| **Select Card** | Click on any course card |
| **Select Cell** | Click on any empty cell |
| **Copy Card** | Select card, then press `Ctrl + C` / `Cmd + C` |
| **Paste Card** | Select target cell, then press `Ctrl + V` / `Cmd + V` |
| **Quick Paste** | Double-click an empty cell (pastes clipboard card) |
| **Select Time Row** | Click on the time slot label (left column) |
| **Select Day Column**| Click on the day header (top row) |
| **Drag & Swap** | Drag a card over another card and drop |

---

## 📁 Project Structure

```text
timetable_template/
├── index.html       # Timetable markup, control headers, and card editor panel
├── style.css        # Dark mode styling, CSS grid layout, animations, and typography
├── script.js        # Core logic: drag & drop, time calculator, CSV parser, and PDF export
└── README.md        # Project documentation
```

### File Highlights
- **[`index.html`](index.html)**: Provides the semantic layout including the top control toolbar, the side editor panel with color swatches, and the grid container.
- **[`style.css`](style.css)**: Implements CSS Grid for responsive multi-column timetable schedules, custom scrollbars, and color accent variables (`--card-accent`, `--card-gradient`).
- **[`script.js`](script.js)**: Contains all interaction handling, CSV serialization/deserialization with proper quote escaping, smart time parser, session storage sync via `MutationObserver`, and print window generation.

---

## 💾 CSV Data Format

When exporting via the **Save** button, the schedule is saved as a standard CSV where:
- Row 1: Header containing `"time"` followed by day names (`"time","Monday","Tuesday",...`).
- Subsequent rows: First column is the time slot string, followed by JSON-encoded course metadata for each cell:
  ```json
  {"code":"CSL100","title":"Programming","prof":"Dr. Smith","location":"L101","light":"#ff6b6b","dark":"#7a1f2d","className":"custom"}
  ```
Empty cells are represented as empty strings `""`.

---

## 🌐 Browser Support

Compatible with all modern browsers supporting ECMAScript 6+ and HTML5 Drag and Drop API:
- Google Chrome / Chromium
- Mozilla Firefox
- Microsoft Edge
- Apple Safari
- Brave, Opera, Vivaldi

---

## 📄 License

This project is open-source and free to use for personal, academic, or commercial purposes.
