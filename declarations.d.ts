declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '@hugeicons/core-free-icons';

declare module '@hugeicons/react-native' {
  import type { ComponentType } from 'react';

  export const HugeiconsIcon: ComponentType<any>;

  const defaultExport: {
    HugeiconsIcon?: ComponentType<any>;
  };

  export default defaultExport;
}
