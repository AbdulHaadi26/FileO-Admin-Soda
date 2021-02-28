import React from 'react';
import Link from 'react-router-dom/Link';
import Folder from '../../../assets/folder.svg';
import More from '../../../assets/more.svg';
import history from '../../../utils/history';

export default ({ list, id, uId, isList, ord }) => {

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

    return isList ? listT.map((Cat) => <div className="LI" key={Cat._id}>
        <img src={Folder} alt="Folder" style={{ width: '36px', height: '36px' }} />
        <Link style={{ textDecoration: 'none', marginLeft: '12px', wordBreak: 'break-all' }} to={`/organization/${id}/shared/${uId}/category/${Cat._id}/list`} className="mr-auto">{Cat.name}</Link>
    </div>) : listT.map((Cat) => <div className="mFWS col-lg-2 col-4" key={Cat._id}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content', visibility: 'hidden' }}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
            </h6>
        </div>
        <img src={Folder} alt="Folder" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${id}/shared/${uId}/category/${Cat._id}/list`)} />
        <Link to={`/organization/${id}/shared/${uId}/category/${Cat._id}/list`} className="f-n mr-auto" style={{ textDecoration: 'none', wordBreak: 'break-all' }}>{Cat.name.length > 35 ? `${Cat.name.substr(0, 35)}...` : Cat.name}</Link>
    </div>);
    ;
}




