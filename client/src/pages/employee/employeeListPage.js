import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchEmp } from '../../redux/actions/employeeActions';
import Container from '../container';
const List = lazy(() => import('../../components/employee/list'));

const ListPage = ({ match, profile, fetchEmp, isL }) => {
    const { id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [offsetMult, setOFM] = useState(0), [limit, setL] = useState(12),
        [limitMult, setLM] = useState(0), [type, setT] = useState('Name'), [tabNav, setTN] = useState(0);

    useEffect(() => {
        const data = { offset: 0, limit: 0, _id: id, type: 'name' };
        fetchEmp(data);
        setStarted(1);
    }, [fetchEmp, id, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);
    const onhandleOFM = n => setOFM(n);
    const onhandleT = n => setT(n);

    return <Container profile={profile} isSuc={!isL && started > 0} num={4}> <List id={id} offsetMult={offsetMult} string={string} type={type} tabNav={tabNav} limitMult={limitMult} limit={limit}
        handleS={onhandleS} handleT={onhandleT} handleLM={onhandleLM} handleL={onhandleL} handleOFM={onhandleOFM} setTN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Employee.isL
    }
}

export default connect(mapStateToProps, { fetchEmp })(ListPage);