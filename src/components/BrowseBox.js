import React from 'react';
import PropTypes from 'prop-types';
import { Theme } from '../theme';
import BrowseTile from './BrowseTile';
import Spinner from './CTS_Spinner';
import { keyHandler } from '../utilities';
import '../polyfills/object_entries';
import './BrowseBox.css';

class BrowseBox extends React.PureComponent {
    static propTypes = {
        facets: PropTypes.object,
        className: PropTypes.string,
        searchFunction: PropTypes.func.isRequired,
        filterType: PropTypes.string.isRequired,
        isFetching: PropTypes.bool,
        showCount: PropTypes.bool,
    }

    static defaultProps = {
        facets: {},
        searchFunction: () => {},
        filterType: '',
        displayCount: false,
    }

    renderFacets = () => {
        if(!this.props.facets || !this.props.facets.hasOwnProperty(this.props.filterType)) return null;

        // We want to make sure the filters are displayed in descending order
        return Object.entries(this.props.facets[this.props.filterType].items)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([key, { label, count }], idx) => {
                return (
                    <BrowseTile
                        key={ idx }
                        label={ label }
                        count={ count }
                        displayCount={ this.props.displayCount }
                        className="browse__tile"
                        onClick={ 
                            this.props.searchFunction({
                                filterType: this.props.filterType,
                                filter: key,
                            })
                        }
                        onKeyPress={
                            keyHandler({
                                fn: this.props.searchFunction({
                                    filterType: this.props.filterType,
                                    filter: key
                                }),
                            })
                        }
                    />
                )
        })
    }

    render() {
        return(
            <Theme element="div" className="browse-tiles__container">
                {
                    !this.props.isFetching
                    ?
                        this.renderFacets()
                    :
                        <Spinner />
                }
            </Theme>
        )
    }
}

export default BrowseBox;