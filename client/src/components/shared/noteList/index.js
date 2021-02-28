import React from 'react';
import './style.css';
import history from '../../../utils/history';

export default ({ count, list, id, _id, onFetch, ord }) => {
    var listT = [];
    listT = listT.concat(list);

    const reverseArray = list => {
        var newArray = [];
        for (let i = list.length - 1; i >= 0; i--) { newArray.push(list[i]); }
        return newArray;
    }

    switch (ord) {
        case 1: listT = [].concat(reverseArray(list)); break;
        case 2: listT = listT.sort(function Sort(a, b) {
            var textA = a.noteTitle.toLowerCase();
            var textB = b.noteTitle.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.noteTitle.toLowerCase();
            var textB = b.noteTitle.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list; break;
    }

    const renderList = () => listT.map(Note => <div className="col-lg-3 col-12" key={Note._id} onClick={e => history.push(`/organization/${id}/myspace/user/${_id}/notes/view/${Note.noteId._id}`)}>
        <div className="ntI col-12" style={{ backgroundColor: Note.noteId.color }}>
            {Note.updated && <h6 className="updated">Updated</h6>}
            <h6 className="nt-n" style={{ textAlign: 'center' }}>{Note.noteTitle}</h6>
            <h6 className="nt-d">{Note.sharedByName}</h6>
        </div>
    </div>);

    return <>
        <div className="col-12 nt-sw">{renderList()}</div>
        {count > 12 && <div className="col-12 p-0 bNW">
            <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <span className="fa-ch ch-l" /> Previous</button>
            <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <span className="fa-ch ch-r" /></button>
        </div>}
    </>


}
