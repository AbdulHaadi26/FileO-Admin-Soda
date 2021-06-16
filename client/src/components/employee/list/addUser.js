import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';

export default ({ onhandleModal, onNext, count }) => {

    const [item, setItem] = useState(1);

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => {
            e.preventDefault();
            onNext(item);
        }}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', padding: '6px 18px', marginTop: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>Add More Users</h3>
            <p style={{ fontSize: '12px', padding: '6px 18px' }}>Your max subscribed user limit has reached. Please add more user.</p>
            <h6 style={{ fontSize: '14px', fontWeight: '600', padding: '6px 18px' }}>Current User: {count}</h6>
            <div className="col-12" style={{ padding: '6px 18px' }}>
                <div className="input-group" style={{ width: '100%' }}>
                    <input type={'number'} min={1} className="form-control" style={{ padding: '4px 8px' }} value={item} onChange={e => setItem(e.target.value)} />
                </div>
            </div>
            <h6 style={{ fontSize: '14px', fontWeight: '600', padding: '6px 18px', marginTop:'12px' }}>Price</h6>
            <h6 style={{ fontSize: '14px', fontWeight: '600', padding: '0px 18px', color:'green' }}>RS {item * 275}</h6>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 18px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Pay Now</button>
            </div>
        </form>
    </Modal>
};
