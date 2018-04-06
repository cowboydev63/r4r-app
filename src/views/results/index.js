import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { 
    newSearch,
    updateFilter,
} from '../../state/api/actions';
import {
    updateSearchBar,
} from '../../state/searchForm/actions'
import {
    transformFacetFiltersIntoParamsObject,
    keyHandler,
} from '../../utilities';
import FilterBox from '../../components/FilterBox';
import ResultTile from '../../components/ResultTile';
import Spinner from '../../components/ScienceSpinner';
import SearchBar from '../../components/SearchBar';
import Pager from '../../components/Pager';
import queryString from 'query-string';
import '../../polyfills/object_entries';
// import deepEqual from 'deep-equal'; // TODO: Remove dependency if remains unused
import {
    resourceInterface
} from '../../interfaces';
import './index.css';

//TODO: NOTE: Maybe the searching spinner should happen on the search page and this page only rendered
// when results are returned (however if someone is linked directly here from an external site
// that would be a different flow. Hmm.)

class Results extends React.PureComponent {

    static propTypes = {
        newSearch: PropTypes.func.isRequired,
        updateFilter: PropTypes.func.isRequired,
        searchBarOnChange: PropTypes.func.isRequired,
        totalResults: PropTypes.number,
        startFrom: PropTypes.number,
        searchBarValue: PropTypes.string,
        currentSearchText: PropTypes.string,
        facets: PropTypes.objectOf(PropTypes.shape({
            title: PropTypes.string.isRequired,
            param: PropTypes.oneOf(['toolTypes.type', 'toolTypes.subtype', 'researchAreas', 'researchTypes']),
            items: PropTypes.objectOf(PropTypes.shape({
                label: PropTypes.string.isRequired,
                count: PropTypes.number.isRequired,
                selected: PropTypes.bool.isRequired,
            }))
        })),
        results: PropTypes.arrayOf(resourceInterface),
    }

    newTextSearch = () => {
        // Do not execute on empty search fields
        if(this.props.searchBarValue) {
            this.props.newSearch({
                q: this.props.searchBarValue
            });
        }
    }

    pagerSearch = from => {
        const paramsObject = transformFacetFiltersIntoParamsObject(this.props.facets);
        //TODO: Need to account for searchText (as well as any other options (from, size...))
        //TODO: Only send text if textfield is populated
        const paramsObjectFinal = {
            ...paramsObject,
            ...from,
            q: this.props.currentSearchText,
        };
        this.props.newSearch(paramsObjectFinal);        
    }

    toggleFilter = (filterType) => (filterKey) => () => {
        this.props.updateFilter(filterType, filterKey);
    }

    // This is going to be a highly idiosyncratic process of normalizing the data
    // Move this to a component for clarity
    renderSelectedFilters = () => {
        const selected = Object.entries(this.props.facets).reduce((acc, [param, facet]) => {
            const filters = Object.entries(facet.items).reduce((acc, [key, filter]) => {
                if(filter.selected) {
                    const filterContext = {
                        ...filter,
                        key,
                        title: facet.title,
                        param,
                    }
                    return [...acc, filterContext]
                }
                return acc;
            }, [])
            return [...acc, ...filters];
        }, [])

        if(!selected.length) {
            return null;
        }

        return (
            <React.Fragment>
                <h4 className="selected-filters__header" aria-hidden>Your selections:</h4>
                <div className="selected-filters__filters-container">
                {
                    selected.map((filter, idx) => (
                        <div 
                            key={ idx }
                            className="selected-filters__filter"
                            onClick={ this.toggleFilter(filter.param)(filter.key) }
                            onKeyPress={ keyHandler({
                                fn: this.toggleFilter(filter.param)(filter.key),
                            })}
                        >
                            <p>{`${filter.title}: `} <span>{filter.label}</span> X</p>
                        </div>
                    ))
                }
                </div>
            </React.Fragment>
        )
        
    }

