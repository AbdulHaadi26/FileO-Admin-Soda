import React from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import history from '../../../utils/history';
const c = { color: 'grey', fontSize: '10px' };

export default ({ list, id, ord, isList }) => {

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = list.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        }); break;
        case 2: listT = listT.sort(function Sort(a, b) {
            var textA = a.fileId.name.toLowerCase();
            var textB = b.fileId.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.fileId.name.toLowerCase();
            var textB = b.fileId.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        }); break;
    }

    const getBaseUrl = (File, type) => type === 'File' ? `/organization/${id}/file/` : type === 'User File' ? `/organization/${id}/myspace/user/${File.postedby}/file/` : `/organization/${id}/projects/${File.pId}/version/file/`;

    const renderDate = date => {
        var serverDate = date;
        var dt = new Date(Date.parse(serverDate));
        var hours = dt.getHours();
        var minutes = dt.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var checkDate = new Date(Date.now());
        checkDate.setDate(checkDate.getDate() - 1);
        var strTime = `${checkDate < dt ? '' : `${date.slice(0, 10)} at `}${hours}:${minutes}  ${ampm}`;
        return strTime;
    }

    const renderList = () => listT.map((File, k) => isList ? <div className="LI" key={File._id} style={{ padding: '12px 6px', borderRadius: '4px', position: 'relative', alignItems:'flex-start' }}>
        {File.fileId && <img src={returnType(File.fileId.type)} alt="file" style={{ width: '36px', height: '36px' }} />}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginLeft: '12px', }}>
            {File.fileId && <Link className="f-n" style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px' }} to={`${getBaseUrl(File.fileId, File.renderType)}${File.fileId._id}`}>{File.fileId.name}</Link>}
            {File && <h6 style={{ fontSize: '12px', marginTop: '8px' }}>{File.renderType}</h6>}
            {File.date && <h6 style={c}>{renderDate(File.date)}</h6>}
        </div>
    </div> : <div className="col-lg-2 col-4 mFWS" key={k}>
            {File.fileId && File.fileId.type && <img style={{ cursor: 'pointer' }} onClick={e => history.push(`${getBaseUrl(File.fileId, File.renderType)}${File.fileId._id}`)}
                src={returnType(File.fileId.type)} alt="File" />}
            {File.fileId && File.fileId.name && <Link className="f-n" style={{ wordBreak: 'break-all', textDecoration: 'none' }} to={`${getBaseUrl(File.fileId, File.renderType)}${File.fileId._id}`}>{File.fileId.name.length > 35 ? `${File.fileId.name.substr(0, 35)}...` : File.fileId.name}</Link>}
            {File && <h6 style={{ fontSize: '12px', marginTop: '8px' }}>{File.renderType}</h6>}
            {File.date && <h6 style={c}>{renderDate(File.date)}</h6>}
        </div>);

    return <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
        {renderList()}
    </div>
}