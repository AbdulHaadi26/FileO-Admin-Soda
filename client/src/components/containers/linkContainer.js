import React from 'react';
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.3', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '9999' };

export default ({ handleModal, onCopyText, children }) => <>
    <div style={pF} onClick={e => handleModal(e, false)} />
    <div className="col-lg-5 col-11 p-0 modalDiv" style={pS}>
        <div className="modal-content animated fadeInDown faster col-12 p-0">
            <div className="modal-body p-0">
                <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Copy Link</h3>
                <hr />
                <div className="col-12" style={{ padding: '6px 12px' }}>
                    {children}
                </div>
                <hr />
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                    <button className="btn btn-primary" type="button" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                        onCopyText(e)
                    }}>Copy Link</button>
                </div>
            </div>
        </div>
    </div>
</>