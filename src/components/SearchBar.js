import React from 'react';
import PropTypes from 'prop-types';
import { Theme } from '../theme';
import SVG from './SVG';
import './SearchBar.css';

class SearchBar extends React.PureComponent {
    static propTypes = {
        page: PropTypes.oneOf(['home', 'resource', 'results']),
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
    }

    static defaultProps = {
        onChange: () => {},
        onSubmit: () => {},
        placeholder: '',
    }

    onChange = e => {
        e.preventDefault();
        this.props.onChange({
            page: this.props.page,
            value: e.target.value,
        })
    }

    onSubmit = e => {
        e.preventDefault();
        this.props.onSubmit();
    }

    render() {
        return(
            <Theme element="form" onSubmit={ this.onSubmit } className='searchbar__container'>
                <input 
                    type="text" 
                    value={ this.props.value }
                    onChange={ this.onChange }
                    aria-label="Input search text here to search for a resource"
                    placeholder={ this.props.placeholder }
                />
                <Theme
                    element="button" 
                    type="submit" 
                    className="searchbar__button--submit"
                    aria-label="submit search"
                >
                    <SVG iconType="magnify" />
                </Theme>
            </Theme>
        )
    }
}

export default SearchBar;