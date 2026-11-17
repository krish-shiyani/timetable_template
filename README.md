# Academic Course Timetable Builder

Create and customize a weekly course timetable in your browser. Add courses, organize them by day and time, and save your schedule as a CSV file or PDF.

**Open the website:** [Academic Course Timetable Builder](https://krish-shiyani.github.io/timetable_template/)

## How to use the website

The timetable opens with example courses. Edit these or replace them with your own schedule.

### 1. Add and edit courses

1. Click an empty timetable cell to choose where a new course should go.
2. Click **Create new card**. The new card is selected.
3. Enter the course code, subject title, professor, and class location in the **Card editor**. The card updates as you type.
4. Choose a color swatch to change the selected card's color.

Click any existing card to select it and edit its details. Drag a card to another cell to move it; dropping it onto another card swaps their positions.

### 2. Copy, move, or remove courses

- Select a card and press `Ctrl+C` (Windows/Linux) or `Cmd+C` (macOS) to copy it. Select a destination cell and press `Ctrl+V` or `Cmd+V` to paste.
- You can also double-click a cell to paste the copied card.
- Select a card and click **Delete card** to remove it.
- Click **Clear table** to remove all course cards. This does not delete the days or time rows.

The copied card is held in the page while it is open; it is separate from the system text clipboard.

### 3. Customize days and times

- **Add a time row:** Enter a time range in **New time value** (for example, `14:00 - 15:00`) and click **Add time row**. Leave it blank to use the suggested next time based on the existing rows.
- **Delete a time row:** Click its time label to select it, then click **Delete time row**.
- **Add a day:** Click a day header to select it, enter a name in **New day name**, then click **Add day**. The new day is inserted next to the selected day. If no day is selected, it is added at the end.
- **Delete a day:** Click its header to select it, then click **Delete day**. Its course cards are removed with it. At least one day remains.

### 4. Save, reopen, or print your timetable

- Click **Save** to download the current timetable as `timetable.csv`.
- Click **Open** and choose a timetable `.csv` or `.txt` file to load it. Use a CSV previously saved by this app for the most reliable results.
- Click **Download PDF** to open the browser's print dialog. Choose **Save as PDF** to save a PDF, or select a printer to print it.
- Changes are also saved temporarily in the current browser tab's session. Download a CSV to keep a backup you can reopen later.

## Run locally

The website uses plain HTML, CSS, and JavaScript and requires no installation or build step. Download or clone the repository, then open `index.html` in a modern browser.

Alternatively, run a local server from the project folder:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Browser support

Use a modern browser with support for HTML5, CSS Grid, JavaScript, and drag-and-drop. Printing and saving as PDF are provided by the browser's print dialog.
