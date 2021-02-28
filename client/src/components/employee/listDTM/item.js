import React from 'react';
import User from '../../../assets/static/user.png';
import './style.css';

export default ({ list, count, onFetch, selectEmp }) => <div className="eLW">
    {renderList(list, selectEmp)}
    {count > 12 && <div className="col-12 bNW">
        <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <span className="fa-ch ch-l" /> Previous</button>
        <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <span className="fa-ch ch-r" /></button>
    </div>}
</div>

const renderList = (list, selectEmp) => list.map(Emp => <div className="col-lg-3 col-12 mEW p-0" key={Emp._id}>
    <div className="col-lg-11 col-12 eIW">
        <img src={!Emp.image ? User : `${Emp.image}`} alt="compnay" />
        <h6 className="e-n" style={{ wordBreak: 'break-all' }}>{Emp.name}</h6>
        <h6 className="e-r" style={{ wordBreak: 'break-all' }}>{Emp.userType === 2 ? 'Administrator' : Emp.userType === 1 ? 'Project Manager' : 'User'}</h6>
        <h6 className="e-r" style={{ wordBreak: 'break-all' }}>{Emp.email}</h6>
        <button className="btn btn-success btn-block" style={{ marginTop: '12px', width: '80%' }} onClick={e => selectEmp(Emp)}>Select</button>
    </div>
</div>);