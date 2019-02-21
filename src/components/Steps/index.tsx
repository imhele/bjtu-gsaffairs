import React from 'react';
import { Steps as AntSteps } from 'antd';

export interface StepsItem {
  key?: string | number;
  description?: string;
  icon?: string;
  status?: 'wait' | 'process' | 'finish' | 'error';
  title?: string;
}

export interface StepsProps {
  className?: string;
  current?: number;
  direction?: 'horizontal' | 'vertical';
  labelPlacement?: 'horizontal' | 'vertical';
  progressDot?: boolean;
  size?: 'default' | 'small';
  status?: 'wait' | 'process' | 'finish' | 'error';
  steps?: StepsItem[];
  style?: React.CSSProperties;
}

const Steps: React.SFC<StepsProps> = ({ steps, ...restProps }) =>
  steps && steps.length ? (
    <AntSteps {...restProps}>
      {steps.map((step, index) => (
        <AntSteps.Step {...step} key={step.key || index} />
      ))}
    </AntSteps>
  ) : null;

export default Steps;
