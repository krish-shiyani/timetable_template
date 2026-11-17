const timetable = document.getElementById('timetable');
let cells = Array.from(document.querySelectorAll('.cell'));
const colorPalette = [
    { name: 'Cyan', dark: '#0f4c5c', light: '#4cc9f0' },
    { name: 'Red', dark: '#7a1f2d', light: '#ff6b6b' },
    { name: 'Amber', dark: '#7a4b10', light: '#f9c74f' },
    { name: 'Green', dark: '#245239', light: '#90be6d' },
    { name: 'Purple', dark: '#4b2a69', light: '#9b5de5' },
    { name: 'Blue', dark: '#1d4d7a', light: '#00bbf9' },
    { name: 'Pink', dark: '#6f2d58', light: '#f15bb5' },
    { name: 'Teal', dark: '#1f4d4b', light: '#43aa8b' },
    { name: 'Orange', dark: '#7a3c0e', light: '#fb8500' },
    { name: 'Gray', dark: '#4b5563', light: '#9ca3af' }
];
const colorPaletteContainer = document.getElementById('color-palette');
const courseCodeInput = document.getElementById('course-code');
const courseTitleInput = document.getElementById('course-title');
const courseProfInput = document.getElementById('course-prof');
const courseLocationInput = document.getElementById('course-location');
const timeValueInput = document.getElementById('time-value-input');
const dayNameInput = document.getElementById('day-name-input');
const saveFileButton = document.getElementById('save-file-btn');
const openFileButton = document.getElementById('open-file-btn');
const fileInput = document.getElementById('file-input');
const timetableStorageKey = 'academic-course-timetable';
let draggedCard = null;
let selectedCard = null;
let selectedCell = null;
let clipboardCard = null;
let selectedDayIndex = null;
let selectedTimeRow = null;
let editorClipboardValue = '';

const initialLayout = timetable.innerHTML;

function escapeCsvValue(value) {
    const stringValue = String(value ?? '');
    return `"${stringValue.replace(/"/g, '""')}"`;
}

function parseCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (char === '"') {
            if (inQuotes && line[index + 1] === '"') {
                current += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

function getTimetableState() {
    const dayHeaders = Array.from(document.querySelectorAll('.header.day-header'));
    const timeRows = Array.from(document.querySelectorAll('.time-slot'));
    const days = dayHeaders.map((header) => header.textContent.trim());
    const times = timeRows.map((row) => row.textContent.trim());
    const cellsByRow = [];

    timeRows.forEach((timeRow) => {
        const rowCells = [];
        let nextSibling = timeRow.nextElementSibling;
        while (nextSibling && !nextSibling.classList.contains('time-slot')) {
            rowCells.push(nextSibling);
            nextSibling = nextSibling.nextElementSibling;
        }
        cellsByRow.push(rowCells);
    });

    const grid = cellsByRow.map((rowCells) => rowCells.map((cell) => {
        const card = cell.querySelector('.card');
        if (!card) return '';

        return JSON.stringify({
            code: card.querySelector('.code')?.textContent || '',
            title: card.querySelector('.title')?.textContent || '',
            prof: card.querySelector('.prof')?.textContent || '',
            location: card.querySelector('.location')?.textContent || '',
            light: card.dataset.light || colorPalette[0].light,
            dark: card.dataset.dark || colorPalette[0].dark,
            className: Array.from(card.classList).filter((name) => name !== 'card' && name !== 'dragging' && name !== 'is-selected').join(' ') || 'custom'
        });
    }));

    return { days, times, grid };
}

function serializeStateToCsv(state) {
    const lines = [];
    const header = ['time', ...state.days];
    lines.push(header.map(escapeCsvValue).join(','));

    state.times.forEach((timeLabel, timeIndex) => {
        const row = [timeLabel, ...state.grid[timeIndex].map((cellValue) => cellValue)];
        lines.push(row.map(escapeCsvValue).join(','));
    });

    return lines.join('\n');
}

function buildTimetableFromState(state) {
    timetable.innerHTML = '';

    const timeLabelHeader = document.createElement('div');
    timeLabelHeader.className = 'header time-label';
    timeLabelHeader.textContent = 'Time';
    timetable.appendChild(timeLabelHeader);

    state.days.forEach((dayName) => {
        const header = document.createElement('div');
        header.className = 'header day-header';
        header.textContent = dayName;
        timetable.appendChild(header);
    });

    state.times.forEach((timeLabel, timeIndex) => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = timeLabel;
        timetable.appendChild(timeSlot);

        state.grid[timeIndex].forEach((cellValue) => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (cellValue) {
                try {
                    const cardData = JSON.parse(cellValue);
                    const card = createCardElement({
                        code: cardData.code || '',
                        title: cardData.title || '',
                        prof: cardData.prof || '',
                        location: cardData.location || '',
                        lightColor: cardData.light || colorPalette[0].light,
                        darkColor: cardData.dark || colorPalette[0].dark,
                        subjectClass: cardData.className || 'custom'
                    });
                    cell.appendChild(card);
                    bindCardEvents(card);
                } catch (error) {
                    console.error('Failed to parse timetable cell', error);
                }
            }
            timetable.appendChild(cell);
        });
    });

    refreshCells();
    updateGridColumns();
    updateDayHeaders();
    selectDayHeader(0);
    selectTimeRow(document.querySelector('.time-slot') || null);
    updateTimeInputPlaceholder();
}

