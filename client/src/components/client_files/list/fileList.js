import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import returnType from '../../types';
import { deleteFiles, cutFiles, copyFiles, downloadFile } from '../../../redux/actions/clientFilesAction';
import { connect } from 'react-redux';
import history from '../../../utils/history';
import More from '../../../assets/more.svg';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };
const List = ({ id, uId, list, sL, onsetSL, isList, ord, sv, disabled, downloadFile, setMDF, setEF }) => {
    const [active, setAct] = useState(-1);

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = list.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });; break;
        case 2: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = listT.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        }); break;
    }

    const handleSel = File => {
        var tempList = sL;
        if (!File.isChecked) {
            tempList.push(File._id);
            onsetSL(tempList);
        } else {
            tempList = tempList.filter(i => i !== File._id);
            onsetSL(tempList);
        }
    };


    const renderList = () => listT.map((File, k) => isList ? <div className="LI" key={File._id}>
        <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '6px', marginLeft: '6px' }} className="mr-auto">
            <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400' }} to={`/organization/${id}/user/${uId}/clients/file/${File._id}`}>{File.name} {File.updated && <span style={{ color: 'red', fontSize: '12px', fontWeight: '400' }}>(Updated)</span>}</Link>
            {File.postedBy && <h6 style={{ fontWeight: '400', fontSize: '12px' }}>{File.postedBy}</h6>}
        </div>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id); }}>Edit File</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && downloadFile(File._id); }}>Download File</h6>
                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMDF(File._id); }}>Delete File</h6>
                </div>
            </h6>
        </div>
    </div> : <div className="col-lg-2 col-4 mFWS" key={File._id}>
            {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
                <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                    <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                    <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id); }}>Edit File</h6>
                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && downloadFile(File._id); }}>Download File</h6>
                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMDF(File._id); }}>Delete File</h6>
                    </div>
                </h6>
            </div>
            <img style={{ cursor: 'pointer' }} src={returnType(File.type)}
                onClick={e => history.push(`/organization/${id}/user/${uId}/clients/file/${File._id}`)} alt="company" />
            <Link style={{ textDecoration: 'none', wordBreak: 'break-all' }} to={`/organization/${id}/user/${uId}/clients/file/${File._id}`} className="f-n">{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</Link>
            <h6 className="f-n" style={{ fontSize: '12px', marginTop: '8px' }}>{File.postedBy}</h6>
            {File.updated && <h6 className="updated">Updated</h6>}
            {sv && File.isChecked !== undefined && <div className="form-check form-check-inline" style={{ marginTop: '12px' }} >
                <input className="form-check-input" type="checkbox" defaultChecked={File.isChecked} value={File.isChecked} onChange={e => handleSel(File)} />
            </div>}
        </div>);


    return <>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
            {renderList()}
        </div>    
    </>
}


export default connect(null, { deleteFiles, cutFiles, copyFiles, downloadFile })(List);