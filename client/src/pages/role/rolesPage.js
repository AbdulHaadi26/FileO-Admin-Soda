import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getRole } from '../../redux/actions/rolesAction';
import Container from '../container';
const Details = lazy(() => import('../../components/roles/details'));

const RolesPage = ({ getRole, profile, isErr, isSuc, role, match }) => {
    const [tabNav, setTN] = useState(0);
    const { _id, id } = match.params;

    useEffect(() => {
        let data = { _id: _id, org: id };
        getRole(data);
    }, [getRole, _id, id])

    return <Container profile={profile} isSuc={isSuc && role} isErr={isErr} eT={'Role Not Found'}> <Details Role={role} id={id} tabNav={tabNav} setTaN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Role.isErr,
        isSuc: state.Role.isSuc,
        role: state.Role.data
    }
}

export default connect(mapStateToProps, { getRole })(RolesPage);