function saveTimetableToSession() {
    try {
        sessionStorage.setItem(timetableStorageKey, JSON.stringify(getTimetableState()));
    } catch (error) {
        console.error('Unable to save timetable for this session', error);
    }
}

function restoreTimetableFromSession() {
    try {
        const savedState = sessionStorage.getItem(timetableStorageKey);
        if (!savedState) return;

        const state = JSON.parse(savedState);
        const isValidState = Array.isArray(state.days) &&
            state.days.every((day) => typeof day === 'string') &&
            Array.isArray(state.times) &&
            state.times.every((time) => typeof time === 'string') &&
            Array.isArray(state.grid) &&
            state.grid.length === state.times.length &&
            state.grid.every((row) =>
                Array.isArray(row) &&
                row.length === state.days.length &&
                row.every((cell) => typeof cell === 'string')
            );

        if (!isValidState) {
            throw new Error('Saved timetable data has an invalid format');
        }

        buildTimetableFromState(state);
    } catch (error) {
        console.error('Unable to restore timetable for this session', error);
    }
}

function downloadTimetableFile() {
    const requestedFilename = window.prompt('Enter a filename (the .csv extension is added automatically):', 'timetable');
    if (requestedFilename === null) return;

    const filename = requestedFilename.trim()
        .replace(/\.csv$/i, '')
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
        .trim() || 'timetable';
    const state = getTimetableState();
    const csvContent = serializeStateToCsv(state);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function openTimetableFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content !== 'string') return;

        const rows = content.trim().split(/\r?\n/).map((line) => parseCsvLine(line));
        if (rows.length < 2) return;

        const days = rows[0].slice(1).filter((day) => day !== '');
        const times = [];
        const grid = [];

        rows.slice(1).forEach((row) => {
            if (row.length < 2) return;
            const [timeLabel, ...cellValues] = row;
            times.push(timeLabel);
            grid.push(cellValues.slice(0, days.length));
        });

        if (days.length === 0 || times.length === 0) return;

        buildTimetableFromState({ days, times, grid });
    };
    reader.readAsText(file);
}

function createSwatches() {
    colorPalette.forEach((color, index) => {
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'swatch';
        swatch.style.background = `linear-gradient(135deg, ${color.light} 0%, ${color.dark} 100%)`;
        swatch.dataset.color = color.light;
        swatch.dataset.dark = color.dark;
        swatch.title = color.name;
        swatch.addEventListener('click', () => {
            document.querySelectorAll('.swatch').forEach((item) => item.classList.remove('active'));
            swatch.classList.add('active');
            if (selectedCard) {
                applyCardColor(selectedCard, color.light, color.dark);
            }
        });
        colorPaletteContainer.appendChild(swatch);
    });
}

