import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchEmpC, getRolesSelect } from '../../redux/actions/employeeActions';
import Container from '../container';
const Main = lazy(() => import('../../components/employee/main'));

const CreatePage = ({ profile, isL, isLS, getRolesSelect, fetchEmpC, isSuc, match }) => {
    const [tabNav, setTN] = useState(0);
    const { id } = match.params;

    useEffect(() => {
        let data = { _id: id };
        fetchEmpC(data);
        getRolesSelect(id);
    }, [id, getRolesSelect, fetchEmpC]);

    return <Container profile={profile} isSuc={!isL && !isLS && isSuc} num={4}> <Main id={id} tabNav={tabNav} setTN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Employee.isL,
        isLS: state.Role.isL,
        isSuc: state.Role.isSuc
    }
}

export default connect(mapStateToProps, { getRolesSelect, fetchEmpC })(CreatePage);