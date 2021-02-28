import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchRoles } from '../../redux/actions/project_rolesAction';
import Container from '../container';
const List = lazy(() => import('../../components/project_roles/list'));

const ListPage = ({ match, profile, isL, fetchRoles }) => {
    const { id, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [tabNav, setTN] = useState(0);

    useEffect(() => {
        let data = { limit: 0, _id: _id };
        fetchRoles(data);
        setStarted(1);
    }, [_id, fetchRoles, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);

    return <Container profile={profile} num={13} isSuc={!isL && started > 0}>
        <List id={id} pId={_id} limit={limit} limitMult={limitMult} string={string} tabNav={tabNav} setTN={setTN} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Role.isL,
    }
}

export default connect(mapStateToProps, { fetchRoles })(ListPage);