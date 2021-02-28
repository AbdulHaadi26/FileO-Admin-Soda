import React from 'react';
import Link from 'react-router-dom/Link';
import User from '../../../assets/static/user.png';
import Edit from '../../../assets/edit.svg';
import './style.css';

export default ({ list, count, id, pId, onFetch, ord }) => {

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 0: listT = listT.sort(function Sort(a, b) {
            var textA = a.userId && a.userId.name.toLowerCase();
            var textB = b.userId && b.userId.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 1: listT = listT.sort(function Sort(a, b) {
            var textA = a.userId && a.userId.name.toLowerCase();
            var textB = b.userId && b.userId.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list; break;
    }

    const renderList = () => listT.map(Emp => Emp.userId && <div className="col-lg-3 col-6 pEW p-0" key={Emp._id}>
        <div className="col-lg-11 col-11 pIW">
            <img src={Emp.userId.image ? Emp.userId.image : User} alt="compnay" />
            <h6 className="e-n">{Emp.userId.name}</h6>
            <Link className="overlay" to={`/organization/${id}/projects/${pId}/assigned/employee/details/${Emp.userId._id}`}>
                <span className="text">
                    <div className="faL" style={{ backgroundImage: `url('${Edit}')` }} />
                    <h6 className="subtext">Edit details</h6>
                </span>
            </Link>
        </div>
    </div>)

    return <div className="pLW">
        {renderList(list)}
        {count > 12 && <div className="col-12 bNW">
            <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
            <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
        </div>}
    </div>
}