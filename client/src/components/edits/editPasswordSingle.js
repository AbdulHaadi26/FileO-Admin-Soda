import React, { useState, useEffect } from 'react';
import InputPassword from '../inputs/inputPass';
import { updateEmpProfile } from '../../redux/actions/employeeActions';
import { updateProfile } from '../../redux/actions/profileActions';
import { connect } from 'react-redux';
import './style.css';
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const mT = { marginTop: '16px', marginBottom: '16px' };
const mB = { marginTop: '16px' };
const EditPass = ({ modal, handleModal, updateEmpProfile, updateProfile, id, org, name, head, val, num, refAct }) => {
    const [sM, setSM] = useState(false), [err_n, setEN] = useState(false), [n_p, setEP] = useState(''), [c_p, setCP] = useState(''), [err_c, setEC] = useState(false), [errCMP, setECMP] = useState(false), [errFM, setEFM] = useState(false);

    // eslint-disable-next-line
    const rP = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const onhandleInput = e => { err_n && setEN(false); errFM && setEFM(false); setEP(e.target.value); }
    const onhandleInputN = e => { err_c && setEC(false); errCMP && setECMP(false); setCP(e.target.value); }

    useEffect(() => { setSM(modal); }, [modal]);

    const showModal = async e => {
        modal && await handleModal(0);
        handleModal(num);
    }

    const hideModal = e => {
        setEN(false); setEN('');
        handleModal(0);
    }

    const handleUpdate = e => {
        if (n_p && c_p) {
            if (rP.test(n_p)) {
                if (n_p === c_p) {
                    var data;
                    setEN(false); setEN('');
                    handleModal(0);

                    switch (refAct) {
                        case 'employee': data = { value: n_p, field: e.target.name, _id: id, org: org };
                            updateEmpProfile(data);
                            break;
                        case 'profile': data = { value: n_p, field: 'password' };
                            updateProfile(data);
                            break;
                        default: break;
                    }

                } else setECMP(true);
            } else setEFM(true);
        } else {
            !n_p && setEN(true);
            !c_p && setEC(true);
        }
    }

    return sM ? <div className="animated fadeIn faster">
        <div className="modal-content" style={mT}>
            <div className="modal-header">
                <h6 className="static">Update Password</h6>
            </div>
            <div className="modal-body">
                <InputPassword t={'NEW PASSWORD'} plh={'Enter new password'} val={n_p} handleInput={onhandleInput} err={err_n} />
                {errFM && <div style={eS}>Passwords should be minimum 8 characters with one numeric, one capital and one special character</div>}
                <InputPassword t={'CONFIRM PASSWORD'} plh={'Retype password'} val={c_p} handleInput={onhandleInputN} err={err_c} />
                {errCMP && <div style={eS}>Passwords didn't match</div>}
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

export default connect(null, { updateEmpProfile, updateProfile })(EditPass);