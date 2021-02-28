import React from 'react';
import File from '../../../assets/static/file.svg';
const iS = { marginTop: '30px', width: '120px', height: '120px', marginBottom: '20px' };
const fL = { marginTop: '16px', fontWeight: 700, color: '#0a3d62', fontSize: '12px', width: '100%' };
const eS = { width: '100%', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const mB = { marginBottom: '12px', marginLeft: '24px', overflow: 'hidden' };

export default ({ value, size, errSelected, errFile, errBroken, onhandleFilePreview }) => {

    const renderError = () => errSelected ? <div className="mr-auto" style={eS}> No file selected</div> : errFile ? <div className="mr-auto" style={eS}> File size exceeds the limit</div> :
        errBroken ? <div className="mr-auto" style={eS}>File type is not supported</div> : <div className="mr-auto" style={fL}>File limit : {size}mb</div>

    return <>
        <img src={value ? value : File} alt="User Profile" style={iS} />
        <input type='file' className="btn" style={mB} onChange={e => onhandleFilePreview(e)} />
        {renderError()}
    </>
}