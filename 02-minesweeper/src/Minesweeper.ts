import { time, timeEnd, timeStamp } from "console";
import { stdout } from "process";
import { Level } from "./levels";

export class Cell {
  isOpen: boolean = false;
  mines: number = 0;
  isBomb: boolean = false;
  isFlag: boolean = false;
  isUnsure: boolean = false;
}


const resetTiles = (level:Level):Cell[][] => {
  return Array.from({ length: level.rows }, () =>
         Array.from({ length: level.columns }, () => new Cell()));
}

function setMines(cells: Cell[][], level:Level): void {
  let minesPlaced = 0;

  while (minesPlaced < level.mines) {
    const x = Math.floor(Math.random() * level.rows);
    const y = Math.floor(Math.random() * level.columns);

    // Check if the cell is already a mine; if not, mark it as a mine
    if (!cells[x][y].isBomb) {
      cells[x][y].isBomb = true;
      minesPlaced++;
    }
  }
}

function calcNearMines(cells:Cell[][], level:Level) {
  const DIRECTIONS = [-1, 0, 1];

  // Helper function to check if a cell is within bounds
  function isValid(row:number, column:number) {
    return row >= 0 && row < level.rows && column >= 0 && column < level.columns;
  }

  for (let row = 0; row < level.rows; row++) {
    for (let column = 0; column < level.columns; column++) {

      const currentCell = cells[row][column];

      if (!currentCell.isBomb) {
        let neighboringMines = 0;

        for (const dr of DIRECTIONS) {
          for (const dc of DIRECTIONS) {
            if (dr === 0 && dc === 0) continue;
            const newRow = row + dr;
            const newColumn = column + dc;

            if (isValid(newRow, newColumn) && cells[newRow][newColumn].isBomb) {
              neighboringMines++;
            }
          }
        }

        currentCell.mines = neighboringMines;
      }
    }
  }
}



export class Minesweeper {
  private level: Level;
  private cells: Cell[][];
  private questonEnable:boolean;

  private mines:number = 0;
  private pressBomb = false;
  
  private startTime: number | null = null;

  private timePass:number = 0;
  private tense:boolean = false;  

  constructor(level: Level) {
    const savedData = localStorage.getItem("codelexMinesweep")


    if (savedData) {
      const data = JSON.parse(savedData);

      this.cells         = data.cells;
      this.level         = data.level;
      this.mines         = data.mines;
      this.questonEnable = data.questonEnable;
      this.timePass      = data.time;
      this.pressBomb     = data.pressBomb;

    } else {
      this.level = level;
      this.cells = resetTiles(this.level);
      setMines(this.cells, this.level)
      calcNearMines(this.cells, this.level)

      this.mines = this.level.mines;

      this.questonEnable = false;
    }
  }


  openCells(row:number, column:number) { // this is ugly ngl
    const cell = this.cells[row][column];
    
    cell.isOpen = true;

    this.mines += cell.isFlag ? 1 : 0;

    if (cell.mines === 0 && !cell.isBomb) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const newRow = row + dr;
          const newColumn = column + dc;

          if (
            newRow >= 0 &&
            newRow < this.level.rows &&
            newColumn >= 0 &&
            newColumn < this.level.columns
          ) {
            const nextTile = this.cells[newRow][newColumn];

            if (!nextTile.isOpen) {
              this.openCells(newRow, newColumn);
            }
          }
        }
      }
    }
  }


  columnsCount(): number {
    return this.level.columns;
  }

  getCells(): Cell[][] {
    return this.cells;
  }

  onLeftMouseDown(x: number, y: number) {
    this.tense = !this.tense;
    if (!this.isLost() && !this.pressBomb){
      let cell = this.cells[x][y];

      if (this.startTime === null) {
        this.startTime = Date.now();
        this.updateTimer();
      }
      if (!cell.isOpen && !cell.isFlag){
        this.openCells(x,y);
      }
      if (cell.isBomb) this.pressBomb = true;
    }
    this.saveGameData()

  }

  onLeftMouseUp(x: number, y: number) { // idk what to use this for.
  }

  onRightMouseUp(x: number, y: number) {
    let cell = this.cells[x][y];
    if (!this.isLost() && !cell.isOpen && !this.pressBomb){
      cell.isFlag = !cell.isFlag;
      if (cell.isUnsure) {
        cell.isUnsure = false;
        cell.isFlag = false;
        this.mines -= 1;
      } else {
        if (this.questonEnable) cell.isUnsure = !cell.isFlag;
      }

      this.mines += cell.isFlag ? -1 : 1;
    }
    this.saveGameData()
  }

  isTense(): boolean {
    const tense = this.tense;
    this.tense = false;
    return tense;
  }

  timePassed(): number {

    return this.timePass;
  }

  minesLeftCount() {
    return this.mines;
  }

  reset() {
    // reset Minesweeper map
    this.cells = resetTiles(this.level);
    setMines(this.cells, this.level);
    calcNearMines(this.cells, this.level);

    this.mines = this.level.mines;
    this.pressBomb = false;

    this.startTime = null;
    this.timePass = 0;

    this.clearSavedGameData()
    
  }

  currentLevel(): Level {
    return this.level;
  }

  selectLevel(level: Level) {
    this.level = level
    this.reset();
    }

  isLost(): boolean {

    if(this.pressBomb){this.cells.forEach(
      (row:Cell[]) => {
        row.forEach((column:Cell) => {
        column.isOpen = true;   
        })
      });

    this.startTime = null;
    }
    return this.pressBomb;
  }

  isWon(): boolean {
    let bombCount = 0;
    this.cells.forEach(
      (row:Cell[]) => {
        row.forEach((column:Cell) => {
          bombCount += column.isBomb && column.isFlag ? 1 : 0; 
        })
      }
    )
    
    
    return bombCount == this.level.mines ? true : false;
   
  }

  isQuestionMarksEnabled(): boolean {
    return this.questonEnable;
  }

  toggleQuestionMarksEnabled() {
    this.questonEnable = !this.questonEnable;
  }

  updateTimer() {
    setInterval(() => {
      if (this.startTime !== null) {
        const currentTime = Date.now();
        const elapsedTimeInSeconds = Math.floor(
          (currentTime - this.startTime) / 1000
        );
  
        this.timePass += 1;
      }
    }, 1000);
  }
  

  //#region SAVE DATA
  saveGameData() {
    const saveData = {
      cells: this.cells,
      level: this.level,
      mines: this.mines,
      time: this.timePass,
      questonEnable: this.questonEnable,
      pressBomb: this.pressBomb
    };
  
    localStorage.setItem('codelexMinesweep', JSON.stringify(saveData));
  }
  clearSavedGameData() {
    localStorage.removeItem('codelexMinesweep');
  }
  


  //#endregion
}
