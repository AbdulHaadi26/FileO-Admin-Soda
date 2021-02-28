import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import history from '../../../utils/history';
import More from '../../../assets/more.svg';
import { downloadFile } from '../../../redux/actions/fileActions';
import { connect } from 'react-redux';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

const FileList = ({ id, auth, list, ord, sv, sL, onsetSL, isList, downloadFile, setDel, setF, setFN, setEF }) => {
    const [listT, setLT] = useState([]), [active, setAct] = useState(false);

    useEffect(() => {
        let tempL = [];
        tempL = tempL.concat(list);

        switch (ord) {
            case 1: tempL = tempL.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            }); break;
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
        var tempList = sL;
        if (!File.isChecked) {
            tempList.push(File._id);
            onsetSL(tempList);
        } else {
            tempList = tempList.filter(i => i !== File._id);
            onsetSL(tempList);
        }
    }

    return listT.map((File, k) => isList ? <div className="LI" key={File._id} style={{ padding: '6px 12px' }}>
        {auth && sv && File.isChecked !== undefined && <div className="form-check form-check-inline" style={{ marginLeft: '12px' }} >
            <input className="form-check-input" type="checkbox" defaultChecked={File.isChecked} value={File.isChecked} onChange={e => handleSel(File)} />
        </div>}
        <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
        <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginLeft: '12px' }}
            to={`/organization/${id}/file/${File._id}`} className="mr-auto">{File.name}</Link>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id); }}>Edit File</h6>}
                    {auth && File.uploadable && File.versioning && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setF(File) }}>Upload Version</h6>}
                    {auth && File.uploadable && !File.versioning && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setFN(File) }}>Upload New</h6>}
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); downloadFile(File._id) }}>Download File</h6>
                    {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setDel(File._id) }}>Delete File</h6>}
                </div>
            </h6>
        </div>
    </div> : <div className="col-lg-2 col-4 mFWS" key={File._id}>
            {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                    <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                    <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                        {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id); }}>Edit File</h6>}
                        {auth && File.uploadable && File.versioning && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setF(File) }}>Upload Version</h6>}
                        {auth && File.uploadable && !File.versioning && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setFN(File) }}>Upload New</h6>}
                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); downloadFile(File._id) }}>Download File</h6>
                        {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setDel(File._id) }}>Delete File</h6>}
                    </div>
                </h6>
            </div>
            <img src={returnType(File.type)} style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${id}/file/${File._id}`)} alt="company file" />
            <Link style={{ textDecoration: 'none', wordBreak: 'break-all' }} to={`/organization/${id}/file/${File._id}`} className="f-n">{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</Link>
            {auth && sv && File.isChecked !== undefined && <div className="form-check form-check-inline" style={{ marginTop: 'auto' }} >
                <input className="form-check-input" type="checkbox" defaultChecked={File.isChecked} value={File.isChecked} onChange={e => handleSel(File)} />
            </div>}
        </div >);
}

export default connect(null, { downloadFile })(FileList);