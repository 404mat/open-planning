/**
 * Copy of the avatar generator from avvvatars-react@0.4.2 by Nusu Alabuga,
 * integrated as an app component. The original `goober` CSS-in-JS styles
 * have been replaced with equivalent inline styles so the module has no
 * runtime dependencies; rendering output is unchanged.
 *
 * MIT License
 *
 * Copyright (c) 2022 nusu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import type { ReactNode } from 'react';
import randiman from './random';
import { BACKGROUND_COLORS, TEXT_COLORS, SHAPE_COLORS } from './colors';
import Shape, { ShapeNames } from './shape';

const DEFAULTS = {
  style: 'character',
  size: 32,
  shadow: false,

  border: false,
  borderSize: 2,
  borderColor: '#fff',
};

interface WrapperProps {
  size: number;
  color: string;

  shadow?: boolean;

  border?: boolean;
  borderSize?: number;
  borderColor?: string;
  radius?: number;
}

function Wrapper({
  size,
  color,
  radius,
  shadow,
  border,
  borderSize,
  borderColor,
  children,
}: WrapperProps & { children: ReactNode }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius || size,
        backgroundColor: `#${color}`,

        ...(border && {
          border: `${borderSize}px solid ${borderColor}`,
        }),

        boxSizing: 'border-box',

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',

        ...(shadow && {
          boxShadow: '0px 3px 8px rgba(18, 18, 18, 0.04), 0px 1px 1px rgba(18, 18, 18, 0.02)',
        }),
      }}
    >
      {children}
    </div>
  );
}

// implement size
function Text({ color, size, children }: { color: string; size: number; children: ReactNode }) {
  return (
    <p
      style={{
        /* Reset */
        margin: 0,
        padding: 0,
        textAlign: 'center',
        boxSizing: 'border-box',

        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',

        fontSize: Math.round((size / 100) * 37),
        color: `#${color}`,
        lineHeight: 0,
        textTransform: 'uppercase',
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  );
}

type Style = 'character' | 'shape';
interface Params {
  displayValue?: string;
  // this should be unique to user, it can be email, user id, or full name
  value: string;
  size?: number;
  shadow?: boolean;
  style?: Style;

  // toggle border
  border?: boolean;
  borderSize?: number;
  borderColor?: string;
  radius?: number;
}

export default function Avatars(params: Params) {
  const {
    style = DEFAULTS.style,
    displayValue,
    value,
    radius,
    size = DEFAULTS.size,
    shadow = DEFAULTS.shadow,
    border = DEFAULTS.border,
    borderSize = DEFAULTS.borderSize,
    borderColor = DEFAULTS.borderColor,
  } = params;

  // get first two letters
  const name = String(displayValue || value).substring(0, 2);

  // generate unique random for given value
  // there is 20 colors in array so generate between 0 and 19
  const key = randiman({ value, min: 0, max: 19 });
  // there is 60 shapes so generate between 1 and 60
  const shapeKey = randiman({ value, min: 1, max: 60 });

  return (
    <Wrapper
      size={size}
      color={BACKGROUND_COLORS[key]}
      shadow={shadow}
      border={border}
      borderSize={borderSize}
      borderColor={borderColor}
      radius={radius}
    >
      {style === 'character' ? (
        <Text color={TEXT_COLORS[key]} size={size}>
          {name}
        </Text>
      ) : (
        <Shape
          name={`Shape${shapeKey}` as ShapeNames}
          color={SHAPE_COLORS[key]}
          size={Math.round((size / 100) * 50)}
        />
      )}
    </Wrapper>
  );
}
