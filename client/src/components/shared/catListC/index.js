import React from 'react';
import Link from 'react-router-dom/Link';
import Folder from '../../../assets/folder.svg';
import history from '../../../utils/history';

export default ({ list, isList, ord, catId }) => {
    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = listT.sort(function (a, b) {
            if(a.last_updated && b.last_updated) {
                return new Date(a.last_updated) - new Date(b.last_updated); 
            } else return new Date(a.date) - new Date(b.date);
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
            if(a.last_updated && b.last_updated) {
                return new Date(b.last_updated) - new Date(a.last_updated); 
            } else return new Date(b.date) - new Date(a.date);
        }); break;
    }

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

    return isList ? listT.map((Cat, k) => <div className="LI" key={Cat._id}>
        <img src={Folder} alt="Folder" style={{ width: '36px', height: '36px' }} />
        <Link style={{ textDecoration: 'none', marginLeft: '12px', wordBreak: 'break-all' }} to={`/organization/${Cat.org}/sharedby/${Cat.uId}/parentCategory/${catId}/category/${Cat._id}/list`} className="mr-auto">{Cat.name} {Cat.last_updated && <span style={{ color: 'red', fontSize: '12px' }}>(Last Updated at {renderDate(Cat.last_updated)})</span>}</Link>
    </div>) : listT.map((Cat, k) => <div className="mFWS col-lg-2 col-4" key={Cat._id}>
        <div style={{ display: 'flex' }}>
            <h6 style={{ visibility: 'hidden', display: 'flex' }}>
                <div style={{ width: '18px', height: '18px' }} />
            </h6>
        </div>
        <img src={Folder} alt="Folder" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${Cat.org}/sharedby/${Cat.uId}/parentCategory/${catId}/category/${Cat._id}/list`)} />
        <Link to={`/organization/${Cat.org}/sharedby/${Cat.uId}/category/${Cat._id}/list`} className="f-n mr-auto" style={{ textDecoration: 'none', wordBreak: 'break-all' }}>{Cat.name}</Link>
        {Cat.last_updated && <h6 style={{ left: '12px', fontSize: '11px', marginTop: '6px', textAlign: 'center', color: 'grey' }}>Last Updated at {renderDate(Cat.last_updated)}</h6>}
    </div>);
}




