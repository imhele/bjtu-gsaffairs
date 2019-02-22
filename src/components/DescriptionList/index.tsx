import React from 'react';
import { Col, Row } from 'antd';
import styles from './index.less';
import classNames from 'classnames';
import responsive from './responsive';
import { ColProps } from 'antd/es/grid/col';

export interface DescriptionProps extends ColProps {
  column?: number;
  key?: string | number;
  style?: React.CSSProperties;
  term?: React.ReactNode;
}

export interface DescriptionListProps {
  className?: string;
  col?: number;
  description?: DescriptionProps[];
  gutter?: number;
  layout?: 'horizontal' | 'vertical';
  size?: 'large' | 'small';
  style?: React.CSSProperties;
  title?: React.ReactNode;
}

const Description: React.SFC<DescriptionProps> = ({ term, column, children, ...restProps }) => (
  <Col {...responsive[column]} {...restProps}>
    {term && <div className={styles.term}>{term}</div>}
    {children && (
      <div className={styles.detail}>
        {typeof children === 'string'
          ? children.split('\n').map((child, index) => <div key={index}>{child}</div>)
          : children}
      </div>
    )}
  </Col>
);

Description.defaultProps = {
  term: '',
};

const DescriptionList: React.SFC<DescriptionListProps> = ({
  className,
  col,
  description,
  gutter,
  layout,
  size,
  style,
  title,
}) => {
  const clsString = classNames(styles.descriptionList, styles[layout], className, {
    [styles.small]: size === 'small',
    [styles.large]: size === 'large',
  });
  const column = col > 4 ? 4 : col;
  return (
    <div className={clsString} style={style}>
      {title && <div className={styles.title}>{title}</div>}
      <Row gutter={gutter}>
        {description.map((props, key) => Description({ column, key, ...props }))}
      </Row>
    </div>
  );
};

DescriptionList.defaultProps = {
  col: 3,
  description: [],
  layout: 'horizontal',
  gutter: 32,
};

export default DescriptionList;
