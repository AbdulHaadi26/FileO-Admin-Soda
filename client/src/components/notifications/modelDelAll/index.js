import React from 'react';
import { connect } from 'react-redux';
import { deleteAllNotification } from '../../../redux/actions/notifActions';
import DelC from '../../containers/deleteContainer';
const mT = { marginTop: '12px' };
const Modal = ({ deleteAllNotification, org, onhandleModalDel }) => {

    const onhandleModal = (e, val) => onhandleModalDel(e, val);

    const onhandleDelete = e => {
        e.preventDefault();
        onhandleModal(e, false);
        deleteAllNotification(org);
    }

    return <DelC handleModalDel={onhandleModalDel} handleDelete={onhandleDelete}>
        <p style={mT}>Are you sure? </p>
    </DelC>
}

export default connect(null, { deleteAllNotification })(Modal);