import React from 'react';
import PropTypes from 'prop-types';
import { keyHandler } from '../utilities';

class CheckFilter extends React.PureComponent {
    static propTypes = {
        label: PropTypes.string.isRequired,
        checked: PropTypes.bool.isRequired,
        count: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
    }

    static defaultProps = {
        className: 'filter-box__filter',
        onChange: () => {},
        checked: false,
        label: '',
        count: ''
    }

    onChange = () => {
        this.props.onChange(this.props.value);
    }

    render() {
        return (
            <label
                className={ this.props.className }
                tabIndex="0"
                onKeyPress={ keyHandler({
                    fn: this.onChange,
                })}
            >
                <input 
                    type="checkbox"
                    value={ this.props.label }
                    checked={ this.props.checked }
                    onChange={ this.onChange }
                    className='filter__checkbox'
                    tabIndex="-1"
                />
                <span className='filter__label'>{`${this.props.label} (${this.props.count})`}</span>
            </label>
        )
    }
}

export default CheckFilter;