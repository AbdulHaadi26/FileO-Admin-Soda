import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getCatSelect } from '../../redux/actions/project_rolesAction';
import Container from '../container';
const Main = lazy(() => import('../../components/project_roles/main'));

const ResponsibilitesPage = ({ match, profile, getCatSelect, isL, isLS, isSucS }) => {
    const { id, _id } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => { 
        getCatSelect(_id);
    }, [_id, getCatSelect]);

    return <Container profile={profile} num={13} isSuc={!isL && !isLS && isSucS}> <Main id={id} pId={_id} tabNav={tabNav} setTN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Role.isL,
        isLS: state.Category.isL,
        isSucS: state.Category.isSuc,
    }
}

export default connect(mapStateToProps, { getCatSelect })(ResponsibilitesPage);