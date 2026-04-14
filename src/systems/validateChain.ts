import { Cell } from '../types';
import { Grid } from '../objects/Grid';

export interface ChainResult {
  valid: boolean;
  /** Every part cell that was reachable from source during BFS. */
  reachable: Cell[];
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
  const source = grid.getSourceCell();
  const target = grid.getTargetCell();
  if (!source || !target) return { valid: false, reachable: [] };

  const visited  = new Set<string>();
  const queue: Cell[] = [source];
  const reachable: Cell[] = [];

  visited.add(cellKey(source));

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const [neighbor, dir] of neighborsWithDir(grid, current)) {
      const k = cellKey(neighbor);
      if (visited.has(k)) continue;

      // Both sides of the connection must expose a port in that direction
      if (!canConnect(current, dir))           continue;
      if (!canConnect(neighbor, OPPOSITE[dir])) continue;

      visited.add(k);

      if (neighbor.state === 'target') {
        return { valid: true, reachable };
      }

      if (neighbor.state === 'occupied' && neighbor.part !== null) {
        reachable.push(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return { valid: false, reachable };
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
  const horizontal = cell.part.rotation % 2 === 0;
  return horizontal
    ? dir === 'left' || dir === 'right'
    : dir === 'up'   || dir === 'down';
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
