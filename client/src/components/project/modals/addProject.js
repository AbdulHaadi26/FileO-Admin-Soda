import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';
import Icons from './icons';
const iG = { marginTop: '2px', width: '100%' };
const tS = { width: '100%', textAlign: 'left' };
const mS = { marginTop: '12px', marginLeft: '6px' };

export default ({ onhandleModal, onhandleAdd }) => {
    const [text, setText] = useState(''), [description, setDescription] = useState(''),[cbActive, setCB] = useState(false), [icon, setIcon] = useState(0);

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);
    function handleCB(e) { setCB(e.target.checked); }

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => text && onhandleAdd(text, description, cbActive, icon)}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>New Project</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <Icons i={icon} setI={setIcon} />
                <div className="input-group" style={iG}>
                    <input type={'text'} className="form-control" placeholder={'Project name'} value={text}
                        onChange={e => setText(e.target.value)} required={true} />
                </div>
                <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                    <textarea type='text' className="form-control" placeholder={'Project description'} value={description} onChange={e => onhandleInputA(e)} style={tS} />
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <p className="word-count" style={{ fontSize: '12px' }}>{description.split(" ").length} / 500</p>
                </div>
                <div className="form-check form-check-inline" style={mS}>
                    <input className="form-check-input" type="checkbox" checked={cbActive} id='cbActive' onChange={e => handleCB(e)} />
                    <label className="form-check-label" htmlFor="cbActive">Active</label>
                </div>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    text && onhandleAdd(text, description, cbActive, icon);
                }}>Save</button>
            </div>
        </form>
    </Modal>
};
