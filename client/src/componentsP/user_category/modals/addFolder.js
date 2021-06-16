import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';
const iG = { marginTop: '2px', width: '100%' };

export default ({ onhandleModal, onhandleAdd }) => {
    const [text, setText] = useState('');

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => {
            e.preventDefault();
            text && onhandleAdd(text)
        }}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>New Folder</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <div className="input-group" style={iG}>
                    <input type={'text'} className="form-control" placeholder={'Folder name'} value={text}
                        onChange={e => setText(e.target.value)} required={true} autoFocus={true} />
                </div>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Save</button>
            </div>
        </form>
    </Modal>
};
