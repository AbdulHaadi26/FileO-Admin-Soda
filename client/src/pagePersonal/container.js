import React, { lazy, Suspense, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { setSN } from '../redux/actions/profileActions';
import { connect } from 'react-redux';
const Error = lazy(() => import('../components/error/errorText'));

const Cont = ({ profile, isErr, isSuc, eT, num, setSN, children }) => {
    useEffect(() => { setSN(num); }, [setSN, num]);
    return isErr ? <Suspense fallback={<></>}> <Error text={eT} profile={profile} /> </Suspense> : isSuc ? <Suspense fallback={<Loader />}> <div className="cM">{children}</div> </Suspense> : <Loader />
}

export default connect(null, { setSN })(Cont);