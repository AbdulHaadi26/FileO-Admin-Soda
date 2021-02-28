import React from 'react';
import User from '../../../assets/static/user.png';
import Link from 'react-router-dom/Link';
import Plus from '../../../assets/plus.svg';
import './style.css';

export default ({ list, count, id, pId, ord, onFetch }) => {

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

    const renderList = () => listT.map(Emp => <div className="col-lg-3 col-6 pEW p-0" key={Emp._id}>
        <div className="col-lg-11 col-11 pIW">
            <img src={!Emp.image ? User : `${Emp.image}`} alt="compnay" />
            <h6 className="e-n">{Emp.name}</h6>
            <Link className="overlay" to={`/organization/${id}/projects/${pId}/employee/${Emp._id}`}>
                <span className="text">
                    <div className="faL" style={{ backgroundImage: `url('${Plus}')` }} />
                    <h6 className="subtext">Assign employee</h6>
                </span>
            </Link>
        </div>
    </div>);

    return <div className="pLW">
        {renderList(list)}
        {count > 12 && <div className="col-12 bNW">
            <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
            <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
        </div>}
    </div>
}