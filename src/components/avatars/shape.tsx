import type { ComponentType, ReactNode } from 'react';
import * as shapes from './shapes';
import { ShapeProps } from './shapes';

export type ShapeNames = keyof typeof shapes;
interface ShapeList {
  [key: string]: ComponentType<ShapeProps>;
}

export interface Props {
  name: ShapeNames;
  size?: number;
  color: string;
}

function ShapeWrapper({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',

        color: `#${color || 'currentColor'}`,
      }}
    >
      {children}
    </span>
  );
}

export const shapeList = Object.keys(shapes);

export default function Shape(props: Props) {
  const { name, size = 24 } = props;

  const Tag = (shapes as ShapeList)[name];

  if (!Tag) {
    // shape doen't exists
    return null;
  }

  return (
    <ShapeWrapper color={props.color}>
      <Tag width={size} />
    </ShapeWrapper>
  );
}
