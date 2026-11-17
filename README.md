<div align="center">

# 📅 Academic Course Timetable Builder

<p align="center">
  <strong>Create and customize a weekly course timetable in your browser. Add courses, organize them by day and time, and save your schedule as a CSV file or PDF.</strong>
</p>

[![Open Website](https://img.shields.io/badge/Open%20Website-Academic%20Timetable%20Builder-00bbf9?style=for-the-badge&logo=google-chrome&logoColor=white)](https://krish-shiyani.github.io/timetable_template/)

<br/>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-success?style=flat-square)](#run-locally)

<p align="center">
  <strong>🌐 Open the website:</strong> <a href="https://krish-shiyani.github.io/timetable_template/">Academic Course Timetable Builder</a>
</p>

</div>

---

## 📖 How to Use the Website

The timetable opens with example courses. Edit these or replace them with your own schedule.

### 1. Add and Edit Courses

1. Click an empty timetable cell to choose where a new course should go.
2. Click **Create new card**. The new card is selected.
3. Enter the course code, subject title, professor, and class location in the **Card editor**. The card updates as you type.
4. Choose a color swatch to change the selected card's color.

> [!TIP]
> **Editing & Moving:**
> * Click any existing card to select it and edit its details.
> * Drag a card to another cell to move it; dropping it onto another card swaps their positions.

---

### 2. Copy, Move, or Remove Courses

* **Copy & Paste:** Select a card and press <kbd>Ctrl</kbd> + <kbd>C</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>C</kbd> (macOS) to copy it. Select a destination cell and press <kbd>Ctrl</kbd> + <kbd>V</kbd> or <kbd>Cmd</kbd> + <kbd>V</kbd> to paste.
* **Quick Paste:** You can also double-click a cell to paste the copied card.
* **Delete Card:** Select a card and click **Delete card** to remove it.
* **Clear Table:** Click **Clear table** to remove all course cards. This does not delete the days or time rows.

> [!NOTE]
> The copied card is held in the page while it is open; it is separate from the system text clipboard.

---

### 3. Customize Days and Times

* **Add a time row:** Enter a time range in **New time value** (for example, `14:00 - 15:00`) and click **Add time row**. Leave it blank to use the suggested next time based on the existing rows.
* **Delete a time row:** Click its time label to select it, then click **Delete time row**.
* **Add a day:** Click a day header to select it, enter a name in **New day name**, then click **Add day**. The new day is inserted next to the selected day. If no day is selected, it is added at the end.
* **Delete a day:** Click its header to select it, then click **Delete day**. Its course cards are removed with it. At least one day remains.

---

### 4. Save, Reopen, or Print Your Timetable

* **Save File:** Click **Save** to download the current timetable as `timetable.csv`.
* **Reopen File:** Click **Open** and choose a timetable `.csv` or `.txt` file to load it. Use a CSV previously saved by this app for the most reliable results.
* **Print / Export PDF:** Click **Download PDF** to open the browser's print dialog. Choose **Save as PDF** to save a PDF, or select a printer to print it.

> [!NOTE]
> Changes are also saved temporarily in the current browser tab's session. Download a CSV to keep a backup you can reopen later.

---

## ⚡ Quick Reference / Shortcuts

| Action | Control / Shortcut |
| :--- | :--- |
| **Select Card** | Click on any course card |
| **Select Cell** | Click on any empty cell |
| **Copy Card** | Select card, then press <kbd>Ctrl</kbd> + <kbd>C</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>C</kbd> (macOS) |
| **Paste Card** | Select destination cell, then press <kbd>Ctrl</kbd> + <kbd>V</kbd> or <kbd>Cmd</kbd> + <kbd>V</kbd> |
| **Quick Paste** | Double-click an empty cell (pastes copied card) |
| **Move / Swap** | Drag a card and drop onto another cell or card |
| **Select Time Row** | Click on its time label (left column) |
| **Select Day Column**| Click on its day header (top row) |

---

## 💻 Run Locally

The website uses plain HTML, CSS, and JavaScript and requires no installation or build step. Download or clone the repository, then open `index.html` in a modern browser.

Alternatively, run a local server from the project folder:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

---

## 🌐 Browser Support

Use a modern browser with support for HTML5, CSS Grid, JavaScript, and drag-and-drop. Printing and saving as PDF are provided by the browser's print dialog.

| Browser | Status |
| :--- | :---: |
| **Google Chrome / Chromium** | Supported |
| **Mozilla Firefox** | Supported |
| **Microsoft Edge** | Supported |
| **Apple Safari** | Supported |
| **Brave / Opera / Vivaldi** | Supported |
