import React from 'react';
import { Link } from 'react-router-dom';

export default ({ id, pId, list, count, onFetch, ord }) => {

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 0: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 1: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list; break;
    }

    const renderList = () => listT.map(Role => <div className="LI" key={Role._id}>
        <h6 style={{ marginBottom: '0px' }} className="mr-auto">{Role.name}</h6>
        <Link className="link" to={`/organization/${id}/projects/${pId}/role/${Role._id}`}><div className="fa-edit" /></Link>
    </div>);

    return <>
        <div className="col-12 p-0" style={{ marginTop: '20px' }}>{renderList()}</div>
        {count > 12 && <div className="col-12 p-0 bNW">
            <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
            <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
        </div>}
    </>

}