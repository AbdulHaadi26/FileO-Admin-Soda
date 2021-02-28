import React, { lazy, useState } from 'react';
import { connect } from 'react-redux';
import { clearFile } from '../../redux/actions/ticketActions';
import Container from '../containerUpt';
const Main = lazy(() => import('../../components/support/main'));

const SupportPage = ({ profile, isL, isUpt, per, match, clearFile }) => {
    const { id } = match.params, [tabNav, setTN] = useState(0);
    const Submit = () => clearFile(id);

    return <Container profile={profile} num={0} isSuc={!isUpt && !isL} percent={per} isUpt={isUpt} onSubmit={Submit}> <Main User={profile.user} tabNav={tabNav} setTN={setTN} org={id} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Ticket.isL,
        isUpt: state.File.isUpt,
        per: state.File.per,
    }
}

export default connect(mapStateToProps, { clearFile })(SupportPage);