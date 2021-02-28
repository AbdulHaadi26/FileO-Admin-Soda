import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchEmp, getEmployee } from '../../redux/actions/employeeDTActions';
import Container from '../container';
const List = lazy(() => import('../../components/employee/listDTM'));

const ListPage = ({ match, profile, fetchEmp, isL, isErr, emp, getEmployee }) => {
    const { id, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [offsetMult, setOFM] = useState(0), [limit, setL] = useState(12),
     [limitMult, setLM] = useState(0), [sEmp, setEmp] = useState(''), [type, setT] = useState('Name'), [tabNav, setTN] = useState(0);

    useEffect(() => {
        const data = { offset: 0, limit: 0, _id: id, skipId: _id, type: 'name' };
        const data2 = { _id: _id, org: id };
        getEmployee(data2);
        fetchEmp(data);
        setStarted(1);
    }, [fetchEmp, id, _id, setStarted, getEmployee]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);
    const onhandleOFM = n => setOFM(n);
    const onhandleEmp = emp => setEmp(emp);
    const onhandleT = n => setT(n)

    return <Container profile={profile} isErr={isErr && started > 0} isSuc={!isL && emp && emp.user && started > 0} eT={'Employee Not Found'} num={10}> 
    {emp && emp.user && <List id={id} _id={_id} sEmp={sEmp} handleEmp={onhandleEmp} emp={emp.user} offsetMult={offsetMult} string={string} type={type} limitMult={limitMult} limit={limit}
    tabNav={tabNav} setTN={setTN} handleT={onhandleT} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} handleOFM={onhandleOFM} />}</Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Employee.isL,
        isErr: state.Employee.isErr,
        emp: state.Employee.data
    }
}

export default connect(mapStateToProps, { fetchEmp, getEmployee })(ListPage);