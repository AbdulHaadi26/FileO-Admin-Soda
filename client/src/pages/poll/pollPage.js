import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getPoll } from '../../redux/actions/pollActions';
import Container from '../container';
const Details = lazy(() => import('../../components/poll/details'));

const PollPage = ({ getPoll, profile, isErr, isSuc, poll, match  }) => {
    const { id, _id} = match.params, [tabNav, setTN] = useState(0), [started, setStarted] = useState(0);

    useEffect(() => {
        async function fetch() {
            await getPoll(_id);
            setStarted(1);
        };

        fetch();
    }, [getPoll, _id, setStarted]);

    return <Container profile={profile} isErr={isErr} isSuc={isSuc && poll && started > 0} eT={'Poll Not Found'} num={24}>
        <Details Poll={poll} org={id} profile={profile && profile.user} _id={_id} tabNav={tabNav} setTN={setTN}  />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Poll.isErr,
        isSuc: state.Poll.isSuc,
        poll: state.Poll.data
    }
};

export default connect(mapStateToProps, { getPoll })(PollPage);