function createCardElement({ code, title, prof, location, lightColor, darkColor, subjectClass = 'custom' }) {
    const card = document.createElement('div');
    card.className = `card ${subjectClass}`;
    card.draggable = true;
    card.dataset.light = lightColor;
    card.dataset.dark = darkColor;

    const codeEl = document.createElement('div');
    codeEl.className = 'code';
    codeEl.textContent = code;

    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.textContent = title;

    const profEl = document.createElement('div');
    profEl.className = 'prof';
    profEl.textContent = prof;

    const locationEl = document.createElement('div');
    locationEl.className = 'location';
    locationEl.textContent = location;

    card.append(codeEl, titleEl, profEl, locationEl);
    applyCardColor(card, lightColor, darkColor);
    return card;
}

function applyCardColor(card, lightColor, darkColor) {
    card.dataset.light = lightColor;
    card.dataset.dark = darkColor;
    card.style.setProperty('--card-gradient', `linear-gradient(135deg, ${darkColor} 0%, ${lightColor} 100%)`);
    card.style.setProperty('--card-accent', lightColor);
}

function updateEditorFromCard(card) {
    if (!card) return;
    const code = card.querySelector('.code')?.textContent || '';
    const title = card.querySelector('.title')?.textContent || '';
    const prof = card.querySelector('.prof')?.textContent || '';
    const location = card.querySelector('.location')?.textContent?.replace('Room ', '') || '';
    const lightColor = card.dataset.light || colorPalette[0].light;
    const darkColor = card.dataset.dark || colorPalette[0].dark;

    courseCodeInput.value = code;
    courseTitleInput.value = title;
    courseProfInput.value = prof;
    courseLocationInput.value = location;

    document.querySelectorAll('.swatch').forEach((swatch) => {
        swatch.classList.toggle('active', swatch.dataset.color === lightColor && swatch.dataset.dark === darkColor);
    });
}

function selectCard(card) {
    if (selectedCard) {
        selectedCard.classList.remove('is-selected');
    }
    selectedCard = card;
    if (selectedCard) {
        selectedCard.classList.add('is-selected');
        updateEditorFromCard(selectedCard);
    }
}

function setActiveCell(cell) {
    cells.forEach((item) => item.classList.remove('active-cell'));
    if (cell) {
        cell.classList.add('active-cell');
    }
    selectedCell = cell;
}

function getDayCount() {
    return document.querySelectorAll('.header.day-header').length;
}

function getCellDayIndex(cell) {
    let current = cell.previousElementSibling;
    while (current && !current.classList.contains('time-slot')) {
        current = current.previousElementSibling;
    }

    if (!current) return null;

    let index = 0;
    let nextSibling = current.nextElementSibling;
    while (nextSibling && nextSibling !== cell && !nextSibling.classList.contains('time-slot')) {
        index += 1;
        nextSibling = nextSibling.nextElementSibling;
    }

    return nextSibling === cell ? index : null;
}

function updateGridColumns() {
    const dayCount = getDayCount();
    timetable.style.gridTemplateColumns = `130px repeat(${dayCount}, minmax(180px, 1fr))`;
}

function updateDayHeaders() {
    document.querySelectorAll('.header.day-header').forEach((header, index) => {
        header.dataset.dayIndex = String(index);
    });
}

function bindTimeRowEvents(timeSlot) {
    if (timeSlot.dataset.boundTime === 'true') return;
    timeSlot.dataset.boundTime = 'true';

    timeSlot.addEventListener('click', () => {
        selectTimeRow(timeSlot);
    });
}

function refreshCells() {
    cells = Array.from(document.querySelectorAll('.cell'));
    cells.forEach((cell) => bindCellEvents(cell));
    document.querySelectorAll('.time-slot').forEach((timeSlot) => bindTimeRowEvents(timeSlot));
}

