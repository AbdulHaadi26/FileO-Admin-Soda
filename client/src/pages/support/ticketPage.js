import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getTicket, clear } from '../../redux/actions/ticketActions';
import Container from '../containerUpt';
const Details = lazy(() => import('../../components/support/details'));

const TicketPage = ({ match, getTicket, profile, isErr, isSuc, Ticket, isUpt, per, clear }) => {
    const { id, _id } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        getTicket(_id);
    }, [getTicket, _id])

    const Submit = () => {
        clear();
        getTicket(_id);
    };

    return <Container profile={profile} num={0} isSuc={!isUpt && isSuc && Ticket} isUpt={isUpt} percent={per} isErr={isErr} onSubmit={Submit} eT={'Ticket Not Found'}>
        <Details ticket={Ticket} id={id} tabNav={tabNav} setTN={setTN} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Ticket.isErr,
        isSuc: state.Ticket.isSuc,
        Ticket: state.Ticket.data,
        isUpt: state.File.isUpt,
        per: state.File.per,
    }
}

export default connect(mapStateToProps, { getTicket, clear })(TicketPage);