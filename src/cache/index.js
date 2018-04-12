// Returning undefined ensures Redux will load from initialState if sessionStorage isn't available
export const loadStateFromSessionStorage = (appId = 'DEFAULT_APP_ID') => {
    try {
        const serializedState = sessionStorage.getItem(appId);
        if(serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    }
    catch(err) {
        return undefined;
    }
}

export const saveStatetoSessionStorage = ({
    state,
    appId = 'DEFAULT_APP_ID',
}) => {
    try {
        const serializedState = JSON.stringify(state);
        sessionStorage.setItem(appId, serializedState)
    }
    catch(err) {
        console.log(err);
    }
}