function selectDayHeader(dayIndex) {
    document.querySelectorAll('.header.day-header').forEach((header, index) => {
        header.classList.toggle('is-selected', index === dayIndex);
    });
    selectedDayIndex = dayIndex;
}

function selectTimeRow(timeSlot) {
    document.querySelectorAll('.time-slot').forEach((slot) => {
        slot.classList.toggle('is-selected', slot === timeSlot);
    });
    selectedTimeRow = timeSlot;
}

function getTargetCell() {
    if (selectedCell && !selectedCell.querySelector('.card')) {
        return selectedCell;
    }
    const emptyCell = cells.find((cell) => !cell.querySelector('.card'));
    return emptyCell || cells[0];
}

function swapCards(sourceCell, targetCell) {
    const sourceCard = sourceCell.querySelector('.card');
    const targetCard = targetCell.querySelector('.card');

    if (!sourceCard) return;

    if (targetCard) {
        sourceCell.appendChild(targetCard);
        targetCell.appendChild(sourceCard);
    } else {
        targetCell.appendChild(sourceCard);
    }
}

function bindCardEvents(card) {
    if (card.dataset.boundCard === 'true') return;
    card.dataset.boundCard = 'true';

    card.addEventListener('click', () => {
        selectCard(card);
        const parentCell = card.closest('.cell');
        if (parentCell) {
            setActiveCell(parentCell);
            const dayIndex = getCellDayIndex(parentCell);
            if (dayIndex !== null) selectDayHeader(dayIndex);
        }
    });

    card.addEventListener('dblclick', () => {
        selectCard(card);
        const parentCell = card.closest('.cell');
        if (parentCell) {
            setActiveCell(parentCell);
            const dayIndex = getCellDayIndex(parentCell);
            if (dayIndex !== null) selectDayHeader(dayIndex);
        }
    });

    card.addEventListener('dragstart', (event) => {
        draggedCard = card;
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        cells.forEach((cell) => cell.classList.remove('is-over'));
        draggedCard = null;
    });
}

function bindCellEvents(cell) {
    if (cell.dataset.boundCell === 'true') return;
    cell.dataset.boundCell = 'true';

    cell.addEventListener('click', (event) => {
        if (event.target.closest('.card')) return;
        setActiveCell(cell);
        if (selectedCard) {
            selectedCard.classList.remove('is-selected');
            selectedCard = null;
        }
    });

    cell.addEventListener('dblclick', () => {
        if (clipboardCard) {
            const pastedCard = createCardElement({
                code: clipboardCard.querySelector('.code')?.textContent || '',
                title: clipboardCard.querySelector('.title')?.textContent || '',
                prof: clipboardCard.querySelector('.prof')?.textContent || '',
                location: clipboardCard.querySelector('.location')?.textContent || '',
                lightColor: clipboardCard.dataset.light || colorPalette[0].light,
                darkColor: clipboardCard.dataset.dark || colorPalette[0].dark,
                subjectClass: 'custom'
            });
            cell.innerHTML = '';
            cell.appendChild(pastedCard);
            bindCardEvents(pastedCard);
            setActiveCell(cell);
            selectCard(pastedCard);
            updateEditorFromCard(pastedCard);
        }
    });

    cell.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (cell.querySelector('.card') === draggedCard) return;
        cell.classList.add('is-over');
    });

    cell.addEventListener('dragleave', () => {
        cell.classList.remove('is-over');
    });

    cell.addEventListener('drop', (event) => {
        event.preventDefault();
        cell.classList.remove('is-over');

        if (!draggedCard) return;

        const sourceCell = draggedCard.closest('.cell');
        if (!sourceCell || sourceCell === cell) return;

        swapCards(sourceCell, cell);
        refreshCells();
        setActiveCell(cell);
        selectCard(cell.querySelector('.card'));
    });
}

