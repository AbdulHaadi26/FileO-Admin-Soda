import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';
const iG = { marginTop: '2px', width: '100%' };

export default ({ onhandleModal, onhandleUpt, txt }) => {
    const [text, setText] = useState(txt);

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => text && onhandleUpt(text)}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>Edit Folder</h3>
            <hr />
            <h3 style={{ fontWeight: '600', fontSize: '14px' }}>Name</h3>
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <div className="input-group" style={iG}>
                    <input type={'text'} className="form-control" placeholder={'Folder name'} value={text}
                        onChange={e => setText(e.target.value)} required={true} />
                </div>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    text && onhandleUpt(text);
                }}>Update</button>
            </div>
        </form>
    </Modal>
};
