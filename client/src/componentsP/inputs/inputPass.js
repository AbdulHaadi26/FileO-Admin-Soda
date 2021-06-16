import React, { useState } from 'react';
import Eye from '../../assets/eye.svg';
import EyeS from '../../assets/hidden.svg';
const eS = { marginTop: '16px', width: '89%', marginLeft: '1%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px', marginBottom: '12px' };
const iS = { marginTop: '16px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const iG = { marginTop: '2px', width: '90%' };
export default ({ t, plh, val, err, handleInput, n }) => {
    const [p, setP] = useState(false), [eC, setEP] = useState(false);

    return <>
        <h6 style={iS}>{t}</h6>
        <div className="input-group" style={iG}>
            <input type={p ? 'text' : 'password'} className="form-control" placeholder={plh} value={val} name={n} onChange={e => handleInput(e)} onKeyPress={e => e.getModifierState('CapsLock') ? setEP(true) : setEP(false)} />
            <div className="input-group-append" onClick={e => setP(!p)}> <span className="input-group-text">
                <div style={{ width: '16px', height: '16px', backgroundImage: `url('${!p ? Eye : EyeS}')` }} />
            </span>
            </div>
        </div>
        {err && <div style={eS}>This field is required</div>}
        {eC && <div style={eS}>Caps lock is on</div>}
    </>
};