function updateCardText(card) {
    if (!card) return;
    card.querySelector('.code').textContent = courseCodeInput.value.trim();
    card.querySelector('.title').textContent = courseTitleInput.value.trim();
    card.querySelector('.prof').textContent = courseProfInput.value.trim();
    card.querySelector('.location').textContent = courseLocationInput.value.trim();
}

function copyTextToClipboard(text) {
    if (!text) return;

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
        return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

function handleEditorFieldCopy(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        return;
    }

    editorClipboardValue = target.value;
    copyTextToClipboard(target.value);
}

function handleEditorFieldPaste(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        return;
    }

    const pastedText = event.clipboardData?.getData('text/plain') || editorClipboardValue;
    if (!pastedText) {
        return;
    }

    event.preventDefault();
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const nextValue = `${target.value.slice(0, start)}${pastedText}${target.value.slice(end)}`;
    target.value = nextValue;
    const cursorPosition = start + pastedText.length;
    target.setSelectionRange(cursorPosition, cursorPosition);
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.focus();
}

restoreTimetableFromSession();

[courseCodeInput, courseTitleInput, courseProfInput, courseLocationInput].forEach((input) => {
    input.addEventListener('input', () => {
        if (selectedCard) {
            updateCardText(selectedCard);
        }
    });
    input.addEventListener('copy', handleEditorFieldCopy);
    input.addEventListener('paste', handleEditorFieldPaste);
});

document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isEditableField = target instanceof HTMLElement && (
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
    );

    if (isEditableField) {
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && selectedCard) {
        event.preventDefault();
        clipboardCard = selectedCard;
        selectedCard.classList.add('is-selected');
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        if (!clipboardCard) return;

        const targetCell = selectedCell || cells.find((cell) => !cell.querySelector('.card')) || cells[0];
        const pastedCard = createCardElement({
            code: clipboardCard.querySelector('.code')?.textContent || '',
            title: clipboardCard.querySelector('.title')?.textContent || '',
            prof: clipboardCard.querySelector('.prof')?.textContent || '',
            location: clipboardCard.querySelector('.location')?.textContent || '',
            lightColor: clipboardCard.dataset.light || colorPalette[0].light,
            darkColor: clipboardCard.dataset.dark || colorPalette[0].dark,
            subjectClass: 'custom'
        });

        targetCell.innerHTML = '';
        targetCell.appendChild(pastedCard);
        bindCardEvents(pastedCard);
        refreshCells();
        setActiveCell(targetCell);
        selectCard(pastedCard);
        updateEditorFromCard(pastedCard);
    }
});

createSwatches();

document.querySelectorAll('.card').forEach((card) => {
    const lightColor = card.dataset.light || colorPalette[0].light;
    const darkColor = card.dataset.dark || colorPalette[0].dark;
    applyCardColor(card, lightColor, darkColor);
    bindCardEvents(card);
});

refreshCells();
updateTimeInputPlaceholder();

document.querySelectorAll('.header.day-header').forEach((header) => {
    header.addEventListener('click', () => {
        const dayIndex = Number(header.dataset.dayIndex);
        selectDayHeader(dayIndex);
    });
});

document.getElementById('add-card-btn').addEventListener('click', () => {
    const targetCell = getTargetCell();
    const newCard = createCardElement({
        code: '',
        title: '',
        prof: '',
        location: '',
        lightColor: colorPalette[0].light,
        darkColor: colorPalette[0].dark,
        subjectClass: 'custom'
    });

    targetCell.appendChild(newCard);
    bindCardEvents(newCard);
    refreshCells();
    setActiveCell(targetCell);
    selectCard(newCard);
    updateEditorFromCard(newCard);
});

document.getElementById('delete-card-btn').addEventListener('click', () => {
    if (!selectedCard) return;

    const parentCell = selectedCard.closest('.cell');
    if (parentCell) {
        selectedCard.remove();
        parentCell.classList.remove('active-cell');
        selectedCard = null;
        refreshCells();
        setActiveCell(null);
    }
});

