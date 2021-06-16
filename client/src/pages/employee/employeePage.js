import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getEmployee } from '../../redux/actions/employeeActions';
import { getOrganizationS } from '../../redux/actions/organizationActions';
import Container from '../container';
const Details = lazy(() => import('../../components/employee/details'));

const EmployeePage = ({ match, profile, isErr, emp, isSucS, isSuc, setting, getOrganizationS, getEmployee, isSucO, Org }) => {
    const { _id, id } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        async function fetch() {
            let data = { _id: _id, org: id };
            await getEmployee(data);
            await getOrganizationS();
        }
        fetch();
    }, [getEmployee, getOrganizationS, _id, id]);

    return <Container profile={profile} isErr={isErr} isSuc={isSuc && isSucO} eT={'Employee Not Found'} num={4}>
        <Details Emp={emp} Org={Org} org={id} tabNav={tabNav} setTaN={setTN} setting={isSucS && setting && setting.setting ? setting.setting : ''} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Employee.isErr,
        isSuc: state.Employee.isSuc,
        emp: state.Employee.data,
        isSucS: state.setting.isSuc,
        setting: state.setting.data,
        isSucO: state.Organization.isSuc,
        Org: state.Organization.data
    }
}

export default connect(mapStateToProps, { getEmployee, getOrganizationS })(EmployeePage);