    //TODO: Pass the facet type and facets separately and handle the logic of rendering there
    renderToolTypes = () => {
        if(this.props.facets['toolTypes.type']) {
            const toolTypesTypeFilters = this.props.facets['toolTypes.type'].items;
            const isToolTypeSelected = Object.entries(toolTypesTypeFilters).some(([key, obj]) => obj.selected);
            return !isToolTypeSelected
                ?   <FilterBox 
                        className="tool-types"
                        facet={ this.props.facets['toolTypes.type'] }
                        onChange={ this.toggleFilter('toolTypes.type') }
                    />
                : this.props.facets['toolTypes.subtype'] && this.props.facets['toolTypes.subtype'].items
                ?   <FilterBox
                        className="subtool-types"
                        facet={ this.props.facets['toolTypes.subtype'] }
                        onChange={ this.toggleFilter('toolTypes.subtype') }
                    />
                : null //TODO: Redundant, rework
        }
        return null;
    }

    // TODO: Refactor to move this logic to the component itself largely
    renderPager = (withCounter = false) => {
        return this.props.totalResults 
            ?
                <Pager
                    total={ this.props.totalResults }
                    resultsSize={ this.props.results && this.props.results.length }
                    startFrom={ this.props.startFrom }
                    onClick={ this.pagerSearch }
                    withCounter={ withCounter }
                />
            :
                null;
    }

    componentDidMount() {
        const unparsedQueryString = this.props.location.search;
        const parsedQueryParams = queryString.parse(unparsedQueryString);
        this.props.newSearch(parsedQueryParams);
    }

    componentDidUpdate(prevProps, prevState) {
        // Watch only for changes to the filters
        if(prevProps.facets && this.props.facets !== prevProps.facets) {
            console.log('Filters have been updated')
            // Generate new search based on current filters state
            const paramsObject = transformFacetFiltersIntoParamsObject(this.props.facets);
            //TODO: Need to account for searchText (as well as any other options (from, size...))
            paramsObject.q = this.props.currentSearchText;
            this.props.newSearch(paramsObject);
        }

        // And to the URL querystring
        if(prevProps.location.search && prevProps.location.search !== this.props.location.search) {
            console.log('User navigation triggered refresh')
            // Same procedure as the first pass in componentDidMount
            const unparsedQueryString = this.props.location.search;
            const parsedQueryParams = queryString.parse(unparsedQueryString);
            this.props.newSearch(parsedQueryParams);       
        }
    }

    render() {
        return (
            this.props.results 
                ?
                    <React.Fragment>
                        <div className="results__header">
                            <h1>Resources for Researchers</h1>
                            <div className='results__count-container'>
                                <h2>We found {this.props.results.length} results that match your search</h2>
                                <h2><Link to="/">Start Over</Link></h2>
                            </div>
                            <SearchBar 
                                value={ this.props.searchBarValue }
                                onChange={ this.props.searchBarOnChange }
                                onSubmit={ this.newTextSearch }
                                page='results'                            
                            />
                        </div>
                        <div className="results__selected-filters" aria-label="Selected Search Filters">
                            { this.renderSelectedFilters() }
                        </div>
                        { this.renderPager(true) }
                        <div className="dummy-flex-search-container">
                            <div className="results__facets" aria-label="Search Filters">
                                { this.renderToolTypes() }
                                <FilterBox 
                                    facet={ this.props.facets['researchAreas'] }
                                    onChange={ this.toggleFilter('researchAreas') }
                                />
                                <FilterBox 
                                    facet={ this.props.facets['researchTypes'] }
                                    onChange={ this.toggleFilter('researchTypes') }
                                />
                            </div>
                            <div className="results-container">
                                {
                                    this.props.results.map(({
                                        title,
                                        description,
                                        id
                                    }, idx) => (
                                        <ResultTile
                                            key={ idx }
                                            title={ title }
                                            description={ description }
                                            id={ id }
                                        />
                                    ))
                                }
                            </div>
                        </div>
                        { this.renderPager() }
                    </React.Fragment>
                :
                    <Spinner />
        )
    }
}

const mapStateToProps = ({ api, searchForm }) => ({
    results: api.currentResults,
    facets: api.currentFacets,
    currentSearchText: api.currentSearchText,
    searchBarValue: searchForm.searchBarValues.results,
    totalResults: api.currentMetaData && api.currentMetaData.totalResults,
    startFrom: api.currentMetaData && api.currentMetaData.from,
})

const mapDispatchToProps = {
    newSearch,
    updateFilter,
    searchBarOnChange: updateSearchBar,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Results));