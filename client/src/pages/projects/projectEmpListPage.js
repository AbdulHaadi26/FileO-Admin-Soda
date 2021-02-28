import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchEmp, getProjectDesc } from '../../redux/actions/projectActions';
import Container from '../container';
const List = lazy(() => import('../../components/project/userList'));

const ListPage = ({ match, profile, isL, isLP, getProjectDesc, fetchEmp }) => {
    const { id, _id } = match.params;
    const [started, setStarted] = useState(0), [offsetMult, setOFM] = useState(0), [limitMult, setLM] = useState(0), [limit, setL] = useState(12),
        [string, setS] = useState(''), [tabNav, setTN] = useState(0);

    useEffect(() => {
        const data = { offset: 0, limit: 0, _id: id, pId: _id };
        fetchEmp(data);
        getProjectDesc(_id);
        setStarted(1);
    }, [id, _id, fetchEmp, getProjectDesc, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);
    const onhandleOFM = n => setOFM(n);

    return <Container profile={profile} num={13} isSuc={!isL && !isLP && started > 0}>
        <List id={id} pId={_id} limit={limit} limitMult={limitMult} string={string} offsetMult={offsetMult} tabNav={tabNav}
            handleS={onhandleS} handleL={onhandleL} handleLM={onhandleLM} handleOFM={onhandleOFM} setTN={setTN} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Employee.isL,
        isLP: state.Project.isL
    }
}

export default connect(mapStateToProps, { fetchEmp, getProjectDesc })(ListPage);