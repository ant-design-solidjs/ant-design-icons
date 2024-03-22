// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY

import * as React from 'react'
import TwitchFilledSvg from '@ant-design/icons-svg/lib/asn/TwitchFilled';
import AntdIcon, { AntdIconProps } from '../components/AntdIcon';

const TwitchFilled = (
  props: AntdIconProps,
  ref: React.MutableRefObject<HTMLSpanElement>,
) => <AntdIcon {...props} ref={ref} icon={TwitchFilledSvg} />;

const RefIcon: React.ForwardRefExoticComponent<
  Omit<AntdIconProps, 'ref'> & React.RefAttributes<HTMLSpanElement>
> = React.forwardRef<HTMLSpanElement, AntdIconProps>(TwitchFilled);

if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TwitchFilled';
}

export default RefIcon;