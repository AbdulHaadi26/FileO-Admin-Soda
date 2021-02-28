import React from 'react';
import { connect } from 'react-redux';
import { deleteRole } from '../../../redux/actions/rolesAction';
import DelC from '.././../containers/deleteContainer';
const mT = { marginTop: '12px' };

const Modal = ({ deleteRole, id, org, onhandleModalDel }) => {
    const onhandleModal = (e, val) => onhandleModalDel(e, val);

    const onhandleDelete = e => {
        e.preventDefault();
        onhandleModal(e, false);
        deleteRole(id, org);
    }

    return <DelC handleModalDel={onhandleModalDel} handleDelete={onhandleDelete}>
        <p style={mT}>Are you sure? </p>
    </DelC>
}

export default connect(null, { deleteRole })(Modal);