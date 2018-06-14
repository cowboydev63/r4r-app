import React from 'react';
import { shallow } from 'enzyme';
import CTS_Spinner from './CTS_Spinner';

describe('CTS_Spinner Component', () => {
    it('renders correctly', () => {
        const wrapper = shallow(<CTS_Spinner/>);
        expect(wrapper).toMatchSnapshot();
    })
})