import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import history from '../../../utils/history';
import N1 from '../../../assets/note-icons/t1.svg';
import N2 from '../../../assets/note-icons/t2.svg';
import N3 from '../../../assets/note-icons/t6.svg';
import N4 from '../../../assets/note-icons/t4.svg';
import N5 from '../../../assets/note-icons/t5.svg';
import More from '../../../assets/more.svg';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };
let listN = [N1, N2, N3, N4, N5];


const List = ({ id, _id, list, count, ord, onFetch, isList }) => {
    const [listT, setLT] = useState([]);
    const [active, setAct] = useState(-1);

    useEffect(() => {
        let tempL = [];
        tempL = tempL.concat(list);

        switch (ord) {
            case 1: tempL = tempL.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });; break;
            case 2: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.noteTitle.toLowerCase();
                var textB = b.noteTitle.toLowerCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            case 3: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.noteTitle.toLowerCase();
                var textB = b.noteTitle.toLowerCase();
                return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            default: tempL = tempL.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            }); break;
        }
        setLT(tempL);
    }, [list, ord]);

    const renderList = () => listT.map((Note, k) => isList ? <div className="LI" key={Note._id} style={{ borderRadius: '4px', position: 'relative' }}>
        <img src={Note.noteId && Note.noteId.icon ? listN[Note.noteId.icon] : listN[0]} alt="Note" style={{ width: '36px', height: '36px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px' }} className="mr-auto">
            <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '12px' }} className="mr-auto" to={`/organization/${id}/myspace/user/${_id}/notes/view/${Note.noteId._id}`}>{Note.noteTitle.length > 35 ? `${Note.noteTitle.substr(0, 35)}...` : Note.noteTitle} {Note.updated && <span style={{ fontSize: '11px', color: 'red' }}>(Updated)</span>}</Link>
            <h6 style={{ fontSize: '11px', color: 'gray', marginTop: '6px' }}>{Note.sharedByName}</h6>
        </div>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', opacity: ((Note.noteId.editable && !Note.noteId.isTask) || (Note.noteId.isTask && Note.noteId.editable && Note.noteId.status !== 'Closed')) ? '1' : '0' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); history.push(`/organization/${Note.noteId.org}/myspace/user/${Note.noteId.postedby}/notes/shared/details/${Note.noteId._id}`) }}>Edit</h6>
                </div>
            </h6>
        </div>
    </div> : <div className="col-lg-2 col-4 mFWS" key={Note._id}>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', opacity: ((Note.noteId.editable && !Note.noteId.isTask) || (Note.noteId.isTask && Note.noteId.editable && Note.noteId.status !== 'Closed')) ? '1' : '0' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); history.push(`/organization/${Note.noteId.org}/myspace/user/${Note.noteId.postedby}/notes/shared/details/${Note.noteId._id}`) }}>Edit</h6>
                </div>
            </h6>
        </div>
        <img src={Note.noteId && Note.noteId.icon ? listN[Note.noteId.icon] : listN[0]} alt="Note" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${id}/myspace/user/${_id}/notes/view/${Note.noteId._id}`)} />
        <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', textAlign: 'center' }} to={`/organization/${id}/myspace/user/${_id}/notes/view/${Note.noteId._id}`}>{Note.noteTitle.length > 35 ? `${Note.noteTitle.substr(0, 35)}...` : Note.noteTitle}</Link>
        {Note.updated && <h6 className="updated">Updated</h6>}
        {<h6 style={{ fontSize: '11px', color: 'gray', marginTop: '6px' }}>{Note.sharedByName}</h6>}
    </div>);

    return <>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}> {renderList()}</div>
        <div className="fLW">
            {count > 12 && <div className="col-12 bNW">
                <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
                <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
            </div>}
        </div>
    </>
}

export default List;