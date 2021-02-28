import React, { useState, useEffect } from 'react';
import InputTextArea from '../inputs/inputTextArea';
import { updateTicket } from '../../redux/actions/ticketActions';
import { connect } from 'react-redux';
import './style.css';
const mT = { marginTop: '16px', marginBottom: '16px' };
const mB = { marginTop: '16px' };
function TextArea(props) {
    const { modal, val, id, head, name, title, handleModal, num } = props;
    const [sM, setSM] = useState(false), [err, setE] = useState(false), [v, setV] = useState(val);

    useEffect(() => {
        setV(props.val); setSM(props.modal);
    }, [props]);

    function onhandleInput(e) { setE(false); setV(e.target.value); }

    async function showModal(e) {
        modal && await handleModal(0);
        handleModal(num);
    }

    function hideModal(e) { setE(false); handleModal(0); }

    function handleUpdate(e) {
        if (v) {
            setE(false);
            handleModal(0);
            var data = { value: v, field: e.target.name, _id: id };
            chooseReference(data);
        } else setE(true);
    }

    function chooseReference(data) {
        const { refAct, updateTicket } = props;
        switch (refAct) {
            case 'ticket': updateTicket(data); break;
            default: break;
        }
    }

    return sM ? <div className="animated fadeIn faster">
        <div className="modal-content" style={mT}>
            <div className="modal-header">
                <h6 className="static">Update {head}</h6>
            </div>
            <div className="modal-body">
                <InputTextArea title={title} name={'value'} val={v} placeholder={`Enter ${name}`} handleInput={onhandleInput} err={err} />
            </div>
            <div className="modal-footer" style={mB}>
                <button type="button" className="btn btn-danger" onClick={e => hideModal(e)}>Cancel</button>
                <button type="button" className="btn btn-primary" name={name} onClick={e => handleUpdate(e)}>Update</button>
            </div>
        </div>
    </div> : <div className="data">
            <h6 className="static mr-auto">{head}</h6>
            <h6 className="dyna">{val}</h6>
            <h6 className="link" name={name} onClick={e => showModal(e)}><div className="fa-edit" /></h6>
        </div>
}

export default connect(null, { updateTicket })(TextArea);