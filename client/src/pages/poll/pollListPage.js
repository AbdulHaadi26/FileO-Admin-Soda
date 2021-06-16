import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
import { fetchPolls } from '../../redux/actions/pollActions';
const List = lazy(() => import('../../components/poll/list'));

const ListPage = ({ match, profile, isL, fetchPolls }) => {
    const { id, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [tabNav, setTN] = useState(0);

    useEffect(() => {

        async function fetch() {

            setStarted(1);
            await fetchPolls({
                auth: profile && profile.user && profile.user.userType === 2
            })
        };

        fetch();
    }, [_id, fetchPolls, setStarted, profile]);

    const onhandleS = s => setS(s);


    return <Container profile={profile} isSuc={!isL && started > 0} num={24}>
        <List org={id} _id={_id} string={string} tabNav={tabNav} profile={profile && profile.user}
            setTN={setTN} handleS={onhandleS} auth={profile && profile.user && profile.user.userType === 2}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Poll.isL,
    }
};

export default connect(mapStateToProps, { fetchPolls })(ListPage);