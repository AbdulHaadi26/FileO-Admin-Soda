import React from 'react';
import { Link } from 'react-router-dom';
import Edit from '../../../assets/edit.svg';
import './style.css';
const pB = { width: '80%', marginTop: '12px' };
export default ({list, count, onFetch, ord}) => {
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
            var textA = a.title.toLowerCase();
            var textB = b.title.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.title.toLowerCase();
            var textB = b.title.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list; break;
    }
    const renderList = () => listT.map(T => <div className="col-lg-3 col-12 supEW p-0" key={T._id}>
                <div className="col-lg-11 col-12 supIW mt-2 mb-2">
                    <h6 className="s-n">{T.title}</h6>
                    <h6 className="s-r">{T.resolved ? 'Resolved' : T.viewed ? 'Viewed' : 'In progress'}</h6>
                    <div className="progress" style={pB}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${T.progress !== 0 ? T.progress : T.progress + 1}%` }} aria-valuenow={T.progress !== 0 ? T.progress : T.progress + 1} aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <Link className="overlay" to={`/organization/${T.org}/ticket/details/${T._id}`}>
                        <span className="text">
                            <div className="faL" style={{ backgroundImage: `url('${Edit}')` }} />
                            <h6 className="subtext">Edit details</h6>
                        </span>
                    </Link>
                </div>
            </div>);

    return <div className="supLW">{renderList()}
        {count > 12 && <div className="col-12 bNW">
            <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <span className="fa-ch ch-l" /> Previous</button>
            <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)}>Next <span className="fa-ch ch-r" /></button>
        </div>} </div>
}