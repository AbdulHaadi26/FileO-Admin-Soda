import React from 'react';
import './style.css';
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: '#b33939' };

export default ({ tp, plh, val, err, handleInput, n }) => <>
    <input type={tp} className="login-input" style={{ padding: '6px 12px', marginTop: '18px' }} placeholder={plh} name={n} value={val} onChange={e => handleInput(e)} />
    {err && <div style={eS}>This field is required</div>}
</>
