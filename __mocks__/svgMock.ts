import React from 'react';
export default function SvgMock(props: any) {
  return React.createElement('svg', { ...props, 'data-testid': 'svg-mock' });
}
