import React from 'react';
import { connect } from 'react-redux';
import { removeAttachment } from '../../../redux/actions/ticketActions';
import DelC from '../../containers/deleteContainer';

const mT = { marginTop: '12px' };
const Modal = ({ removeAttachment, id, onhandleModalDel }) => {
    const onhandleDelete = e => {
        e.preventDefault();
        onhandleModalDel(e, false);
        let data = { _id: id };
        removeAttachment(data);
    }

    return <DelC handleModalDel={onhandleModalDel} handleDelete={onhandleDelete}>
        <p style={mT}>Are you sure? </p>
    </DelC>
}

export default connect(null, { removeAttachment })(Modal);