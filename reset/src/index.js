import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import ErrorBoundary from './components/error/errorBoundary';
import ResetForm from './pages/resetForm';
import Router from 'react-router-dom/Router';
import Switch from "react-router-dom/Switch";
import Route from 'react-router-dom/Route';
import Redirect from 'react-router-dom/Redirect';
import browserHistory from './utils/history';
import './bootstrap.css';
import './index.css';

ReactDOM.render(
    <ErrorBoundary>
        <Router history={browserHistory}>
            <Switch>
                <Route path='/reset/password/:token' component={ResetForm} />
                <Route render={() => <Redirect to='/reset/password/:token' />} />
            </Switch>
        </Router>
    </ErrorBoundary>
    , document.getElementById('root'));

serviceWorker.unregister();
