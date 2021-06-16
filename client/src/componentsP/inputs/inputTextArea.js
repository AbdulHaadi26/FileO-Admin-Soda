import React from 'react';
const is = { marginTop: '14px', fontSize: '12px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62' };
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const tS = { resize: 'none', height: '120px' };
const iG = { marginTop: '6px', width: '90%' };
export default ({ t, plh, n, val, err, handleInput }) => <>
    <h6 style={is}>{t}</h6>
    <div className="input-group" style={iG}>
        <textarea type='text' className="form-control" placeholder={plh} name={n} value={val} onChange={e => handleInput(e)} style={tS} />
    </div>
    {err && <div style={eS}>This field is required</div>}
</>