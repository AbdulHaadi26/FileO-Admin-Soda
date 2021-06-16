import React, { useState } from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import history from '../../../utils/history';
import { downloadFile } from '../../../redux/actions/userFilesActions';
import { connect } from 'react-redux';
import More from '../../../assets/more.svg';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

const List = ({ id, list, _id, ord, downloadFile, isList }) => {
    const [active, setAct] = useState(-1);

    let tempL = [];
    tempL = tempL.concat(list);

    switch (ord) {
        case 1: tempL = tempL.sort(function (a, b) {
            return new Date(a.fileId.date) - new Date(b.fileId.date);
        });; break;
        case 2: tempL = tempL.sort(function Sort(a, b) {
            var textA = a.fileId.name.toLowerCase();
            var textB = b.fileId.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: tempL = tempL.sort(function Sort(a, b) {
            var textA = a.fileId.name.toLowerCase();
            var textB = b.fileId.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: tempL = tempL.sort(function (a, b) {
            return new Date(b.fileId.date) - new Date(a.fileId.date);
        }); break;
    }

    const renderList = () => tempL.map((File, k) => isList ? <div className="LI" key={File._id} style={{ padding: '12px 6px', borderRadius: '4px', position: 'relative' }}>
        {File && File.fileId && <img src={returnType(File.fileId.type)} alt="company" style={{ width: '36px', height: '36px' }} />}
        <Link className="mr-auto" style={{ textDecoration: 'none', wordBreak: 'break-all', marginLeft: '12px' }}
            to={`/organization/${id}/user/${_id}/view/shared/file/${File.fileId ? File.fileId.versionId : ''}`}>
            {File.fileId && File.fileId.name ? File.fileId.name : ''} {File.updated && <span style={{ color: 'red' }}>(Updated)</span>}</Link>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); downloadFile(File._id); }}>Download File</h6>
                </div>
            </h6>
        </div>
    </div> : File.fileId && <div className="col-lg-2 col-4 mFWS" key={File._id}>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); downloadFile(File._id); }}>Download File</h6>
                </div>
            </h6>
        </div>
        <img src={returnType(File.fileId.type)} alt="company"
            style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${id}/user/${_id}/view/shared/file/${File.fileId ? File.fileId.versionId : ''}`)} />
        <Link style={{ textDecoration: 'none', wordBreak: 'break-all' }} to={`/organization/${id}/user/${_id}/view/shared/file/${File.fileId ? File.fileId.versionId : ''}`}
            className="f-n">{File.fileId.name.length > 35 ? `${File.fileId.name.substr(0, 35)}...` : File.fileId.name}</Link>
        <h6 style={{ fontSize: '12px', fontWeight: '400', marginTop: '6px' }}>{File.sharedByName}</h6>    
        {File.updated && <h6 className="updated">Updated</h6>}
    </div>);

    return <div style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {renderList()}
    </div>
}

export default connect(null, { downloadFile })(List);