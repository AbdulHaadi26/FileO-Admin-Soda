import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchRoles } from '../../redux/actions/rolesAction';
import Container from '../container';
const List = lazy(() => import('../../components/roles/list'));

const ListPage = ({ profile, isL, fetchRoles, match }) => {
    const { id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [tabNav, setTN] = useState(0);

    useEffect(() => {
        var data = { limit: 0, _id: id };
        fetchRoles(data);
        setStarted(1);
    }, [fetchRoles, id, setStarted]);

    const onhandleS = s => setS(s);
    const onhandleLM = n => setLM(n);
    const onhandleL = n => setL(n);

    return <Container profile={profile} isSuc={!isL && started > 0} num={5}> <List id={id} limitMult={limitMult} limit={limit} string={string} tabNav={tabNav}
        setTN={setTN} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Role.isL
    }
}

export default connect(mapStateToProps, { fetchRoles })(ListPage);