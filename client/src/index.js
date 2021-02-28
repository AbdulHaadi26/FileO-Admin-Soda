import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Router from 'react-router-dom/Router';
import browserHistory from './utils/history'
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './redux/reducers';
import thunk from 'redux-thunk';
import ErrorBoundary from './components/error/errorBoundary';
const reduxStore = createStore(rootReducer, applyMiddleware(thunk));

ReactDOM.render(
    <Provider store={reduxStore}>
        <ErrorBoundary>
            <Router history={browserHistory}>
                <App />
            </Router>
        </ErrorBoundary>
    </Provider>
    , document.getElementById('root'));

serviceWorker.register();
