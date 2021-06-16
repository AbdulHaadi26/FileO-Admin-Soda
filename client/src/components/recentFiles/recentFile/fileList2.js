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
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });; break;
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

    const renderList = () => listT.map((File, k) => isList ? <div className="LI" key={File._id} style={{ alignItems: 'flex-start' }}>
        <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
        <div style={{ flexGrow: 1, display: 'flex', marginLeft: '12px', flexDirection: 'column' }}>
            {File && File.name && <Link className="f-n" style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px' }} to={`${getBaseUrl(File, File.renderType)}${File._id}`}>{File.name}</Link>}
            <h6 style={{ fontSize: '12px', marginTop: '8px' }}>{File.renderType}</h6>
            {File && File.date && <h6 style={c}>{renderDate(File.date)}</h6>}
        </div>
    </div> : <div className="col-lg-2 col-4 mFWS" key={k}>
        <img style={{ cursor: 'pointer' }} onClick={e => history.push(`${getBaseUrl(File, File.renderType)}${File._id}`)} src={returnType(File.type)} alt="File" />
        {File && File.name && <Link className="f-n" to={`${getBaseUrl(File, File.renderType)}${File._id}`} style={{ textDecoration: 'none', wordBreak: 'break-all' }}>{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</Link>}
        <h6 style={{ fontSize: '12px', marginTop: '8px' }}>{File.renderType}</h6>
        {File && File.date && <h6 style={c}>{renderDate(File.date)}</h6>}
    </div>);

    return <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
        {renderList()}
    </div>
}