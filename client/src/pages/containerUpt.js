import React, { lazy, Suspense, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { connect } from 'react-redux';
import { setSN } from '../redux/actions/profileActions';
const ProgressBar = lazy(() => import('../components/loader/fileLoader'));
const ProgressBarM = lazy(() => import('../components/loader/mfileLoader'));

const Cont = ({ isSuc, isUpt, percent, onSubmit, num, setSN, children, isM, fileList }) => {
    useEffect(() => { setSN(num); }, [setSN, num]);
    return isUpt && percent ? <Suspense fallback={<></>}> {isM ? <ProgressBarM onFinish={onSubmit} fileList={fileList} /> : <ProgressBar percent={!percent ? 0 : percent} onFinish={onSubmit} />} </Suspense> : isSuc ? <Suspense fallback={<Loader />}> <div className="cM">{children}</div> </Suspense> : <Loader />
}

export default connect(null, { setSN })(Cont);