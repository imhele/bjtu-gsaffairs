import React from 'react';
import { Col, Row } from 'antd';
import styles from './index.less';
import classNames from 'classnames';
import responsive from './responsive';
import { ColProps } from 'antd/es/grid/col';

export interface DescriptionProps extends ColProps {
  column?: number;
  style?: React.CSSProperties;
  term: React.ReactNode;
}

export interface DescriptionListProps {
  className?: string;
  col?: number;
  gutter?: number;
  layout?: 'horizontal' | 'vertical';
  size?: 'large' | 'small';
  style?: React.CSSProperties;
  title: React.ReactNode;
}

const Description: React.SFC<DescriptionProps> = ({ term, column, children, ...restProps }) => (
  <Col {...responsive[column]} {...restProps}>
    {term && <div className={styles.term}>{term}</div>}
    {children !== null && children !== undefined && <div className={styles.detail}>{children}</div>}
  </Col>
);

Description.defaultProps = {
  term: '',
};

interface DescriptionListComponent extends React.SFC<DescriptionListProps> {
  Description: typeof Description;
}

const DescriptionList: DescriptionListComponent = ({
  className,
  title,
  col = 3,
  layout = 'horizontal',
  gutter = 32,
  children,
  size,
  ...restProps
}) => {
  const clsString = classNames(styles.descriptionList, styles[layout], className, {
    [styles.small]: size === 'small',
    [styles.large]: size === 'large',
  });
  const column = col > 4 ? 4 : col;
  return (
    <div className={clsString} {...restProps}>
      {title ? <div className={styles.title}>{title}</div> : null}
      <Row gutter={gutter}>
        {React.Children.map(children, child =>
          child ? React.cloneElement(child, { column }) : child,
        )}
      </Row>
    </div>
  );
};

DescriptionList.Description = Description;

export default DescriptionList;
