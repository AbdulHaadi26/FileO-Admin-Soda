import React, { lazy } from 'react';
import Switch from "react-router-dom/Switch";
import Route from 'react-router-dom/Route';
import Redirect from 'react-router-dom/Redirect'
import '../bootstrap.css';
import LoginPage from '../pages/loginPage';
const ErrorMain = lazy(() => import('../components/error/errorMain'));
const EmailVerification = lazy(() => import('../components/emailVerification'));
const EmailReset = lazy(() => import('../components/emailReset'));

export const RenderPR = () => <Switch>
    <Route exact path='/login' component={LoginPage} />
    <Route exact path='/reset/password' component={EmailReset} />
    <Route render={() => <Redirect to='/login' />} />
</Switch>


export const RenderErr = () => <Switch>
    <Route exact path='/error' component={ErrorMain} />
    <Route render={() => <Redirect to='/error' />} />
</Switch>


export const RenderEV = () => <Switch>
    <Route exact path='/emailverification' component={EmailVerification} />
    <Route render={() => <Redirect to='/emailverification' />} />
</Switch>


