import React, { useState, useEffect } from 'react';
import InputText from '../inputs/inputText';
import InputCode from '../inputs/inputCode';
import { updateProfile } from '../../redux/actions/profileActions';
import { updateOrganization } from '../../redux/actions/organizationActions';
import { updateEmpProfile } from '../../redux/actions/employeeActions';
import { updateRole } from '../../redux/actions/rolesAction';
import { updateCat } from '../../redux/actions/categoryActions';
import { updateFile } from '../../redux/actions/fileActions';
import { connect } from 'react-redux';
import './style.css';
const mT = { marginTop: '16px', marginBottom: '16px' };
const mB = { marginTop: '16px' };
const c = { color: 'grey' };
const eSE = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
function EditText({ refAct, updateProfile, updateOrganization, countryCode, catId, skip, updateEmpProfile, updateRole, updateCat, updateFile, val, handleModal, id, name, org, head, type, title, num, modal, notEdit }) {
    const [sM, setSM] = useState(false), [err, setE] = useState(false), [v, setV] = useState(''), [errE, setErrE] = useState(false), [errWS, setEWS] = useState(false);

    useEffect(() => { setV(val); setSM(modal); }, [val, modal]);

    // eslint-disable-next-line
    const reCE = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    // eslint-disable-next-line
    const reWS = /\s/g;
    const re = /^[0-9-\b]+$/;
    const rN = /^[a-zA-Z -]*$/;

    const onhandleInput = e => {
        (name === 'contact' || name === 'cnic') && (re.test(e.target.value) || e.target.value === '') && setV(e.target.value);
        name === 'name' && refAct === 'employee' && (rN.test(e.target.value) || e.target.value === '') && setV(e.target.value);
        (name !== 'contact' && name !== 'cnic' && !(refAct === 'employee' && name === 'name')) && setV(e.target.value);
        err && setE(false);
    }

    const showModal = async () => {
        modal && await handleModal(0);
        handleModal(num);
    }

    const hideModal = e => {
        setErrE(false); setEWS(false); setE(false);
        handleModal(0);
    }

    const handleUpdate = e => {
        var data = {};
        if (skip || (name === 'email' && refAct === 'organization' && v === '')) {
            setErrE(false); setEWS(false); setE(false); handleModal(0);
            data = { value: v, field: e.target.name, _id: id, org: org };
            chooseReference(data);
        } else if (v) {
            if (name === 'email') {
                if (!reCE.test(v)) setErrE(true);
                else if (reWS.test(v)) setEWS(true);
                else {
                    setErrE(false); setEWS(false); setE(false); handleModal(0);
                    data = { value: v, field: e.target.name, _id: id, org: org };
                    chooseReference(data);
                }
            } else {
                setErrE(false); setEWS(false); setE(false); handleModal(0);
                data = { value: v, field: e.target.name, _id: id, org: org };
                chooseReference(data);
            }
        } else setE(true);
    }

    const chooseReference = data => {
        switch (refAct) {
            case 'profile': updateProfile(data); break;
            case 'organization': updateOrganization(data); break;
            case 'employee': updateEmpProfile(data); break;
            case 'role': updateRole(data); break;
            case 'category':
                data.catId = catId
                updateCat(data);
                break;
            case 'file':
                data.catId = catId
                updateFile(data);
                break;
            default: break;
        }
    }

    const renderEdit = name => !notEdit ? <h6 className="link" name={name} onClick={e => showModal(e)}><div className="fa-edit" /></h6> : <h6 className="link" name={name} style={c}><div className="fa-edit-n" /></h6>

    return sM ? <div className="animated fadeIn faster">
        <div className="modal-content" style={mT}>
            <div className="modal-header">
                <h6 className="static">Update {head}</h6>
            </div>
            <div className="modal-body">
                {name !== 'contact' ? <InputText t={title} plh={`Enter ${head}`} tp={type} val={v} handleInput={onhandleInput} err={err} /> :
                    <InputCode t={title} plh={`Enter ${head}`} c={countryCode ? countryCode : '+92'} tp={type} val={v} handleInput={onhandleInput} err={err} />}
                {!err && errE && <div className="mr-auto" style={eSE}>Email address is incorrect </div>}
                {!err && !errE && errWS && <div className="mr-auto" style={eSE}>Email address contains white space </div>}
            </div>
            <div className="modal-footer" style={mB}>
                <button type="button" className="btn btn-danger" onClick={e => hideModal(e)} >Cancel</button>
                <button type="button" className="btn btn-primary" name={name} onClick={e => handleUpdate(e)}>Update</button>
            </div>
        </div>
    </div> : <div className="data">
            <h6 className="static mr-auto">{head}</h6>
            <h6 className="dyna">{val}</h6>
            {renderEdit(name)}
        </div>
}

export default connect(null, { updateProfile, updateOrganization, updateEmpProfile, updateRole, updateCat, updateFile })(EditText);