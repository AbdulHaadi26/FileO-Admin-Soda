import React, { Component, lazy, Suspense, Fragment } from 'react';
const ErrorMain = lazy(() => import('../errorMain'));

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = { hE: false };
    }

    state = { hE: false };

    static getDerivedStateFromError(e) {
        console.log('Error', e); return { hE: true };
    }

    componentDidCatch(e, eI) { console.log('Details: ', eI); }

    render() { return this.state.hE ? <Suspense fallback={<Fragment />}> <ErrorMain /> </Suspense> : this.props.children; }
}