import React, { useState, useEffect } from 'react';
import InputText from '../inputs/inputText';
import { updateSetting } from '../../redux/actions/settingActions';
import { connect } from 'react-redux';
import './style.css';
import { ModalProcess } from '../../redux/actions/profileActions';
const mT = { marginTop: '16px', marginBottom: '16px' };
const mB = { marginTop: '16px' };
const EditText = ({ ModalProcess, handleModal, head, num, modal, len, updateSetting, Org }) => {
    const [sM, setSM] = useState(false), [val, setV1] = useState(1), [err, setE] = useState(false), [list, setL] = useState([]), [sel, setSEL] = useState(5);

    useEffect(() => {
        setSM(modal);
        let tempL = len.sort((a, b) => a - b); setL(tempL);
        setSEL(tempL[0])
    }, [modal, len]);

    const onhandleInput = e => {
        setV1(e.target.value);
        err && setE(false);
    };

    const showModal = async e => {
        modal && await handleModal(0);
        handleModal(num);
    };

    const hideModal = e => handleModal(0);

    const handleUpdate = () => {
        var isT = false;
        list.map(i => {
            if (Number(i) === Number(val)) isT = true;
            return i;
        });

        console.log(val, isT, Org)

        if (val && val > 0 && !isT && Org && Org.org && Org.org.combined_plan && val < Org.org.combined_plan) {
            handleModal(0);
            var data = { value: Number(val), field: 'updatePackage' };
            updateSetting(data);
        } else {
            ModalProcess({ title: 'Setting', text: 'Please select a different value.' });
            !val && setE(true);
        }

    }

    const handleCancel = () => {
        var data = { value: Number(sel), field: 'removePackage' };
        updateSetting(data);
    }

    const renderEdit = name => <h6 className="link" name={name} onClick={e => showModal(e)}><div className="fa-edit" /></h6>

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) setSEL(e.target.options[selectedIndex].getAttribute('data-key'))
    }

    return sM ? <div className="animated fadeIn faster">
        <div className="modal-content" style={mT}>
            <div className="modal-header">
                <h6 className="static">Update {head}</h6>
            </div>
            <div className="modal-body">
                <InputText t={`VOLUME`} plh={`Enter size`} tp={'number'} val={val} handleInput={onhandleInput} err={err} />
                <select style={{ width: '90%', marginTop: '24px' }} className="form-control" onChange={e => handleSelect(e)}>
                    {list.map((i, k) => <option key={k} data-key={i}>{i} GB</option>)}
                </select>
                <button type="button" style={{ marginTop: '24px' }} className="btn btn-danger" onClick={e => handleCancel()}>Remove User Storage</button>
            </div>
            <div className="modal-footer" style={mB}>
                <button type="button" className="btn btn-danger" onClick={e => hideModal(e)} >Cancel</button>
                <button type="button" className="btn btn-primary" onClick={e => handleUpdate()}>Add User Storage</button>
            </div>
        </div>
    </div> : <div className="data">
            <h6 className="static mr-auto">{head}</h6>
            <h6 className="dyna">{len.length}</h6>
            {renderEdit()}
        </div>
}

const mapStateToProps = state => {
    return {
        Org: state.Organization.data
    }
};

export default connect(mapStateToProps, { updateSetting, ModalProcess })(EditText);