document.getElementById('clear-table-btn').addEventListener('click', () => {
    cells.forEach((cell) => {
        cell.innerHTML = '';
        cell.classList.remove('active-cell');
    });
    selectedCard = null;
    selectedCell = null;
    clipboardCard = null;
    refreshCells();
});

function parseTimeToken(token) {
    const match = token.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3] ? match[3].toUpperCase() : null;
    const is12Hour = Boolean(meridiem);

    if (is12Hour) {
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
    }

    return {
        hours,
        minutes,
        totalMinutes: hours * 60 + minutes,
        meridiem,
        is12Hour,
        hasLeadingZero: match[1].length === 2 && match[1].startsWith('0')
    };
}

function formatTimeToken(totalMinutes, sample) {
    let normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    let hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;

    if (sample && sample.is12Hour) {
        const meridiem = hours >= 12 ? 'PM' : 'AM';
        let displayHours = hours % 12;
        if (displayHours === 0) displayHours = 12;
        const hoursStr = sample.hasLeadingZero ? String(displayHours).padStart(2, '0') : String(displayHours);
        const minsStr = String(minutes).padStart(2, '0');
        const space = sample.meridiem ? ' ' : '';
        return `${hoursStr}:${minsStr}${space}${meridiem}`;
    }

    const padHours = sample ? (sample.hasLeadingZero || hours >= 10) : true;
    const hoursStr = padHours ? String(hours).padStart(2, '0') : String(hours);
    const minsStr = String(minutes).padStart(2, '0');
    return `${hoursStr}:${minsStr}`;
}

function parseTimeSlotText(text) {
    if (!text) return null;
    const timeRegex = /\b\d{1,2}:\d{2}(?:\s*[ap]m)?\b/gi;
    const matches = text.match(timeRegex);
    if (!matches || matches.length === 0) return null;

    const tokens = matches.map(parseTimeToken).filter(Boolean);
    if (tokens.length === 0) return null;

    let separator = ' - ';
    if (matches.length >= 2) {
        const idx1 = text.indexOf(matches[0]);
        const idx2 = text.indexOf(matches[1], idx1 + matches[0].length);
        if (idx1 !== -1 && idx2 !== -1) {
            separator = text.substring(idx1 + matches[0].length, idx2);
        }
    }

    return { matches, tokens, separator };
}

function getNextTimeSlot() {
    const timeSlots = Array.from(timetable.querySelectorAll('.time-slot'));
    if (timeSlots.length === 0) {
        return '08:30 - 09:25';
    }

    const lastSlot = timeSlots[timeSlots.length - 1];
    const lastText = lastSlot.textContent.trim();
    const lastParsed = parseTimeSlotText(lastText);

    if (!lastParsed) {
        const numMatch = lastText.match(/^(.*?)(\d+)(.*?)$/);
        if (numMatch) {
            const nextNum = parseInt(numMatch[2], 10) + 1;
            return `${numMatch[1]}${nextNum}${numMatch[3]}`;
        }
        return 'New time';
    }

    const { tokens, separator } = lastParsed;

    if (tokens.length >= 2) {
        const startToken = tokens[0];
        const endToken = tokens[1];
        let duration = endToken.totalMinutes - startToken.totalMinutes;
        if (duration < 0) duration += 24 * 60;

        let breakTime = 0;
        let breakFound = false;

        if (timeSlots.length >= 2) {
            const prevSlot = timeSlots[timeSlots.length - 2];
            const prevParsed = parseTimeSlotText(prevSlot.textContent.trim());
            if (prevParsed && prevParsed.tokens.length >= 2) {
                let prevDuration = prevParsed.tokens[1].totalMinutes - prevParsed.tokens[0].totalMinutes;
                if (prevDuration < 0) prevDuration += 24 * 60;
                let gap = startToken.totalMinutes - prevParsed.tokens[1].totalMinutes;
                if (gap < 0) gap += 24 * 60;

                if (gap >= 0 && gap <= 15 && Math.abs(duration - prevDuration) <= 5) {
                    breakTime = gap;
                    breakFound = true;
                }
            }
        }

        if (!breakFound) {
            if (duration === 55) {
                breakTime = 5;
            } else if (duration === 50) {
                breakTime = 10;
            } else if (duration === 45) {
                breakTime = 15;
            } else {
                breakTime = 0;
            }
        }

        const nextStartMinutes = endToken.totalMinutes + breakTime;
        const nextEndMinutes = nextStartMinutes + duration;

        const nextStartStr = formatTimeToken(nextStartMinutes, startToken);
        const nextEndStr = formatTimeToken(nextEndMinutes, endToken);

        return `${nextStartStr}${separator}${nextEndStr}`;
    }

    if (tokens.length === 1) {
        let step = 60;
        if (timeSlots.length >= 2) {
            const prevSlot = timeSlots[timeSlots.length - 2];
            const prevParsed = parseTimeSlotText(prevSlot.textContent.trim());
            if (prevParsed && prevParsed.tokens.length >= 1) {
                let diff = tokens[0].totalMinutes - prevParsed.tokens[0].totalMinutes;
                if (diff < 0) diff += 24 * 60;
                if (diff > 0 && diff <= 720) step = diff;
            }
        }
        const nextMinutes = tokens[0].totalMinutes + step;
        return formatTimeToken(nextMinutes, tokens[0]);
    }

    return 'New time';
}

