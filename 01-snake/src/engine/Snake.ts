import { Cell } from "./Cell";
import { Direction } from "./Direction";

const moveRule = (curDir:Direction, direction:Direction): boolean => {
  switch(direction) { // probably could do a lot better
    case "Left":
      return curDir == "Right" ? true : false;
    case "Right":
      return curDir == "Left" ? true : false;
    case "Up":
      return curDir == "Down" ? true : false;
    case "Down":
      return curDir == "Up" ? true : false;
    case "NONE":
      return false;
  }
}

export class Snake {

  curDir:Direction = "NONE";
  prevDir:Direction = "NONE";
  //dir:object = {cur: "NONE", prev:"NONE"};
  pos:Cell = new Cell(2,0);
  tail:Cell[] =  [new Cell(0, 0), new Cell(1, 0)];



  setDirection(direction: Direction) { 
    if (!moveRule(this.curDir, direction)) {this.curDir = direction;}
    
  }

  move() {
    // X pos
    const pos:Cell = new Cell(this.pos.x, this.pos.y);

    if (this.curDir == "Right") {
      this.pos.x += 1;
    } else if (this.curDir == "Left") {
      this.pos.x -= 1;
    }

     // Y pos
    if (this.curDir == "Up") {
      this.pos.y -= 1;
    } else if (this.curDir == "Down") {
      this.pos.y += 1;
    }

    // Tail Movement
    if (this.curDir != "NONE") {
      for (let i = this.tail.length - 1; i > 0; i--) {
        this.tail[i] = new Cell(this.tail[i -1].x, this.tail[i -1].y);
      }
      this.tail[0] = pos;
    }

  }

  grow() {
    const len = this.tail.length-1;
    this.tail.push(new Cell(this.tail[len].x, this.tail[len].y));
  }

  getHead(): Cell {
    return this.pos
  }

  getDirection(): Direction {
    return this.curDir;
  }

  getTail(): Cell[] {
    return this.tail;
  }

  isTakenBySnake(cell: Cell): boolean {
    let isInside = false
    for (let i = 0; i < this.tail.length; i++) { 
      if (this.tail[i].x === cell.x && this.tail[i].y === cell.y) isInside = true;
    }
    return isInside;
  }
}
