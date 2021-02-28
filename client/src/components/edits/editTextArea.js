import React, { useState, useEffect } from 'react';
import InputTextArea from '../inputs/inputTextArea';
import { updateProfile } from '../../redux/actions/profileActions';
import { updateOrganization } from '../../redux/actions/organizationActions';
import { updateFile } from '../../redux/actions/fileActions';
import { updateRole } from '../../redux/actions/rolesAction';
import { connect } from 'react-redux';
import './style.css';
import { updateCat } from '../../redux/actions/categoryActions';
const mT = { marginTop: '16px', marginBottom: '16px' };
const mB = { marginTop: '16px' };
const TextArea = ({ modal, val, id, head, refAct, updateProfile, updateOrganization, updateFile, updateCat, updateRole, name, title, handleModal, num, skip }) => {
    const [sM, setSM] = useState(false), [err, setE] = useState(false), [v, setV] = useState(val);

    useEffect(() => { setV(val); setSM(modal); }, [val, modal]);

    const onhandleInput = e => { setE(false); setV(e.target.value); }

    const showModal = async e => {
        modal && await handleModal(0);
        handleModal(num);
    }

    const hideModal = e => {
        setE(false);
        handleModal(0);
    }

    const handleUpdate = e => {
        var data = {};
        if (skip) {
            setE(false); handleModal(0);
            data = { value: v, field: e.target.name, _id: id };
            chooseReference(data);
        }
        else if (v) {
            setE(false); handleModal(0);
            data = { value: v, field: e.target.name, _id: id };
            chooseReference(data);
        } else setE(true);
    }

    const chooseReference = data => {
        switch (refAct) {
            case 'profile': updateProfile(data); break;
            case 'organization': updateOrganization(data); break;
            case 'file': updateFile(data); break;
            case 'role': updateRole(data); break;
            case 'category': updateCat(data); break;
            default: break;
        }
    }

    return sM ? <div className="animated fadeIn faster">
        <div className="modal-content" style={mT}>
            <div className="modal-header">
                <h6 className="static">Update {head}</h6>
            </div>
            <div className="modal-body">
                <InputTextArea t={title} val={v} plh={`Enter ${name}`} handleInput={onhandleInput} err={err} />
            </div>
            <div className="modal-footer" style={mB}>
                <button type="button" className="btn btn-danger" onClick={e => hideModal(e)} >Cancel</button>
                <button type="button" className="btn btn-primary" name={name} onClick={e => handleUpdate(e)}>Update</button>
            </div>
        </div>
    </div> : <div className="data">
            <h6 className="static mr-auto">{head}</h6>
            <h6 className="dyna">{val}</h6>
            <h6 className="link" name={name} onClick={e => showModal(e)}><div className="fa-edit" /></h6>
        </div>
}

export default connect(null, { updateProfile, updateOrganization, updateFile, updateRole, updateCat })(TextArea);