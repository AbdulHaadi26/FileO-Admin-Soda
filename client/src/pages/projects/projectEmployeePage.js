import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getEmployee } from '../../redux/actions/projectActions';
import Container from '../container';
const Details = lazy(() => import('../../components/project/assignUsers'));

const EmployeePage = ({ match, profile, isErr, emp, isSuc, getEmployee }) => {
    const { _id, id, pId } = match.params , [tabNav, setTN] = useState(0);

    useEffect(() => {
        let data = { _id: _id, pId: pId };
        getEmployee(data);
    }, [getEmployee, _id, pId]);

    return <Container profile={profile} num={13} isErr={isErr} isSuc={isSuc && emp} eT={'Project Employee Not Found'}>
        <Details Emp={emp} id={id} pId={pId} tabNav={tabNav} setTaN={setTN} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Employee.isErr,
        isSuc: state.Employee.isSuc,
        emp: state.Employee.data,
    }
}

export default connect(mapStateToProps, { getEmployee })(EmployeePage);