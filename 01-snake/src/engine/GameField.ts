import { getRandomValues } from "crypto";
import { Cell } from "./Cell";

export class GameField {
  /**
   * Called when level completed
   */
  apples:Cell[] = []

  constructor() {
    this.seed()
  }

  seed(): void {
    for (let i = 0; i < 5; i++) {
      let x:number = Math.floor(Math.random() * 45);
      let y:number =  Math.floor(Math.random() * 25);
      this.apples.push(new Cell(x,y))
    }
  }

  getApples(): Cell[] {
    return this.apples;
  }

  isAppleInside(cell: Cell):boolean {
    let isInside = false;
    for (let i = 0; i < this.apples.length; i++) { 
      if (this.apples[i].x === cell.x && this.apples[i].y === cell.y) isInside = true;
    }
    return isInside

  }

  removeApple(cell: Cell): void {
    for (let i = 0; i < this.apples.length; i++) {
      if (this.apples[i].x === cell.x && this.apples[i].y === cell.y) { this.apples.splice(i, 1)}
    }
  }

  isEmpty(): boolean {
    console.log(this.apples.length)
    return this.apples.length == 0;
  }
}
