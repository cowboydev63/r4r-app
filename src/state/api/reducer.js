import {
    SET_CURRENT_SEARCH_TEXT,
    LOAD_NEW_SEARCH_RESULTS,
    UPDATE_TOOLTYPE_FILTER,
    LOAD_NEW_FACET_RESULTS,
    UNMOUNT_RESULTS_VIEW,
    FETCHING_STATUS,
    LOAD_RESOURCE,
    UPDATE_FILTER,
    CLEAR_FILTERS,
} from './actions';
import {
    REGISTER_ERROR,
} from '../error/actions';

const initialState = {
    isFetching: false,
    fetchId: null,
    isFetchingFacets: false,
    searchParams: '',
    referenceFacets: null,
    currentSearchQueryString: '',
    currentSearchText: '',
    currentResults: null, 
    currentFilters: null,
    currentMetaData: null,
    currentFacets: null,
    currentResource: null,
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case UPDATE_FILTER:
            const {
                filterType,
                filter
            } = action.payload;
            return {
                ...state,
                currentFacets: {
                    ...state.currentFacets,
                    [filterType]: {
                        ...state.currentFacets[filterType],
                        items: {
                            ...state.currentFacets[filterType].items,
                            [filter]: {
                                ...state.currentFacets[filterType].items[filter],
                                selected: !state.currentFacets[filterType].items[filter].selected,
                            }
                        }
                    }
                },
                // We want to reset the results page to the first page of results whenever a filter is flipped
                currentMetaData: {
                    ...state.currentMetaData,
                    from: 0,
                }
            }
        case UPDATE_TOOLTYPE_FILTER:
            const {
                toolSubtypes,
                ...currFacets
            } = state.currentFacets;
            return {
                ...state,
                currentFacets: {
                    ...currFacets,
                    'toolTypes': {
                        ...state.currentFacets['toolTypes'],
                        items: {
                            ...state.currentFacets['toolTypes'].items,
                            [action.payload.filter]: {
                                ...state.currentFacets['toolTypes'].items[action.payload.filter],
                                selected: !state.currentFacets['toolTypes'].items[action.payload.filter].selected,
                            }
                        }
                    },
                },
                // We want to reset the results page to the first page of results whenever a filter is flipped                
                currentMetaData: {
                    ...state.currentMetaData,
                    from: 0,
                }
            }
        case CLEAR_FILTERS:
            const newCurrentFacets = Object.entries(state.currentFacets).reduce((acc, [facetKey, facetValue]) => {
                const newItems = Object.entries(facetValue.items).reduce((acc, [itemKey, itemValue])=> {
                    acc[itemKey] = {
                        ...itemValue,
                        selected: false,
                    }
                    return acc;
                }, {})
                acc[facetKey] = {
                    ...facetValue,
                    items: newItems,
                } 
                return acc;
            }, {})
            return {
                ...state,
                currentFacets: {
                    ...state.currentFacets,
                    ...newCurrentFacets,
                },
                currentMetaData: {
                    ...state.currentMetaData,
                    from: 0,
                }
            }
        case LOAD_RESOURCE:
            return {
                ...state,
                currentResource: action.payload,
                isFetching: false,
                fetchId: null,
            }
        case FETCHING_STATUS:
            return {
                ...state,
                isFetching: action.payload.isFetching,
                fetchId: action.payload.fetchId,
            }
        case LOAD_NEW_FACET_RESULTS:
            return {
                ...state,
                referenceFacets: action.payload,
                isFetching: false,
            }
        case LOAD_NEW_SEARCH_RESULTS:
            const {
                results: currentResults,
                facets: currentFacets,
                meta: currentMetaData,
            } = action.payload.results;
            return {
                ...state,
                currentSearchQueryString: action.payload.newQueryString,
                isFetching: false,
                fetchId: null,
                currentResults,
                currentFacets,
                currentMetaData,
            };
        case UNMOUNT_RESULTS_VIEW:
            return {
                ...state,
                currentSearchQueryString: '',
                isFetching: false,
                fetchId: null,
                currentResults: null,
                currentFacets: null,
                currentMetaData: null,
            }
        case SET_CURRENT_SEARCH_TEXT:
            return {
                ...state,
                currentSearchText: action.payload,
            }
        case REGISTER_ERROR: 
            return {
                ...state,
                isFetching: false,
                fetchId: null,
                isFetchingFacets: false
            }
        default:
            return state;
    }
}

export default reducer;