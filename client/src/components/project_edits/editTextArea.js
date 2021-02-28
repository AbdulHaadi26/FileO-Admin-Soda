import React, { useEffect, useState } from 'react';
import InputTextArea from '../inputs/inputTextArea';
import { updateProfile } from '../../redux/actions/profileActions';
import { updateOrganization } from '../../redux/actions/organizationActions';
import { updateRole } from '../../redux/actions/project_rolesAction';
import { connect } from 'react-redux';
import './style.css';
import { updateCat } from '../../redux/actions/project_categoryActions';
const mT = { marginTop: '16px', marginBottom: '16px' };
const mB = { marginTop: '16px' };
const TextArea = ({ modal, val, id, head, name, title, handleModal, num, pId, skip, refAct, updateProfile, updateCat, updateOrganization, updateRole }) => {
    const [sM, setSM] = useState(false), [err, setE] = useState(false), [value, setV] = useState(val);

    useEffect(() => { setV(val); setSM(modal); }, [val, modal]);

    const onhandleInput = e => { err && setE(false); setV(e.target.value); }

    async function showModal(e) {
        modal && await handleModal(0);
        handleModal(num);
    }

    const hideModal = e => {
        setE(false);
        handleModal(0);
    }

    const handleUpdate = e => {
        if (value || skip) {
            setE(false);
            handleModal(0);
            var data = { value: value, field: e.target.name, _id: id, pId: pId };
            chooseReference(data);
        } else setE(true);
    }

    const chooseReference = data => {
        switch (refAct) {
            case 'profile': updateProfile(data); break;
            case 'organization': updateOrganization(data); break;
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
                <InputTextArea te={title} val={value} plh={`Enter ${name}`} handleInput={onhandleInput} err={err} />
            </div>
            <div className="modal-footer" style={mB}>
                <button type="button" className="btn btn-danger" onClick={e => hideModal(e)} >Cancel</button>
                <button type="button" className="btn btn-primary" name={name} onClick={e => handleUpdate(e)}>Update</button>
            </div>
        </div>
    </div> : <div className="data">
            <h6 className="static mr-auto">{head}</h6>
            <h6 className="dyna">{val}</h6>
            <h6 className="link" name={name} onClick={e => showModal(e)}> <div className="fa-edit" /> </h6>
        </div>
}

export default connect(null, { updateProfile, updateOrganization, updateCat, updateRole })(TextArea);