function updateTimeInputPlaceholder() {
    if (timeValueInput) {
        timeValueInput.placeholder = getNextTimeSlot();
    }
}

document.getElementById('add-time-btn').addEventListener('click', () => {
    const dayCount = getDayCount();
    const nextTime = getNextTimeSlot();
    const timeSlot = document.createElement('div');
    timeSlot.className = 'time-slot';
    timeSlot.textContent = timeValueInput.value.trim() || nextTime;

    timetable.appendChild(timeSlot);

    for (let index = 0; index < dayCount; index += 1) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        timetable.appendChild(cell);
    }

    refreshCells();
    updateGridColumns();
    selectTimeRow(timeSlot);
    timeValueInput.value = '';
    updateTimeInputPlaceholder();
});

document.getElementById('delete-time-btn').addEventListener('click', () => {
    const targetRow = selectedTimeRow || document.querySelector('.time-slot:last-of-type');
    if (!targetRow) return;

    const cellsInRow = [];
    let nextSibling = targetRow.nextElementSibling;
    while (nextSibling && !nextSibling.classList.contains('time-slot')) {
        cellsInRow.push(nextSibling);
        nextSibling = nextSibling.nextElementSibling;
    }

    cellsInRow.forEach((cell) => cell.remove());
    targetRow.remove();
    refreshCells();
    updateGridColumns();
    selectedTimeRow = null;
    updateTimeInputPlaceholder();
});

document.getElementById('add-day-btn').addEventListener('click', () => {
    const dayCount = getDayCount();
    const insertIndex = selectedDayIndex !== null ? selectedDayIndex : dayCount - 1;
    const newHeader = document.createElement('div');
    newHeader.className = 'header day-header';
    newHeader.dataset.dayIndex = String(insertIndex + 1);
    newHeader.textContent = dayNameInput.value.trim() || `Day ${insertIndex + 2}`;

    const targetHeader = document.querySelectorAll('.header.day-header')[insertIndex];
    if (targetHeader) {
        targetHeader.insertAdjacentElement('afterend', newHeader);
    } else {
        const timeHeader = document.querySelector('.header.time-label');
        timeHeader.insertAdjacentElement('afterend', newHeader);
    }

    document.querySelectorAll('.time-slot').forEach((timeSlot) => {
        const newCell = document.createElement('div');
        newCell.className = 'cell';

        let current = timeSlot.nextElementSibling;
        let cellIndex = 0;
        let insertBefore = null;

        while (current && !current.classList.contains('time-slot')) {
            if (cellIndex === insertIndex + 1) {
                insertBefore = current;
                break;
            }
            cellIndex += 1;
            current = current.nextElementSibling;
        }

        if (insertBefore) {
            insertBefore.insertAdjacentElement('beforebegin', newCell);
        } else {
            let lastCell = timeSlot.nextElementSibling;
            while (lastCell && !lastCell.classList.contains('time-slot')) {
                lastCell = lastCell.nextElementSibling;
            }
            if (lastCell) {
                lastCell.insertAdjacentElement('beforebegin', newCell);
            } else {
                timetable.appendChild(newCell);
            }
        }
    });

    updateDayHeaders();
    refreshCells();
    updateGridColumns();
    selectDayHeader(insertIndex + 1);
    dayNameInput.value = '';
});

