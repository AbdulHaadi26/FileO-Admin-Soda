import React from 'react';
import DelC from '../../containers/deleteContainer';
const mT = { marginTop: '12px' };

const Modal = ({ onhandleModalDel, onYes }) => {

    return <DelC handleModalDel={onhandleModalDel} handleDelete={onYes}>
        <p style={mT}>Are you sure? This role will be attached to all the employees of the organization. </p>
    </DelC>
}

export default (Modal);