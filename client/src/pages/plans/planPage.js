import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getPlan } from '../../redux/actions/planActions';
import Container from '../container';
const Details = lazy(() => import('../../components/plans/details'));

const PlanPage = ({ getPlan, profile, isErr, isSuc, plan, match, count }) => {
    const { id, _id, nId } = match.params, [tabNav, setTN] = useState(0), [started, setStarted] = useState(0);

    useEffect(() => {
        async function fetch() {
            await getPlan(nId);
            setStarted(1);
        };

        fetch();
    }, [getPlan, nId, setStarted]);

    const getList = () => {
        getPlan(nId);
    };

    return <Container profile={profile} isErr={isErr} isSuc={isSuc && plan && started > 0} eT={'Plan Not Found'} num={20}>
        <Details Plan={plan} count={count} org={id} profile={profile && profile.user} _id={_id} tabNav={tabNav} setTN={setTN} getListA={getList} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Plan.isErr,
        isSuc: state.Plan.isSuc,
        plan: state.Plan.data
    }
}

export default connect(mapStateToProps, { getPlan })(PlanPage);