import { state, inkState, INK_COLS, INK_ROWS } from '../state.js';

export function initInkGrid() {
    inkState.grid = [];
    inkState.nextGrid = [];
    for (let r = 0; r < INK_ROWS; r++) {
        inkState.grid[r] = new Float32Array(INK_COLS);
        inkState.nextGrid[r] = new Float32Array(INK_COLS);
    }
}

export function updateInk() {
    if (inkState.grid.length === 0) initInkGrid();

    const cw = state.W / INK_COLS, ch = state.H / INK_ROWS;

    if (state.handVisible && state.speed > 1) {
        const c = Math.floor(state.indexPos.x / cw), r = Math.floor(state.indexPos.y / ch);
        depInk(c, r, 1, 1);
    }
    if (state.handVisible && state.isPinching && !state.wasPinching) {
        const c = Math.floor(state.indexPos.x / cw), r = Math.floor(state.indexPos.y / ch);
        depInk(c, r, 1, 2);
    }

    for (let r = 0; r < INK_ROWS; r++) {
        for (let c = 0; c < INK_COLS; c++) {
            let s = inkState.grid[r][c] * 4, n = 4;
            if (r > 0) { s += inkState.grid[r - 1][c]; n++ }
            if (r < INK_ROWS - 1) { s += inkState.grid[r + 1][c]; n++ }
            if (c > 0) { s += inkState.grid[r][c - 1]; n++ }
            if (c < INK_COLS - 1) { s += inkState.grid[r][c + 1]; n++ }
            inkState.nextGrid[r][c] = (s / n) * .97;
        }
    }

    let tmp = inkState.grid;
    inkState.grid = inkState.nextGrid;
    inkState.nextGrid = tmp;

    noStroke();
    for (let r = 0; r < INK_ROWS; r++) {
        for (let c = 0; c < INK_COLS; c++) {
            const v = inkState.grid[r][c];
            if (v < .005) continue;
            fill(map(v, 0, 1, 220, 45), map(v, 0, 1, 60, 90), map(v, 0, 1, 30, 100), v * 90);
            rect(c * cw, r * ch, cw + 1, ch + 1);
        }
    }
}

function depInk(col, row, amt, rad) {
    for (let dr = -rad; dr <= rad; dr++) {
        for (let dc = -rad; dc <= rad; dc++) {
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < INK_ROWS && c >= 0 && c < INK_COLS) {
                const f = Math.max(0, 1 - Math.sqrt(dr * dr + dc * dc) / (rad + 1));
                inkState.grid[r][c] = Math.min(1, inkState.grid[r][c] + amt * f);
            }
        }
    }
}
