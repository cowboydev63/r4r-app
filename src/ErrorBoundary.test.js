import React from 'react';
import { shallow } from 'enzyme';
import { ErrorBoundary } from './ErrorBoundary';

describe('Error Boundary HOC', ()=> {
  it('renders correctly', () => {
    const wrapper = shallow(<ErrorBoundary />);
    expect(wrapper).toMatchSnapshot();
  })

})