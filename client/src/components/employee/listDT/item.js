import React from 'react';
import User from '../../../assets/static/user.png';
import Link from 'react-router-dom/Link';
import Data from '../../../assets/data.svg';
import './style.css';

export default ({ list, count, id, onFetch }) => <div className="eLW">
    {renderList(list, id)}
    {count > 12 && <div className="col-12 bNW">
        <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <span className="fa-ch ch-l" /> Previous</button>
        <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <span className="fa-ch ch-r" /></button>
    </div>}
</div>

const renderList = (list, id) => list.map(Emp => <div className="col-lg-3 col-12 mEW p-0" key={Emp._id}>
    <div className="col-lg-11 col-12 eIW">
        <img src={!Emp.image ? User : `${Emp.image}`} alt="compnay" />
        <h6 className="e-n" style={{ wordBreak: 'break-all' }}>{Emp.name}</h6>
        <h6 className="e-r" style={{ wordBreak: 'break-all' }}>{Emp.userType === 2 ? 'Administrator' : Emp.userType === 1 ? 'Project Manager' : 'User'}</h6>
        <h6 className="e-r" style={{ wordBreak: 'break-all' }}>{Emp.email}</h6>
        <Link className="overlay" to={`/organization/${id}/data/transfer/employee/${Emp._id}`}>
            <span className="text">
                <div className="faL" style={{ backgroundImage: `url('${Data}')` }} />
                <h6 className="subtext">Transfer data</h6>
            </span>
        </Link>
    </div>
</div>);