import React, { useState } from 'react';
import Modal from '../containers/modalBgContainer';
import Cards from '../../assetsFile-O/Cards.svg';
import EP from '../../assetsFile-O/easypaisa.svg';

export default ({ onhandleModal, onNext }) => {

    const [item, setItem] = useState(0);

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => onNext(item)}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', padding: '6px 18px', marginTop: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>Select Payment Method</h3>
            <div className="col-12" style={{ padding: '6px 24px' }}>
                <div className="form-check" style={{ marginBottom: '12px' }}>
                    <input className="form-check-input" type="checkbox" value={item === 0} checked={item === 0} onChange={e => setItem(0)} id="cbTE2" />
                    <img src={Cards} alt="Cards" style={{ marginTop: '-6px' }} />
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value={item === 1} checked={item === 1} onChange={e => setItem(1)} id="cbTE1" />
                    <img src={EP} alt="EasyPaisa" style={{ marginTop: '-6px', marginLeft:'8px'}} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 18px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onNext(item);
                }}>Next</button>
            </div>
        </form>
    </Modal>
};
