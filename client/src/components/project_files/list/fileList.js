import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import history from '../../../utils/history';
import More from '../../../assets/more.svg';
import { downloadFile } from '../../../redux/actions/project_filesActions';
import { connect } from 'react-redux';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

const FileList = ({ id, pId, list, ord, sv, sL, onsetSL, auth, isList, downloadFile, setMDF, setF, setFN, setEF }) => {
    const [listT, setLT] = useState([]), [active, setAct] = useState(false);

    useEffect(() => {
        let tempL = [];
        tempL = tempL.concat(list);

        switch (ord) {
            case 1: tempL = tempL.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });; break;
            case 2: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.name.toLowerCase();
                var textB = b.name.toLowerCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            case 3: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.name.toLowerCase();
                var textB = b.name.toLowerCase();
                return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            default: tempL = tempL.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            }); break;
        }

        setLT(tempL);
    }, [list, ord, sL]);

    const handleSel = File => {
        let tempList = sL;
        if (!File.isChecked) {
            tempList.push(File._id);
            onsetSL(tempList);
        } else {
            tempList = tempList.filter(i => i !== File._id);
            onsetSL(tempList);
        }
    }

    return listT.map((File, k) => isList ? <div className="LI" key={File._id} style={{ padding: '6px 12px', borderRadius: '4px', position: 'relative' }}>
        {auth && sv && File.isChecked !== undefined && <div className="form-check form-check-inline" style={{ marginTop: 'auto' }} >
            <input className="form-check-input" type="checkbox" defaultChecked={File.isChecked} value={File.isChecked} onChange={e => handleSel(File)} />
        </div>}
        <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
        <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginLeft: '12px' }} className="mr-auto"
            to={`/organization/${id}/projects/${pId}/file/${File._id}`}>{File.name}</Link>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id); }}>Edit File</h6>}
                    {File.uploadable && File.versioning && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setF(File) }}>Upload Version</h6>}
                    {File.uploadable && !File.versioning && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setFN(File) }}>Upload New</h6>}
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); downloadFile(File._id); }}>Download File</h6>
                    {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMDF(File._id); }}>Delete File</h6>}
                </div>
            </h6>
        </div>
    </div> : <div className="col-lg-2 col-4 mFWS" key={File._id}>
            {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
                <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                    <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                    <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                        {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id); }}>Edit File</h6>}
                        {File.uploadable && File.versioning && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setF(File) }}>Upload Version</h6>}
                        {File.uploadable && !File.versioning && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setFN(File) }}>Upload New</h6>}
                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); downloadFile(File._id); }}>Download File</h6>
                        {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMDF(File._id); }}>Delete File</h6>}
                    </div>
                </h6>
            </div>
            <img style={{ cursor: 'pointer' }} src={returnType(File.type)} alt="company" onClick={e => history.push(`/organization/${id}/projects/${pId}/file/${File._id}`)} />
            <Link className="f-n" style={{ textDecoration: 'none', wordBreak: 'break-all' }} to={`/organization/${id}/projects/${pId}/file/${File._id}`}>{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</Link>
            {sv && File.isChecked !== undefined && <div className="form-check form-check-inline" style={{ marginTop: '12px' }} >
                <input className="form-check-input" type="checkbox" defaultChecked={File.isChecked} value={File.isChecked} onChange={e => handleSel(File)} />
            </div>}
        </div>)
}

export default connect(null, { downloadFile })(FileList);
