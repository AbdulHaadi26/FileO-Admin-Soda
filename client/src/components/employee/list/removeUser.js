import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';

const eS = {
    marginTop: '16px', marginBottom: '12px', width: '90%',
    textAlign: 'left', fontWeight: 700, color: '#b33939',
    fontSize: '12px'
};

export default ({ onhandleModal, onNext, addCount, userCount }) => {

    const [item, setItem] = useState(userCount), [err, setErr] = useState(false);

    const onSetItem = val => {
        if (val <= userCount && val >= addCount) {
            setItem(val);
            err && setErr(false)
        } else {
            setItem(val);
            setErr(true);
        }
    };

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => {
            e.preventDefault();
            onNext(item);
        }}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', padding: '6px 18px', marginTop: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>Downgrade Users</h3>
            <h6 style={{ fontSize: '14px', fontWeight: '600', padding: '6px 18px' }}>Paid Users: {userCount}</h6>
            <div className="col-12" style={{ padding: '6px 18px' }}>
                <div className="input-group" style={{ width: '100%' }}>
                    <input type={'number'} min={3} className="form-control" style={{ padding: '4px 8px' }} value={item} onChange={e => onSetItem(e.target.value)} />
                </div>
                {err && <div style={eS}>The number should be greater than current users and less than the paid users.</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 18px', marginTop: '12px', marginBottom: '12px' }}>
                <button disabled={err} className="btn btn-danger" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Downgrade</button>
            </div>
        </form>
    </Modal>
};
