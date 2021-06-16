import React, { lazy } from 'react';
import '../index.css';
import '../bootstrap.css';
import { Redirect, Route, Switch } from 'react-router';
const HomePage = lazy(() => import('../pagesFile-O/home'));
const LoginPage = lazy(() => import('../pages/loginPage'));
const PricingPage = lazy(() => import('../pagesFile-O/pricing'));
const TrailPage = lazy(() => import('../pagesFile-O/freeTrails'));
const RegisterPage = lazy(() => import('../pagesFile-O/register'));
const FreeP = lazy(() => import('../pagesFile-O/freeTrailsP'));
const ContactPage = lazy(() => import('../pagesFile-O/contact'));
const PrivacyPage = lazy(() => import('../pagesFile-O/privacy'));
const ErrorMain = lazy(() => import('../components/error/errorMain'));
const EmailVerification = lazy(() => import('../components/emailVerification'));
const EmailReset = lazy(() => import('../components/emailReset'));
const RegisterPageP = lazy(() => import('../pagesFile-O/registerP'));


export const RenderPR = () => <Switch>
    <Route exact path='/home' component={HomePage} />
    <Route exact path='/login' component={LoginPage} />
    <Route exact path='/contact' component={ContactPage} />
    <Route exact path='/pricing' component={PricingPage} />
    <Route exact path='/pricing/redirect/:num' component={PricingPage} />
    <Route exact path='/free-trial' component={TrailPage} />
    <Route exact path='/personal/free-trial' component={FreeP} />
    <Route exact path='/personal/register' component={RegisterPageP} />
    <Route exact path='/free-trial/:email' component={TrailPage} />
    <Route exact path='/register' component={RegisterPage} />
    <Route exact path='/privacy-policy' component={PrivacyPage} />
    <Route exact path='/reset/password' component={EmailReset} />
    <Route render={() => <Redirect to='/home' />} />
</Switch>


export const RenderErr = () => <Switch>
    <Route exact path='/error' component={ErrorMain} />
    <Route render={() => <Redirect to='/error' />} />
</Switch>


export const RenderEV = () => <Switch>
    <Route exact path='/emailverification' component={EmailVerification} />
    <Route render={() => <Redirect to='/emailverification' />} />
</Switch>


//    <Route exact path='/personal/register' component={RegisterPageP} />
 //   <Route exact path='/personal/free-trial' component={FreeP} />
