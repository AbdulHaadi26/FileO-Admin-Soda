import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import Eye from '../../../assets/eyeW.svg';
import './subStyle.css';

const List = ({ id, _id, list, count, ord, onFetch, isList }) => {
    const [listT, setLT] = useState([]);

    useEffect(() => {
        let tempL = [];
        tempL = tempL.concat(list);

        switch (ord) {
            case 1: tempL = tempL.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });; break;
            case 2: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.title.toLowerCase();
                var textB = b.title.toLowerCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            case 3: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.title.toLowerCase();
                var textB = b.title.toLowerCase();
                return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            default: tempL = tempL.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            }); break;
        }
        setLT(tempL);
    }, [list, ord]);

    const renderList = () => listT.map(Note => isList ? <div className="fI" key={Note._id} style={{ padding: '12px 6px', borderRadius: '4px', position: 'relative' }}>
        <div className="col-lg-5 col-12" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div className="d-d-w" style={{ marginLeft: '12px' }}>
                <Link className="d-d-i-n" to={`/organization/${id}/myspace/user/${_id}/notes/details/${Note._id}`}>{Note.title} {Note.updated && <span style={{ fontSize: '12px', color: 'red' }}>(Updated)</span>}</Link>
            </div>
        </div>
        <div className="col-lg-4 hide">
            <div style={{ backgroundColor: '#34495e', color: 'white', fontSize: '14px', fontWeight: 'bold', borderRadius: '20px', padding: '8px 16px', marginTop: '12px', width: '80%' }}>
                {Note.status}
            </div>
        </div>
        <div className="col-lg-3 hide">
            <h6 style={{ fontSize: '12px', marginTop: '12px', color: 'white', backgroundColor: '#e74c3c', padding: '4px', width: '70%' }}>Due On: {Note.due}</h6>
        </div>
    </div> : <div className="col-lg-3 col-12 mFW p-0" key={Note._id}>
            <div className="col-lg-11 col-12 fIW">
                <h6 className="f-n">{Note.title}</h6>
                {Note.updated && <h6 className="updated">Updated</h6>}
                <div style={{ backgroundColor: '#34495e', color: 'white', fontSize: '14px', fontWeight: 'bold', borderRadius: '20px', padding: '8px 16px', marginTop: '12px', width: '80%' }}>
                    {Note.status}
                </div>
                <h6 style={{ fontSize: '12px', marginTop: '12px', color: 'white', backgroundColor: '#e74c3c', padding: '4px', width: '70%' }}>Due On: {Note.due}</h6>
                <Link className="overlay" to={`/organization/${id}/myspace/user/${_id}/notes/details/${Note._id}`}>
                    <span className="text">
                        <div className="faL" style={{ backgroundImage: `url('${Eye}')` }} />
                        <h6 className="subtext">View task</h6>
                    </span>
                </Link>
            </div>
        </div>);

    return <>
        <div className="fLW">
            {renderList()}
            {count > 12 && <div className="col-12 bNW">
                <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
                <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
            </div>}
        </div>
    </>
}

export default List;