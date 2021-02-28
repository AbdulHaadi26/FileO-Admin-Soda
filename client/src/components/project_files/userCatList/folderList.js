import React from 'react';
import Link from 'react-router-dom/Link';
import Folder from '../../../assets/folder.svg';
import history from '../../../utils/history';

export default ({ org, pId, list, isList, ord }) => {

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


    const renderList = () => isList ? listT.map((Cat, k) => <div className="LI" key={Cat._id}>
        <img src={Folder} alt="Folder" style={{ width: '36px', height: '36px' }} />
        <Link style={{ textDecoration: 'none', marginLeft: '12px', wordBreak: 'break-all' }}
            to={`/organization/${org}/projects/${pId}/files/${Cat._id}/list`} className="mr-auto">{Cat.name} {Cat.updated && <span style={{ color: 'red', fontSize: '12px' }}>(Updated)</span>}</Link>
    </div>) : listT.map((Cat, k) => <div className="mFWS col-lg-2 col-4" key={Cat._id}>
        <img src={Folder} alt="Folder" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${org}/projects/${pId}/files/${Cat._id}/list`)} />
        <Link to={`/organization/${org}/projects/${pId}/files/${Cat._id}/list`}
            className="f-n mr-auto" style={{ textDecoration: 'none', wordBreak: 'break-all' }}>
            {Cat.name.length > 35 ? `${Cat.name.substr(0, 35)}...` : Cat.name}</Link>
        {Cat.updated && <h6 className="updated">Updated</h6>}
    </div>);



    return <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
        {renderList(list)}
    </div>
}