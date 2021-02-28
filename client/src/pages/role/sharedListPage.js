import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchAssigned, fetchEmp } from '../../redux/actions/sharedFilesAction';
import Container from '../container';
const List = lazy(() => import('../../components/shared/list'));

const ListPage = ({ match, profile, isL, fetchAssigned, fetchEmp }) => {
    const { id, uId, fId } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [limitMult2, setLM2] = useState(0),
        [limit2, setL2] = useState(12), [string2, setS2] = useState(''), [tabNav, setTN] = useState(0);

    useEffect(() => {
        var data = { limit: 0, fId: fId, offset: 0, _id: id };
        var data2 = { limit: 0, _id: fId };
        fetchEmp(data);
        fetchAssigned(data2);
        setStarted(1);
    }, [id, fId, fetchEmp, fetchAssigned, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);
    const onhandleL2 = n => setL2(n);
    const onhandleLM2 = n => setLM2(n);
    const onhandleS2 = s => setS2(s);

    return <Container profile={profile} num={14} isSuc={!isL && started > 0}>
        <List id={id} _id={uId} fId={fId} limit={limit} limitMult={limitMult} string={string} limit2={limit2} limitMult2={limitMult2} string2={string2} tabNav={tabNav}
            handleL={onhandleL} handleLM={onhandleLM} handleS={onhandleS} handleL2={onhandleL2} handleLM2={onhandleLM2} handleS2={onhandleS2} setTN={setTN} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Employee.isL
    }
}

export default connect(mapStateToProps, { fetchAssigned, fetchEmp })(ListPage);