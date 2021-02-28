import React from 'react';
const fS = { position: 'fixed', zIndex: '9999', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.3', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '99999' };
const mB = { maxHeight: '90vh', overflowY: 'auto' };

export default ({ handleModal, children}) => <>
    <div style={fS} onClick={e => handleModal(e, false)} />
    <div className="col-lg-5 col-10 p-0 modalDiv" style={pS}>
        <div className="modal-content animated fadeInDown faster col-12 p-0 mdl">
            <div className="modal-body thin p-0" style={mB}>
                {children}
            </div>
        </div>
    </div>
</>
