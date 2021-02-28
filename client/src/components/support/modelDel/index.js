import React from 'react';
import { connect } from 'react-redux';
import { deleteTicket } from '../../../redux/actions/ticketActions';
import DelC from '../../containers/deleteContainer';

const mT = { marginTop: '12px' };
function Modal(props) {
    const { deleteTicket, id, org, onhandleModalDel } = props;

    function onhandleDelete(e) {
        e.preventDefault();
        onhandleModalDel(e, false);
        deleteTicket(id, org);
    }

    return <DelC handleModalDel={onhandleModalDel} handleDelete={onhandleDelete}>
        <p style={mT}>Are you sure? </p>
    </DelC>
}

export default connect(null, { deleteTicket })(Modal);