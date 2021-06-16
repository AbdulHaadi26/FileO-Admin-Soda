import React from 'react';
import User from '../../../assets/static/user.png';
import history from '../../../utils/history';

export default ({ list, count, id, onFetch, disabled }) => <div className="eLW">
    {renderList(list, id, disabled)}
    {count > 12 && <div className="col-12 bNW">
        <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <span className="fa-ch ch-l" /> Previous</button>
        <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <span className="fa-ch ch-r" /></button>
    </div>}
</div>

const renderList = (list, id) => list.map(Emp => <div className="col-lg-4 col-6 mFWS" key={Emp._id} style={{ cursor: 'pointer' }} onClick={e =>
    history.push(`/organization/${id}/employee/${Emp._id}`)}>
    <img src={!Emp.image ? User : `${Emp.image}`} alt="compnay" style={{ width: '50px', height: '50px', borderRadius: '1000px' }} />
    <h6 style={{ wordBreak: 'break-all', fontSize: '14px' }}>{Emp.name}</h6>
    <h6 style={{ wordBreak: 'break-all', fontSize: '12px' }}>{Emp.userType === 2 ? 'Administrator' : Emp.userType === 1 ? 'Project Manager' : 'User'}</h6>
    <h6 style={{ wordBreak: 'break-all', fontSize: '12px' }}>{Emp.email}</h6>
</div>);
