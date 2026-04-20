import { Cell } from '../types';
import { Grid } from '../objects/Grid';

export interface ChainResult {
  valid: boolean;
  /** Every part cell that was reachable from source during BFS. */
  reachable: Cell[];
  /** Which target cells were actually reached (useful for multi-target debug overlay). */
  reachedTargets: Cell[];
}

type Direction = 'up' | 'down' | 'left' | 'right';

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down', down: 'up', left: 'right', right: 'left',
};

/**
 * BFS from source cell through gear/axle cells to target cell.
 *
 * Connection rules:
 *   Gear      — connects on all 4 sides regardless of rotation.
 *   Axle H    — rotation 0 or 2: connects left and right only.
 *   Axle V    — rotation 1 or 3: connects up and down only.
 *   Source    — connects on all 4 sides (power emitter).
 *   Target    — connects on all 4 sides (motion receiver).
 *
 * A step from A → B in direction D is valid only when:
 *   canConnect(A, D) && canConnect(B, opposite(D))
 *
 * Locked / empty cells are never traversed.
 */
export function validateChain(grid: Grid): ChainResult {
  const source  = grid.getSourceCell();
  const targets = grid.getTargetCells();
  if (!source || targets.length === 0) return { valid: false, reachable: [], reachedTargets: [] };

  const targetKeys = new Set(targets.map(cellKey));
  const visited    = new Set<string>();
  const queue: Cell[] = [source];
  const reachable: Cell[]      = [];
  const reachedTargets: Cell[] = [];

  visited.add(cellKey(source));

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const [neighbor, dir] of neighborsWithDir(grid, current)) {
      const k = cellKey(neighbor);
      if (visited.has(k)) continue;

      if (!canConnect(current, dir))            continue;
      if (!canConnect(neighbor, OPPOSITE[dir])) continue;

      visited.add(k);

      if (neighbor.state === 'target') {
        if (targetKeys.has(k)) reachedTargets.push(neighbor);
        // Don't push target into BFS queue — it's a terminal node
        continue;
      }

      if (neighbor.state === 'occupied' && neighbor.part !== null) {
        reachable.push(neighbor);
        queue.push(neighbor);
      }
    }
  }

  const valid = reachedTargets.length === targets.length;
  return { valid, reachable, reachedTargets };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Does this cell expose a connection port on the given side?
 * Source and target are omnidirectional.
 * Gear is omnidirectional.
 * Axle is unidirectional along its axis.
 */
function canConnect(cell: Cell, dir: Direction): boolean {
  if (cell.state === 'source' || cell.state === 'target') return true;
  if (!cell.part) return false;

  if (cell.part.type === 'gear') return true;

  // Axle: even rotation = horizontal (left/right), odd = vertical (up/down)
  if (cell.part.type === 'axle') {
    const horizontal = cell.part.rotation % 2 === 0;
    return horizontal
      ? dir === 'left' || dir === 'right'
      : dir === 'up'   || dir === 'down';
  }

  // Corner gear: connects exactly 2 sides in an L-shape
  // 0=right+down  1=down+left  2=left+up  3=up+right
  if (cell.part.type === 'corner') {
    const CORNER_DIRS: Record<number, [Direction, Direction]> = {
      0: ['right', 'down'],
      1: ['down',  'left'],
      2: ['left',  'up'],
      3: ['up',    'right'],
    };
    const [a, b] = CORNER_DIRS[cell.part.rotation];
    return dir === a || dir === b;
  }

  return false;
}

function neighborsWithDir(grid: Grid, cell: Cell): Array<[Cell, Direction]> {
  const { col, row } = cell;
  const candidates: Array<[Cell | null, Direction]> = [
    [grid.getCell(col,     row - 1), 'up'],
    [grid.getCell(col,     row + 1), 'down'],
    [grid.getCell(col - 1, row),     'left'],
    [grid.getCell(col + 1, row),     'right'],
  ];
  return candidates.filter((c): c is [Cell, Direction] => c[0] !== null);
}

function cellKey(cell: Cell): string {
  return `${cell.col},${cell.row}`;
}
