import React, { useState, useEffect } from 'react';
import InputText from '../inputs/inputText';
import { updateRole } from '../../redux/actions/project_rolesAction';
import { connect } from 'react-redux';
import './style.css';
const eSE = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const mT = { marginTop: '16px', marginBottom: '16px' };
const mB = { marginTop: '16px' };
const c = { color: 'grey' };
const EditText = ({ val, handleModal, id, name, org, head, type, title, modal, pId, num, refAct, updateRole }) => {
    const [sM, setSM] = useState(false), [err, setE] = useState(false), [v, setV] = useState(''), [errE, setErrE] = useState(false), [errWS, setEWS] = useState(false);

    useEffect(() => { setV(val); setSM(modal); }, [modal, val]);

    const onhandleInput = e => { setV(e.target.value); setE(false); }

    const showModal = async e => {
        modal && await handleModal(0);
        handleModal(num);
    }

    const hideModal = e => {
        setErrE(false); setEWS(false); setE(false);
        handleModal(0);
    }

    const handleUpdate = e => {
        if (v) {
            setErrE(false); setEWS(false); setE(false);
            handleModal(0);
            var data = { value: v, field: e.target.name, _id: id, org: org, pId: pId };
            chooseReference(data);
        } else setE(true);
    }

    const chooseReference = data => {
        switch (refAct) {
            case 'role': updateRole(data); break;
            default: break;
        }
    }

    const renderEdit = name => name !== 'emp' && name !== 'role' ? <h6 className="link" name={name} onClick={e => showModal(e)}><div className="fa-edit" /></h6> : <h6 className="link" name={name} style={c}><div className="fa-edit" /></h6>

    return sM ? <div className="animated fadeIn faster">
        <div className="modal-content" style={mT}>
            <div className="modal-header">
                <h6 className="static">Update {head}</h6>
            </div>
            <div className="modal-body">
                <InputText title={title} name={'v'} placeholder={`Enter ${head}`} type={type} val={v} handleInput={onhandleInput} err={err} />
                {!err && errE && <div className="mr-auto" style={eSE}>Email address is incorrect </div>}
                {!err && !errE && errWS && <div className="mr-auto" style={eSE}>Email address contains white space </div>}
            </div>
            <div className="modal-footer" style={mB}>
                <button type="button" className="btn btn-danger" onClick={e => hideModal(e)} >Cancel</button>
                <button type="button" className="btn btn-primary" name={name} onClick={e => handleUpdate(e)}>Update</button>
            </div>
        </div>
    </div> :
        <div className="data">
            <h6 className="static mr-auto">{head}</h6>
            <h6 className="dyna">{val}</h6>
            {renderEdit(name)}
        </div>
}

export default connect(null, { updateRole })(EditText);