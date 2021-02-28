import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';
const iG = { marginTop: '2px', width: '100%' };
const tS = { width: '100%', textAlign: 'left' };

export default ({ onhandleModal, onhandleUpt, txt, desc }) => {
    const [text, setText] = useState(txt), [description, setDescription] = useState(desc);

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => text && onhandleUpt(text, description)}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>Edit Folder</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '14px'}}>Name</h3>
                <div className="input-group" style={iG}>
                    <input type={'text'} className="form-control" placeholder={'Folder name'} value={text}
                        onChange={e => setText(e.target.value)} required={true} />
                </div>
                <h3 style={{ fontWeight: '600', fontSize: '14px', marginTop: '18px' }}>Description</h3>
                <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                    <textarea type='text' className="form-control" placeholder={'File description'} value={description} onChange={e => onhandleInputA(e)} style={tS} />
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <p className="word-count" style={{ fontSize: '12px' }}>{description.split(" ").length} / 500</p>
                </div>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    text && onhandleUpt(text, description);
                    setText('');
                }}>Update</button>
            </div>
        </form>
    </Modal>
};
