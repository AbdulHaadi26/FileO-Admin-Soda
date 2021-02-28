import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getCatSelect } from '../../redux/actions/rolesAction';
import Container from '../container';
const Main = lazy(() => import('../../components/roles/main'));

const RolesPage = ({ match, profile, getCatSelect, isL, isLS, isSucS }) => {
    const [tabNav, setTN] = useState(0);
    const { id } = match.params;
    useEffect(() => { getCatSelect(id); }, [getCatSelect, id])

    return <Container profile={profile} isSuc={!isL && !isLS && isSucS} num={5}> <Main id={id} tabNav={tabNav} setTN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Role.isL,
        isLS: state.Category.isL,
        isSucS: state.Category.isSuc,
    }
}

export default connect(mapStateToProps, { getCatSelect })(RolesPage);