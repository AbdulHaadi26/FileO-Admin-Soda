import React from 'react';
import history from '../../../utils/history';
import Users from '../../../assets/dashUser.svg';
import Cogs from '../../../assets/dashRole.svg';
import Files from '../../../assets/dashFile.svg';

export default ({ org, u, r, f }) => <>
    {org && renderDashes(`/organization/${org._id}/employee/search`, 'Users', u, Users)}
    {org && renderDashes(`/organization/${org._id}/role/list`, 'Roles', r, Cogs)}
    {org && renderDashes(`/organization/${org._id}/all/files/page/0`, 'Files', f, Files)}
</>

const renderDashes = (a, n, c, bg) => <div className="col-lg-4 col-12 mDW p-0" >
    <div className="col-lg-11 col-12 p-0 dIW" onClick={e => history.push(a)} style={{ cursor: 'pointer' }}>
        <div className="dSW">
            <img src={bg} style={{ width: '60px', height: '60px' }} alt={n} />
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <h3 className="d-n" style={{ fontSize: '16px', fontWeight: '700', marginBottom: '-2px' }}>Number Of {n}</h3>
                <h3 className="d-c" style={{ fontSize: '36px', fontWeight: '700', marginBottom: '-2px' }}>{c ? c : 0}</h3>
            </div>
        </div>
    </div>
</div>