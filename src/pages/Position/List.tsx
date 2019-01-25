import React, { Component } from 'react';
import StandardFilter, { FilterType } from '@/components/StandardFilter';

export default class List extends Component {
  render() {
    return (
      <div>
        <StandardFilter
          filters={[
            { id: 'test1', type: FilterType.Input },
            { id: 'test2', type: FilterType.InputNumber },
            {
              id: 'test3',
              type: FilterType.Select,
              selectOptions: [{ value: 'Option1', title: 'bbb' }, { value: 'Option2', title: 'aaa' }],
            },
          ]}
        />
      </div>
    );
  }
}
