import React, { lazy, Suspense, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { connect } from 'react-redux';
import { setSN } from '../redux/actions/profileActions';
const ProgressBar = lazy(() => import('../components/loader/mfileLoader'));

const Cont = ({ children, isSuc, isUpt, onSubmit, num, setSN, fileList }) => {
    useEffect(() => { setSN(num); }, [setSN, num]);
    return isUpt ? <Suspense fallback={<></>}> <ProgressBar onFinish={onSubmit} fileList={fileList} />  </Suspense> : isSuc ? <Suspense fallback={<Loader />}> <div className="cM">{children}</div> </Suspense> : <Loader />
};

export default connect(null, { setSN })(Cont);