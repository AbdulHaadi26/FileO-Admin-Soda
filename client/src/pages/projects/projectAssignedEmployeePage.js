import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getAssignedEmployee } from '../../redux/actions/projectActions';
import Container from '../container';
const Details = lazy(() => import('../../components/project/editAUsers'));

const EmployeePage = ({ match, profile, isErr, emp, isSuc, getAssignedEmployee }) => {
    const { _id, id, pId } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        var data = { _id: _id, pId: pId };
        getAssignedEmployee(data);
    }, [getAssignedEmployee, _id, pId]);

    return <Container profile={profile} num={13} iserr={isErr} isSuc={isSuc && emp} eT={'Assigned Employee Not Found'}>
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

export default connect(mapStateToProps, { getAssignedEmployee })(EmployeePage);