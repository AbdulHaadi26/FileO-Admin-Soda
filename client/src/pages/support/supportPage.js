import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchTicket } from '../../redux/actions/ticketActions';
import Container from '../container';
const Main = lazy(() => import('../../components/support/list'));

const SupportPage = ({ profile, isL, fetchTicket }) => {
    const [started, setStarted] = useState(0), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [string, setS] = useState(''), [tabNav, setTN] = useState(0);

    useEffect(() => {
        var data = { limit: 0 };
        fetchTicket(data);
        setStarted(1);
    }, [fetchTicket, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);

    return <Container profile={profile} num={0} isSuc={!isL && started > 0}> <Main profile={profile.user} string={string} limitMult={limitMult} limit={limit} tabNav={tabNav}
        setTN={setTN} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Ticket.isL
    }
}

export default connect(mapStateToProps, { fetchTicket })(SupportPage);