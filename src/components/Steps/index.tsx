import React from 'react';
import styles from './index.less';
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

const Steps: React.SFC<StepsProps> = ({ steps, ...restProps }) => (
  <AntSteps {...restProps}>
    {steps.map((step, index) => (
      <AntSteps.Step
        description={<div className={styles.description}>{step.description}</div>}
        icon={step.icon}
        key={step.key || index}
        status={step.status}
        title={step.title}
      />
    ))}
  </AntSteps>
);

export default Steps;
