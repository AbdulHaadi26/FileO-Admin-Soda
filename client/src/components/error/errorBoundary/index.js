import React, { Component, lazy, Suspense } from 'react';
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

    render() { return this.state.hE ? <Suspense fallback={<></>}> <ErrorMain /> </Suspense> : this.props.children; }
}