import { Cell } from '../types';
import { Grid } from '../objects/Grid';

export interface ChainResult {
  valid: boolean;
  /** Every gear cell that was reachable from source during BFS. */
  reachable: Cell[];
}

/**
 * BFS from source cell through adjacent gear cells to target cell.
 * A chain is valid if there is an unbroken path of gear parts from
 * source to target (4-directional adjacency only, no diagonals).
 */
export function validateChain(grid: Grid): ChainResult {
  const source = grid.getSourceCell();
  const target = grid.getTargetCell();

  if (!source || !target) {
    return { valid: false, reachable: [] };
  }

  const visited  = new Set<string>();
  const queue: Cell[] = [source];
  const reachable: Cell[] = [];

  visited.add(key(source));

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const neighbor of neighbors(grid, current)) {
      const k = key(neighbor);
      if (visited.has(k)) continue;
      visited.add(k);

      if (neighbor.state === 'target') {
        return { valid: true, reachable };
      }

      if (neighbor.state === 'occupied' && neighbor.part?.type === 'gear') {
        reachable.push(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return { valid: false, reachable };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function neighbors(grid: Grid, cell: Cell): Cell[] {
  const { col, row } = cell;
  return [
    grid.getCell(col,     row - 1),  // up
    grid.getCell(col,     row + 1),  // down
    grid.getCell(col - 1, row),      // left
    grid.getCell(col + 1, row),      // right
  ].filter((c): c is Cell => c !== null);
}

function key(cell: Cell): string {
  return `${cell.col},${cell.row}`;
}