document.getElementById('delete-day-btn').addEventListener('click', () => {
    const dayCount = getDayCount();
    if (dayCount <= 1) return;

    let dayIndexToRemove = selectedDayIndex;
    if (dayIndexToRemove === null || dayIndexToRemove >= dayCount) {
        dayIndexToRemove = dayCount - 1;
    }

    const targetHeader = document.querySelectorAll('.header.day-header')[dayIndexToRemove];
    if (!targetHeader) return;

    targetHeader.remove();

    document.querySelectorAll('.time-slot').forEach((timeSlot) => {
        let current = timeSlot.nextElementSibling;
        let index = 0;
        while (current && !current.classList.contains('time-slot')) {
            if (index === dayIndexToRemove) {
                current.remove();
                break;
            }
            current = current.nextElementSibling;
            index += 1;
        }
    });

    updateDayHeaders();
    refreshCells();
    updateGridColumns();
    selectDayHeader(Math.min(dayIndexToRemove, getDayCount() - 1));
});

saveFileButton.addEventListener('click', downloadTimetableFile);
openFileButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (file) {
        openTimetableFile(file);
        fileInput.value = '';
    }
});

document.getElementById('download-pdf-btn').addEventListener('click', () => {
    const timetableWrapper = document.querySelector('.timetable-wrapper');
    if (!timetableWrapper) return;

    const printWindow = window.open('', '', 'width=1200,height=900');
    if (!printWindow) return;

    const printStyles = `
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #000;
            color: #fff;
        }
        .timetable-wrapper {
            overflow-x: visible;
        }
        .timetable-container {
            display: grid;
            grid-template-columns: 130px repeat(5, minmax(170px, 1fr));
            gap: 10px;
            width: 100%;
            min-width: 0;
        }
        .header {
            font-weight: 700;
            color: #ddd;
            font-size: 13px;
            padding: 6px 4px;
        }
        .time-slot {
            display: flex;
            align-items: center;
            color: #ddd;
            font-size: 13px;
            font-weight: 700;
        }
        .cell {
            min-height: 120px;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 8px;
            background: #111;
        }
        .card {
            border-radius: 10px;
            padding: 12px;
            min-height: 100px;
            color: #fff;
            box-shadow: none;
            border-left: 4px solid var(--card-accent, #fff);
            background: var(--card-gradient, #333);
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 4px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .card .code {
            font-size: 17px;
            font-weight: 800;
            line-height: 1.3;
            color: #fdfdfd;
        }
        .card .title {
            font-size: 13px;
            font-weight: 700;
            line-height: 1.4;
            color: #ffffff;
            opacity: 0.95;
        }
        .card .prof {
            font-size: 11px;
            color: #e8f5ff;
        }
        .card .location {
            font-size: 11px;
            font-weight: 700;
            color: #fff3d6;
            margin-top: 2px;
        }
    `;

    printWindow.document.write(`
        <html>
            <head>
                <title>Timetable PDF</title>
                <style>${printStyles}</style>
            </head>
            <body>
                ${timetableWrapper.innerHTML}
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
    });
});

const timetableObserver = new MutationObserver(saveTimetableToSession);
timetableObserver.observe(timetable, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'data-light', 'data-dark']
});
window.addEventListener('pagehide', saveTimetableToSession);
