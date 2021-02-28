import React from 'react';
import Popover from '../../popover';
const aS = { marginTop: '12px', marginLeft: '6px' };
const fS = { fontSize: '14px' };
export default ({ id, val, t, eT, url, n , onhandleCB }) => <div className="form-check form-check-inline" style={aS}>
    <input className="form-check-input" type="checkbox" defaultChecked={val} val={val} name={n} id={id} onChange={e => onhandleCB(e)} />
    <label className="form-check-label" htmlFor={id} style={fS}>{t}</label>
    <Popover text={eT} sty={{ marginLeft: '6px' }} url={url} />
</div>