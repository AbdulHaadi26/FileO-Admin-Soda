import React from 'react';
const iS = { marginTop: '16px', width: '100%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '99%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const iG = { marginTop: '2px', width: '100%' };
export default ({ t, tp, plh, val, err, handleInput }) => <>
    <h6 style={iS}>{t}</h6>
    <div className="input-group" style={iG}>
        <input type={tp} className="form-control" placeholder={plh} value={val} onChange={e => handleInput(e)} />
    </div>
    {err && <div style={eS}> Field left blank </div>}
</>
