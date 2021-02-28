import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';
export default ({ id, list, count, onFetch }) => <>
    <div className="col-12 p-0" style={{ marginTop: '20px' }}>{renderList(list, id)}</div>
    {count > 12 && <div className="col-12 p-0 bNW">
        <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
        <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
    </div>}
</>

const renderList = (list, id) => list.map(Role => <div className="rI" key={Role._id}>
    <h6 className="dyna mr-auto">{Role.name}</h6>
    <Link className="link" to={`/organization/${id}/role/${Role._id}`}><div className="fa-edit" /></Link>
</div>);
