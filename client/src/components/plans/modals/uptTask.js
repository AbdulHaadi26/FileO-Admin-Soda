import React, { useState } from 'react';
import { connect } from 'react-redux';
import Modal from '../../containers/modalBgContainer';
const ModalBG = ({ onhandleModal, onhandleAdd, object }) => {
    const [text, setText] = useState(object.text);

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Edit Task</h3>
        <hr />
        <div style={{ width: '100%', padding: '6px 12px' }}>
            <textarea type="text" placeholder="Type text here" className="comment" value={text} onChange={e => setText(e.target.value)} />
        </div>
        <hr/>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
            <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                onhandleModal();
            }}>Cancel</button>
            <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
               object.text = text;
               onhandleAdd(object);
               setText('');
            }}>Update</button>
        </div>
    </Modal>
}

export default connect(null, {})(ModalBG);