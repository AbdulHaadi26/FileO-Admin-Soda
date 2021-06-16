import React from 'react';
const fS = { position: 'fixed', zIndex: '9999', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.3', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '99999' };
const mB = { overflowY: 'auto', maxHeight: '90vh', lineHeight: '0px' };
const mB2 = { overflowY: 'auto', maxHeight: '90vh' };

export default ({ handleModal, children, EP, isTrial }) => <>
    <div style={fS} onClick={e => handleModal(e, false)} />
    <div className={`${isTrial ? 'col-lg-5' : 'col-lg-9'} col-10 p-0 modalDiv`} style={pS}>
        <div className="modal-content animated fadeInDown faster mdl">
            <div className={`modal-body ${EP ? 'p-0' : ''}`} style={EP ? mB : mB2}>
                {children}
            </div>
        </div>
    </div>
</>
