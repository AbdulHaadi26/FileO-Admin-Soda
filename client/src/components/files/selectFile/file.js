import React from 'react';
import File from '../../../assets/static/file.svg';
const iS = { marginTop: '30px', width: '60px', height: '60px', marginBottom: '20px' };
const fL = { marginTop: '16px', fontWeight: 700, color: '#0a3d62', fontSize: '12px', width: '100%' };
const eS = { width: '100%', fontWeight: 700, color: '#b33939', fontSize: '12px' };

export default ({ value, size, errSelected, errFile, errBroken, onhandleFilePreview }) => <>
    <img src={value ? value : File} alt="File" style={iS} />
    <input type='file' className="btn" style={{ marginBottom: '12px', marginLeft: '24px', fontSize:'12px', overflow: 'hidden' }} onChange={e => onhandleFilePreview(e)} />
    {renderError(errSelected, errFile, errBroken, size)}
</>

const renderError = (errSelected, errFile, errBroken, size) => errSelected ? <div className="mr-auto" style={eS}> No file selected</div> : errFile ? <div className="mr-auto" style={eS}> File size exceeds the limit</div> : errBroken ? <div className="mr-auto" style={eS}>File type is not supported</div> : <div className="mr-auto" style={fL}>File limit : {size}mb</div>
