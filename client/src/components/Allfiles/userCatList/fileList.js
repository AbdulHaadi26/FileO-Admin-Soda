import React from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import history from '../../../utils/history';

export default ({ id, list, ord, i, isList }) => {

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = listT.sort(function (a, b) {
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
        default: listT = listT.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        }); break;
    }

    const renderUrl = F => {
        switch (i) {
            case 1: return `/organization/${id}/projects/${F.pId}/file/${F._id}`;
            case 2: return `/organization/${id}/myspace/user/${F.postedby}/file/${F._id}`;
            case 3: return `/organization/${id}/user/${F.postedFor}/clients/file/${F._id}`;
            default: return `/organization/${id}/file/${F._id}`;
        }
    }

    return listT.map((File, k) => isList ? <div className="LI" key={File._id}>
        <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
        <Link className="f-n" style={{ textDecoration: 'none', marginLeft: '12px', wordBreak: 'break-all', fontSize: '14px' }} to={renderUrl(File)}>{File.name}</Link>
    </div> : <div className="col-lg-2 col-4 mFWS" key={k}>
            <img style={{ cursor: 'pointer' }} onClick={e => history.push(renderUrl(File))} src={returnType(File.type)} alt="File" />
            <Link className="f-n" to={renderUrl(File)} style={{ textDecoration: 'none', wordBreak: 'break-all' }}>{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</Link>
        </div>);
}