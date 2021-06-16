import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
import { fetchPlans } from '../../redux/actions/planActions';
import { getPlanAll } from '../../redux/actions/dailyPlanActions';
const List = lazy(() => import('../../components/plans/list'));

const ListPage = ({ match, profile, isL, fetchPlans, getPlanAll }) => {
    const { id, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12),
        [tabNav, setTN] = useState(0), [isList, setISL] = useState(false), [due, setDue] = useState('Due'), [type, setType] = useState('Name');

    useEffect(() => {

        async function fetch() {
            let data = {
                limit: 0, _id: _id,
                type: 'Name', due: 'Due'
            };
    
            let today = new Date(Date.now());
    
            let month = today.getMonth();
            let year = today.getFullYear();
    
            await fetchPlans(data);
            getPlanAll({ month, year });
            setStarted(1);
        };

        fetch();
    }, [_id, fetchPlans, getPlanAll, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);


    return <Container profile={profile} isSuc={!isL && started > 0} num={20}>
        <List org={id} _id={_id} string={string} limitMult={limitMult} limit={limit} tabNav={tabNav} isList={isList}
            setTN={setTN} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} setISL={setISL}
            type={type} due={due} handleType={setType} handleDue={setDue} disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Plan.isL,
    }
};

export default connect(mapStateToProps, { fetchPlans, getPlanAll })(ListPage);