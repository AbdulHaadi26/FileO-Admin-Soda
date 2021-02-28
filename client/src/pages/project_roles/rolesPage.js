import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getRole } from '../../redux/actions/project_rolesAction';
import Container from '../container';
const Details = lazy(() => import('../../components/project_roles/details'));

const RolesPage = ({ match, getRole, profile, isErr, isSuc, role }) => {
    const { _id, pId, id } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        let data = { _id: _id, pId: pId };
        getRole(data);
    }, [getRole, _id, pId])

    return <Container profile={profile} num={13} isErr={isErr} isSuc={isSuc && role} eT={'Project Role Not Found'}> <Details Role={role} id={id} tabNav={tabNav} setTaN={setTN} /> </Container>
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