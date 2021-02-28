import React from 'react';
const mT = { marginTop: '12px', marginLeft: '6px' };
const fS = { fontSize: '14px' };
export default ({ onhandleCB, i, c, t, disabled }) => <div className="form-check form-check-inline" style={mT}>
    <input className="form-check-input" type="checkbox" name={i} checked={c} id={i} onChange={e => onhandleCB(e)} disabled={disabled}/>
    <label className="form-check-label" htmlFor={i} style={fS}>{t}</label>
</div>