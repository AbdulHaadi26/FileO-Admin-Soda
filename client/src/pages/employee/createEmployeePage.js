import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchEmpC } from '../../redux/actions/employeeActions';
import Container from '../container';
const Main = lazy(() => import('../../components/employee/main'));

const CreatePage = ({ profile, isL, fetchEmpC, match }) => {
    const [tabNav, setTN] = useState(0);
    const { id } = match.params;

    useEffect(() => {
        let data = { _id: id };
        fetchEmpC(data);
    }, [id, fetchEmpC]);

    return <Container profile={profile} isSuc={!isL} num={4}> <Main id={id} tabNav={tabNav} setTN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Employee.isL,
    }
}

export default connect(mapStateToProps, { fetchEmpC })(CreatePage);