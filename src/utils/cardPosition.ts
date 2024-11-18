import { TABLE_HEIGHT, TABLE_WIDTH, DEFAULT_TABLE_MARGIN } from '@/constants';

interface Position {
  x: number;
  y: number;
}

export function calculateCardPositionsInRectangle(
  numCards: number,
  margin = DEFAULT_TABLE_MARGIN
): Position[] {
  if (numCards === 0) return [];

  const positions: Position[] = [];
  const effectiveMargin = margin * 4; // Increased margin for more space
  const areaWidth = TABLE_WIDTH;
  const areaHeight = TABLE_HEIGHT;

  // Distribute cards evenly across all sides
  const totalPositions = Math.max(8, Math.ceil(numCards / 4) * 4); // Ensure at least 8 positions
  const positionsPerSide = totalPositions / 4;

  // Calculate how many cards should go on each side for perfect distribution
  const distribution = {
    top: Math.min(positionsPerSide, Math.ceil(numCards / 4)),
    right: Math.min(
      positionsPerSide,
      Math.ceil((numCards - positions.length) / 3)
    ),
    bottom: Math.min(
      positionsPerSide,
      Math.ceil((numCards - positions.length) / 2)
    ),
    left: Math.min(positionsPerSide, numCards - positions.length),
  };

  // Helper function to calculate position with offset from center
  const calculatePosition = (
    progress: number,
    side: 'top' | 'right' | 'bottom' | 'left'
  ): Position => {
    const padding = 20; // Additional padding from corners

    switch (side) {
      case 'top':
        return {
          x: padding + (areaWidth - 2 * padding) * progress,
          y: -effectiveMargin,
        };
      case 'right':
        return {
          x: areaWidth + effectiveMargin,
          y: padding + (areaHeight - 2 * padding) * progress,
        };
      case 'bottom':
        return {
          x: areaWidth - (padding + (areaWidth - 2 * padding) * progress),
          y: areaHeight + effectiveMargin,
        };
      case 'left':
        return {
          x: -effectiveMargin,
          y: areaHeight - (padding + (areaHeight - 2 * padding) * progress),
        };
    }
  };

  // Place cards on each side
  Object.entries(distribution).forEach(([side, count]) => {
    if (count <= 0) return;

    for (let i = 0; i < count; i++) {
      const progress = count === 1 ? 0.5 : i / (count - 1);
      positions.push(
        calculatePosition(progress, side as 'top' | 'right' | 'bottom' | 'left')
      );
    }
  });

  // Only return the number of positions we actually need
  return positions.slice(0, numCards);
}
