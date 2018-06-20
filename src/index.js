import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import * as myReducers from './state';
import { createBrowserHistory } from 'history';
import { routerMiddleware as createRouterMiddleware, routerReducer } from 'react-router-redux';
import createEventReporterMiddleware from './state/middleware/eventReporter';
import initializeCancerGovTheme from './custom_configs/cancerGov';
import createFetchMiddleware from './state/middleware/fetchMiddleware';
import metadataMiddleware from './state/middleware/metadata';
import cacheMiddleware from './state/middleware/cacheMiddleware';
import { Helmet } from 'react-helmet';
import Router from './Router';
import FatalErrorBoundary from './FatalErrorBoundary';
import NavigationHandler from './NavigationHandler';
import LiveRegion from './LiveRegion';
import { loadStateFromSessionStorage, saveStatetoSessionStorage } from './cache';
import { createTheme, ThemeProvider, Theme } from './theme';

// // TODO: Remove this block after CGOV custom theme development is complete
// if(process.env.NODE_ENV !== 'production') {
//     import('./cancergov_styles/nvcg.css');
//     import('./cancergov_styles/InnerPage.css');
// }

/**
 * @param {object} [config]
 * @param {string} [config.appId = 'DEFAULT_APP_ID'] the id used by the app for sessionStorage
 * @param {string} [config.rootId = 'r4r-root] the id of the dom node for the app to attach to
 * @param {object} [config.theme = {}] a hashmap where key = r4r default classname and custom classname to inject alongside it (or else default)
 * @returns {Node} The DOM node to which the app is hooked
 */
const initializeR4R = ({
    customTheme = {},
    appId = '@@/DEFAULT_APP_ID',
    useSessionStorage = true,
    rootId = 'r4r-root',
    historyProps = {},
    eventHandler,
    apiEndpoint = 'https://r4rapi-blue-dev.cancer.gov/v1',
} = {}) => {

    // 1) Set up theme
    if(typeof customTheme !== 'object' || customTheme === null) {
        throw new Error('customTheme must be an object')
    }
    const theme = createTheme(customTheme);

    // 2) Set up Redux (session storage caching in production only)
    let cachedState;
    if(process.env.NODE_ENV !== 'development' && useSessionStorage === true) {
        cachedState = loadStateFromSessionStorage(appId);
    }

    const history = createBrowserHistory(historyProps);

    const eventReporterMiddleware = createEventReporterMiddleware(eventHandler);
    const fetchMiddleware = createFetchMiddleware(apiEndpoint);
    const routerMiddleware = createRouterMiddleware(history);

    const reducers = {
        ...myReducers,
        router: routerReducer,
    }

    const store = createStore(
        combineReducers(reducers),
        cachedState,
        composeWithDevTools(applyMiddleware(
            metadataMiddleware,
            routerMiddleware,
            cacheMiddleware,
            fetchMiddleware,
            eventReporterMiddleware,
        ))
    );

    if(process.env.NODE_ENV !== 'development' && useSessionStorage === true) {
        const saveDesiredStateToSessionStorage = () => {
            const allState = store.getState();
            // No need to store ARIA-LIVE info or error to session storage
            const { announcements, error, ...state } = allState;
            saveStatetoSessionStorage({
                state,
                appId,
            });
        };
    
        store.subscribe(saveDesiredStateToSessionStorage);
    }
    
    store.dispatch({
        type: '@@event/APP_INITIALIZATION',
        meta: {
            location: window.location,
        }
    });

    // 3) Set up component tree
    const App = () => (
        <Provider store={ store }>
            <FatalErrorBoundary dispatch={ store.dispatch }>
                <ThemeProvider theme={ theme }>
                    <Theme element='main' className="r4r-container">
                            <Helmet 
                                defaultTitle="Resources for Researchers - National Cancer Institute"
                            >
                                <meta name="description" content="Resources for Researchers is a tool to give researchers a better understanding of the various tools available to them." />
                                <meta property="twitter:title" content="Resources for Researchers - National Cancer Institute" />
                            </Helmet>
                            <LiveRegion />
                            <NavigationHandler>
                                <Router history={ history }/>
                            </NavigationHandler>
                    </Theme>
                </ThemeProvider>
            </FatalErrorBoundary>
        </Provider>
    );
    
    const appRootDOMNode = document.getElementById(rootId);
    ReactDOM.render(<App />, appRootDOMNode);
    return appRootDOMNode;
}

export default initializeR4R;

// TODO: Remove this before release
// ######## INITIALIZE APP ############
// This is the line to change when you want custom settings to deploy this as a widget on
// other sites. (Or you call initializeR4R directly to get the generic app)
document.addEventListener('DOMContentLoaded', () => { initializeCancerGovTheme(initializeR4R) })

