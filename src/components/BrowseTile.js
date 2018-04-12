import React from 'react';
import PropTypes from 'prop-types';
import { Theme } from '../theme';
import './BrowseTile.css';

class BrowseTile extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        onClick: PropTypes.func.isRequired,
        onKeyPress: PropTypes.func.isRequired,
    }

    static defaultProps = {
        onClick: () => {},
        onKeyPress: () => {},
    }

    render() {
        return (
            <Theme
                type="div"
                className="browse__tile"
                role="link"
                tabIndex='0' 
                onClick={ this.props.onClick }
                onKeyPress={ this.props.onKeyPress }
            >
                <p>{ this.props.label }</p>
            </Theme>
        )
    }
}

export default BrowseTile;