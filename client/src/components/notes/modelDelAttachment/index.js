import React from 'react';
import { connect } from 'react-redux';
import { deleteAttachment } from '../../../redux/actions/noteActions';
import DelC from '../../containers/deleteContainer';
const mT = { marginTop: '12px' };

const Modal = ({ deleteAttachment, _id, org, pId, onhandleModalDel }) => {

    const onhandleDelete = e => {
        e.preventDefault();
        onhandleModalDel(e, false);
    }

    return <DelC handleModalDel={onhandleModalDel} handleDelete={onhandleDelete}>
        <p style={mT}>Are you sure? </p>
    </DelC>
}

export default connect(null, { deleteAttachment })(Modal);