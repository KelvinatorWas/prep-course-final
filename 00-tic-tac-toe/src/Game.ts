export type XO = "X" | "O" | "-";

export class Game {
  private cells: XO[] = [
    "-", "-", "-",
    "-", "-", "-",
    "-", "-", "-"
    ];
  
  private turn:XO = "X";

  private winningCombos:number[][] = [];

  private winner:XO = "-";
  
  private genCombos():void {

    for (let i = 0; i < 3; i++) { // rows
      const row = [];
      for (let x = 0; x < 3; x++) {
        row.push(i * 3 + x);
      }
      this.winningCombos.push(row);
    }

    for (let i = 0; i < 3; i++) { // columns
      const col = [];
      for (let x = 0; x < 3; x++) {
        col.push(x * 3 + i);
      }
      this.winningCombos.push(col);
    }

    this.winningCombos.push([0,4,8], [2,4,6]);
  }

  constructor() {
    this.genCombos(); // init combos aka win states
  }

  getCells(): XO[] {
    return this.cells;
  }

  getTurn(): XO {
    return this.turn;
  }

  checkWin() {
    for (const combination of this.winningCombos) {
      if (combination.every(index => this.cells[index] === "X")) {
        this.winner = "X";
      }
      if (combination.every(index => this.cells[index] === "O")) {
        this.winner = "O";
      }
    }
    
  }

  getWinner(): XO {
    this.checkWin()
    return this.winner;
  }

  isTie(): boolean {
    this.checkWin()
    return !this.cells.includes("-") && this.winner != "X" && this.winner != "O";
  }

  onClick(i: number): void {
    //console.log(`cell ${i} clicked`);
    if (this.cells[i] == "-" && this.winner == "-"){
      this.cells[i] = this.turn;
      this.turn = this.turn == "X" ? "O" : "X";
    }
  }

  restart(): void {
    //console.log("restart called");
    this.winner = "-"
    this.cells.fill("-", 0, this.cells.length);
  }
}
