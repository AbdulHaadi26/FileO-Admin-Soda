import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
import { fetchPlans } from '../../redux/actions/planActions';
const List = lazy(() => import('../../components/plans/list'));

const ListPage = ({ match, profile, isL, fetchPlans }) => {
    const { id, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12),
        [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        let data = { limit: 0, _id: _id };
        fetchPlans(data);
        setStarted(1);
    }, [_id, fetchPlans, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);

    const getList = () => {
        let data = { limit: 0, _id: _id };
        fetchPlans(data);
    };

    return <Container profile={profile} isSuc={!isL && started > 0} num={20}>
        <List org={id} _id={_id} string={string} limitMult={limitMult} limit={limit} tabNav={tabNav} isList={isList}
            setTN={setTN} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} setISL={setISL} getList={getList}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Plan.isL,
    }
}

export default connect(mapStateToProps, { fetchPlans })(ListPage);