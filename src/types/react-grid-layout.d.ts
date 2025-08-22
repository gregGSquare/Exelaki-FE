declare module 'react-grid-layout' {
  import * as React from 'react';

  export type Layout = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
  };

  export type Layouts = { [breakpoint: string]: Layout[] };

  export interface ResponsiveProps {
    className?: string;
    breakpoints?: { [key: string]: number };
    cols?: { [key: string]: number };
    layouts?: Layouts;
    rowHeight?: number;
    compactType?: 'vertical' | 'horizontal' | null;
    isBounded?: boolean;
    draggableHandle?: string;
    onLayoutChange?: (currentLayout: Layout[], allLayouts: Layouts) => void;
    children?: React.ReactNode;
  }

  export const Responsive: React.ComponentType<ResponsiveProps>;
  export function WidthProvider<P>(component: React.ComponentType<P>): React.ComponentType<P>;
}


