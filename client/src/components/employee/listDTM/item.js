import React from 'react';
import User from '../../../assets/static/user.png';
import Data from '../../../assets/checked.svg';

export default ({ list, count, onFetch, selectEmp }) => <div className="eLW">
    {renderList(list, selectEmp)}
    {count > 12 && <div className="col-12 bNW">
        <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <span className="fa-ch ch-l" /> Previous</button>
        <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <span className="fa-ch ch-r" /></button>
    </div>}
</div>

const renderList = (list, selectEmp) => list.map(Emp => <div className="col-lg-2 col-4 mFWS" key={Emp._id}>
    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
            <div onClick={e => selectEmp(Emp)} style={{
                width: '22px', height: '22px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
            }}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundSize: 'contain', backgroundImage: `url('${Data}')` }} />
            </div>
        </h6>
    </div>
    <img src={!Emp.image ? User : `${Emp.image}`} alt="compnay" style={{ width: '50px', height: '50px', borderRadius: '1000px' }} />
    <h6 style={{ wordBreak: 'break-all', fontSize: '14px' }}>{Emp.name}</h6>
    <h6 style={{ wordBreak: 'break-all', fontSize: '12px' }}>{Emp.userType === 2 ? 'Administrator' : Emp.userType === 1 ? 'Project Manager' : 'User'}</h6>
    <h6 style={{ wordBreak: 'break-all', fontSize: '12px' }}>{Emp.email}</h6>
</div>);