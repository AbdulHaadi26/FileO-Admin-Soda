import React from 'react';
import DelC from '../../containers/deleteContainer';
const mT = { marginTop: '12px' };

const Modal = ({ onhandleModalDel, onHide }) => {

    return <DelC handleModalDel={onhandleModalDel} handleDelete={onHide}>
        <p style={mT}>Are you sure? All Projects will be unavailable however those projects will be available to work on once the user type is changed backed to manager. </p>
    </DelC>
}

export default (Modal);