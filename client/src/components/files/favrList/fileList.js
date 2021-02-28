import React from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import history from '../../../utils/history';
const c = { color: 'grey', fontSize: '10px' };

export default ({ list, id, uId, ord, isList }) => {

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


    const getBaseUrl = (pId, type) => type === 0 ? `/organization/${id}/file/` : type === 1 ? `/organization/${id}/projects/${pId}/version/file/` : type === 2 ? `/organization/${id}/myspace/user/${uId}/file/` : `/organization/${id}/user/${uId}/clients/file/`

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

    return listT.map(File => isList ? <div className="LI" key={File._id} style={{ padding: '12px 6px', borderRadius: '4px', position: 'relative' }}>
        <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
        <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginLeft: '12px' }}
            to={`${getBaseUrl(File.pId || '', File.fileType)}${File.fileId}`}>{File.name}</Link>
    </div> : <div className="col-lg-2 col-4 mFWS" key={File._id}>
            <img src={returnType(File.type)} style={{ cursor: 'pointer' }}
                alt="company" onClick={e => !File.isPerm && !File.isDel  && history.push(`${getBaseUrl(File.pId || '', File.fileType)}${File.fileId}`)} />
            {
                !File.isPerm && !File.isDel ?
                    <Link className="f-n" style={{ wordBreak: 'break-all', textDecoration: 'none' }} to={returnType(File.type)}>
                        {File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</Link>
                    :
                    <h6 className="subtext" style={{ textAlign: 'center', fontSize: '10px' }}>{File.isDel ? `The file named ${File.name} has been deleted by the uploader` : `The file named ${File.name} permission has been revoked`}</h6>
            }
            <h6 className="f-r" style={c}>{File.date && renderDate(File.date)}</h6>
        </div>);
}