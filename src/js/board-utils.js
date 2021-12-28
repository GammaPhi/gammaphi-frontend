
export const NUM_ROWS = 8;
export const NUM_COLS = 8;

export const formatBoard = (board, team) => {
    let array = [];
    for(let i = 0; i < NUM_ROWS; i++) {
        let row = board.substring(i*NUM_ROWS, i*NUM_ROWS+NUM_COLS).split('');
        if (team === 'b') {
            row.reverse();
        }
        array.push(row);        
    }
    if (team === 'b') {
        array.reverse();
    }
    return array;
}

export const coordsToIndex = (row, col) => {
    return row * NUM_ROWS + col;
}

export const indexToCoords = (index) => {
    return [Math.floor(index / NUM_ROWS), index % NUM_COLS];
}