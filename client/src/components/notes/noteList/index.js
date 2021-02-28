import React from 'react';
import './style.css';
import ConvertDate from '../../containers/dateConvert';
import history from '../../../utils/history';

export default ({ ord, count, list, id, _id, onFetch }) => {

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = listT.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        }); break;
        case 2: listT = listT.sort(function Sort(a, b) {
            var textA = a.title.toLowerCase();
            var textB = b.title.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.title.toLowerCase();
            var textB = b.title.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        break;
    }

    const renderList = (list, id, _id) => list.map(Note => <div className="col-lg-3 col-12" key={Note._id} onClick={e => history.push(`/organization/${id}/myspace/user/${_id}/notes/details/${Note._id}`)}>
        <div className="ntI col-12" style={{ backgroundColor: Note.color }}>
            {Note.updated && <h6 className="updated">Updated</h6>}
            <h6 className="nt-n" style={{ textAlign: 'center' }}>{Note.title}</h6>
            {Note.date && <h6 className="nt-d">{ConvertDate(Note.date)}</h6>}
        </div>
    </div>);

    return <>
        <div className="col-12 nt-sw">{renderList(listT, id, _id)}</div>
        {count > 12 && <div className="col-12 p-0 bNW">
            <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
            <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
        </div>}
    </>

}