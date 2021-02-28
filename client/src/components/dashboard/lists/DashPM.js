import React from 'react';
import history from '../../../utils/history';
import File from '../../../assets/dashFile.svg';
import Law from '../../../assets/dashOrg.svg';
import Rocket from '../../../assets/dashRock.svg';
import './style.css';
export default ({ org, r, f, _id, or }) => <>
    {org && renderDashes(`/organization/${org}/files/categories`, 'Organization', or && or.name ? or.name : '', Law)}
    {org && renderDashes(`/organization/${org}/user/${_id}/projects/list`, 'Projects', r ? r : 0, Rocket)}
    {org && renderDashes(`/organization/${org}/all/files/page/0`, 'Files', f ? f : 0, File)}
</>

const renderDashes = (a, n, c, bg) => <div className="col-lg-4 col-12 mDW p-0" >
    <div className="col-lg-11 col-12 p-0 dIW" onClick={e => history.push(a)} style={{ cursor: 'pointer' }}>
        <div className="dSW">
            <img src={bg} style={{ width: '60px', height: '60px' }} alt={n} />
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <h3 className="d-n" style={{ fontSize: '16px', fontWeight: '700', marginBottom: '-2px' }}>{n === 'Organization' ? '' : 'Number Of '}{n}</h3>
                <h6 className="d-c" style={{ fontSize: n === 'Organization' ? '20px' : '36px', fontWeight: '700', marginTop: '6px' }}>{c}</h6>
            </div>
        </div>
    </div>
</div>