import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import browserHistory from './utils/history'
import ErrorBoundary from './components/error/errorBoundary';
import './index.css';
import './bootstrap.css';

const ViewFile = lazy(() => import('./pages/viewFilePage'));
const ViewFilesPage = lazy(() => import('./pages/viewFilesPage'));
const CreateFilePage = lazy(() => import('./pages/createFilePage'));

ReactDOM.render(
    <ErrorBoundary>
        <BrowserRouter history={browserHistory}>
            <Switch>
                <Suspense fallback={<></>}>
                    <Route path={'/shared/file/:_id'} component={ViewFile} />
                    <Route path={'/shared/category/:_id'} component={ViewFilesPage} />
                    <Route path={'/client/:postedby/category/:category/file/upload'} component={CreateFilePage} />
                    <Route path={'/client/:postedby/file/upload'} component={CreateFilePage} />
                </Suspense>
            </Switch>
        </BrowserRouter>
    </ErrorBoundary>
    , document.getElementById('root'));

serviceWorker.register();
