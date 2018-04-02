import React from 'react';
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
} from '../../utilities';
import FilterBox from '../../components/FilterBox';
import ResultTile from '../../components/ResultTile';
import Spinner from '../../components/ScienceSpinner';
import SearchBar from '../../components/SearchBar';
import queryString from 'query-string';
// import deepEqual from 'deep-equal'; // TODO: Remove dependency if remains unused
import './index.css';

//NOTE: Maybe the searching spinner should happen on the search page and this page only rendered
// when results are returned (however if someone is linked directly here from an external site
// that would be a different flow. Hmm.)

// TOOL SUBTYPE CREATES A LOT OF IDIOSYNCRATIC ISSUES FOR AN EXTENSIBLE APPROACH. SHOULD BE A FLAT HIERARCHY!

class Results extends React.PureComponent {


    newTextSearch = () => {
        this.props.newSearch({
            q: this.props.searchBarValue
        });
    }

    toggleFilter = (filterType) => (filterKey) => () => {
        this.props.updateFilter(filterType, filterKey);
    }

    // This is going to be a highly idiosyncratic process of normalizing the data
    // Move this to a component for clarity
    // TODO: Add in click handler to submit new filter change event
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

        return selected.map((filter, idx) => (
            <div 
                key={ idx }
                className="selected-filters__filter"
                onClick={ this.toggleFilter(filter.param)(filter.key) }
            >
                <p>{`${filter.title}: `} <span>{filter.label}</span> X</p>
            </div>
        ))
    }

    // TODO: When the returned query populates the local state flags for filters, refactor this to render
    // based on those filter flags, not the raw results

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

    componentDidMount() {
        // Check to see if a cached query string exists and commensurate results.
        // Populate from those if possible.
        // Otherwise:
        // We will want to execute a search based on the query params when the component mounts
        // Most of the page will be dynamically rendered based on the results object in the store
        // This includes the state of the filters, the state of the pager, the filters tiles, and
        // potentially the new search bar if we go down that road.
        const unparsedQueryString = this.props.location.search;
        const parsedQueryParams = queryString.parse(unparsedQueryString);
        this.props.newSearch(parsedQueryParams);

        //After the search concludes we want to update the state of the page filters based on the 
        // parsed query string. Controlling that flow is an as yet unanswered implementation question.
        // For now we can draw the filters initially based on whatever is in the currentFacets box and
        // then redraw when it changes 
        // const params = this.parseAndSetQueryStringParamsAsFilters(unparsedQueryString);
    }

    componentDidUpdate(prevProps, prevState) {
        // Watch only for changes to the filters
        if(prevProps.facets && this.props.facets !== prevProps.facets) {
            console.log('Filters have been updated')
            // Generate new search based on current filters state
            const paramsObject = transformFacetFiltersIntoParamsObject(this.props.facets);
            // Need to account for searchText (as well as any other options (from, size...))
            paramsObject.q = this.props.currentSearchText;
            this.props.newSearch(paramsObject);
        }
    }

    render() {
        return (
            this.props.results 
                ?
                    <React.Fragment>
                        <div className="results__header">
                            <h1>Resources for Researchers: Search Results</h1>
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
                        <div className="results__selected-filters">
                            <h4 className="selected-filters__header">Your selections:</h4>
                            <div className="selected-filters__filters-container">
                                { this.renderSelectedFilters() }
                            </div>
                        </div>
                        {/* Selected filters tiles (abstract to component with click callback)*/}
                        <div className="dummy-flex-search-container">
                            <div className="selected-container">
                            </div>
                            <div className="results__facets">
                                {/* TODO: Tool Type can't behave like the other filters and show sibling options 
                                    need a different kind of component.
                                    Brute force: if a tooltype is selected (map the array on each rerender) then
                                    don't render it and instead render subtool type.
                                    The function below should be heavily refactored when approach is determined
                                */}
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
                                {/* Results Tiles */}
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
                        {/* Results pager */}
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
})

const mapDispatchToProps = {
    newSearch,
    updateFilter,
    searchBarOnChange: updateSearchBar,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Results));