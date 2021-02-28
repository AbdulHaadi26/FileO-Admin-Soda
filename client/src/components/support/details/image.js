import React from 'react';
import Org from '../../../assets/static/org.svg';
const iS = { width: '150px', height: '150px', marginRight: '20px', marginTop: '50px', };
const iL = { marginTop: '30px', marginBottom: '22px', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { marginTop: '30px', marginBottom: '22px', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const mS = { marginLeft: '24px', marginTop: '12px' };
const fS = { display: 'flex', flexDirection: 'column', alignItems: 'center' };

export default ({ img, err, errBroken, onhandleImagePreview }) => <>
    <div className="col-12 p-0" style={fS}>
        <img src={img ? img : Org} alt="Attachment" style={iS} />
        <input type='file' className="btn" accept="image/x-png,image/png,image/gif,image/jpeg,image/jpg" style={mS} onChange={e => onhandleImagePreview(e)} />
    </div>
    {renderError(err, errBroken)}
</>

const renderError = (err, errBroken) => err ? <div className="mr-auto" style={eS}> Image size exceeds the limit </div> : errBroken ? <div className="mr-auto" style={eS}> Image type not supported </div> : <div className="mr-auto" style={iL}> Limit: 5 MB </div>