import React from 'react';
const mF = { marginTop: '16px' };

export default ({ onSubmit, text, children }) => <form className="modal-content" style={mF} onSubmit={e => onSubmit(e)}>
    <div className="modal-body">
        {children}
    </div>
    <div className="modal-footer" style={mF}>
        <button className="btn btn-primary" type='submit'>{text}</button>
    </div>
</form>