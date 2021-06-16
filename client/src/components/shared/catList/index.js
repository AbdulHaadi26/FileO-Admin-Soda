import React from 'react';
import Link from 'react-router-dom/Link';
import Folder from '../../../assets/folder.svg';
import history from '../../../utils/history';

export default ({ list, ord, catId }) => {
    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = listT.sort(function (a, b) {
            return new Date(a.catId.date) - new Date(b.catId.date);
        }); break;
        case 2: listT = listT.sort(function Sort(a, b) {
            var textA = a.catId && a.catId.name.toLowerCase();
            var textB = b.catId && b.catId.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.catId && a.catId.name.toLowerCase();
            var textB = b.catId && b.catId.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = listT.sort(function (a, b) {
            return new Date(b.catId && b.catId.date) - new Date(a.catId && a.catId.date);
        }); break;
    }

    const renderList = () => listT.map((Cat, k) => Cat.catId && <div className="mFWS col-lg-2 col-4" key={Cat._id}>
        <img src={Folder} alt="Folder" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${Cat.org}/sharedby/${Cat.sharedBy}/parentCategory/${Cat._id}/category/${Cat.catId._id}/list`)} />
        <Link to={`/organization/${Cat.org}/sharedby/${Cat.sharedBy}/category/${Cat.catId._id}/list`} className="f-n mr-auto" style={{ textDecoration: 'none', textAlign: 'center', wordBreak: 'break-all' }}>{Cat.catTitle}</Link>
        <h6 style={{ fontSize: '12px', fontWeight: '400', marginTop: '4px', textAlign: 'center' }}>{Cat.sharedByName}</h6>
        {Cat.updated && <h6 className="updated">Updated</h6>}
    </div>);

    return <div style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>{renderList()}</div>
}
