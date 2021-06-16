import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchEmp } from '../../redux/actions/employeeDTActions';
import Container from '../container';
const List = lazy(() => import('../../components/employee/listDT'));

const ListPage = ({ match, profile, fetchEmp, isL }) => {
    const { id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [offsetMult, setOFM] = useState(0), [limit, setL] = useState(12),
        [tabNav, setTN] = useState(0), [limitMult, setLM] = useState(0), [type, setT] = useState('Name');

    useEffect(() => {
        async function fetch() {
            let data = { offset: 0, limit: 0, _id: id, type: 'name' };
            await fetchEmp(data);
            setStarted(1);
        }

        fetch();
    }, [fetchEmp, id, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);
    const onhandleOFM = n => setOFM(n);
    const onhandleT = n => setT(n)

    return <Container profile={profile} isSuc={!isL && started > 0} num={10}> <List id={id} offsetMult={offsetMult} string={string} type={type} limitMult={limitMult} limit={limit}
        tabNav={tabNav} setTN={setTN} handleT={onhandleT} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} handleOFM={onhandleOFM} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Employee.isL
    }
}

export default connect(mapStateToProps, { fetchEmp })(ListPage);