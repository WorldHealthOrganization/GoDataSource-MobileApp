import {useState, useRef, useEffect, useCallback} from 'react';

export const useSetStateWithCallback = (initialState) => {
    const [state, _setState] = useState(initialState);
    // const isFirstTime = useRef(true);
    const callbackRef = useRef();
    const isFirstCallbackCall = useRef(true);

    // This makes sure that this will not run the first time
    const setState = useCallback((setStateAction, callback) => {
        if (callback) {
            callbackRef.current = callback;
        } else {
            callbackRef.current = null;
        }
        _setState(setStateAction);
    }, []);

    useEffect(() => {
        if (isFirstCallbackCall.current) {
            isFirstCallbackCall.current = false;
            return;
        }
        if (callbackRef.current) {
            callbackRef.current(state);
        }
    }, [state]);

    return [state, setState];
};