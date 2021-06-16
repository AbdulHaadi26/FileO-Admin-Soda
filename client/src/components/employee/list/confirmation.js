import React from 'react';
import Modal from '../../containers/modalBgContainer';

export default ({ onhandleModal, onNext, count }) => {

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => {
            e.preventDefault();
            onhandleModal();
            onNext();
        }}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', padding: '6px 18px', marginTop: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>Confirmation</h3>
            <div className="col-12" style={{ padding: '6px 18px' }}>
                <p>You have still {count} user available for use. If you want to add more then click below to proceed.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 18px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" onClick={e => onhandleModal(e)}
                    style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Dismiss</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Proceed</button>
            </div>
        </form>
    </Modal>
};
