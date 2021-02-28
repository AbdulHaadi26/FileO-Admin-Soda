import React from 'react';
import { connect } from 'react-redux';
import { deleteUser } from '../../../redux/actions/employeeActions';
import DelC from '../../containers/deleteContainer';
const mT = { marginTop: '12px' };

const Modal = ({ id, org, onhandleModalDel, deleteUser }) => {

    const onhandleModal = (e, val) => onhandleModalDel(e, val);

    const onhandleDelete = e => {
        e.preventDefault();
        onhandleModal(e, false);
        deleteUser(id, org);
    }

    return <DelC handleModalDel={onhandleModalDel} handleDelete={onhandleDelete}>
        <p style={mT}>Are you sure? </p>
    </DelC>
}

export default connect(null, { deleteUser })(Modal);