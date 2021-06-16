import React from 'react';
import history from '../../../utils/history';
import File from '../../../assets/dashboard/files.svg';
import Law from '../../../assets/dashboard/team.svg';
import Rocket from '../../../assets/dashboard/addproject.svg';
import './style.css';
export default ({ org, r, f, _id, or, uStr, uptStr }) => <>
    {org && renderDashes(`/organization/${org}/files/categories`, 'Team', or && or.name ? or.name : '', 0, '', -1, Law)}
    {org && renderDashes(`/organization/${org}/user/${_id}/projects/list`, 'Projects', r ? r : 0, 0, '', -1, Rocket)}
    {org && renderDashes(`/organization/${org}/all/files/page/0`, 'Files', f ? f : 0, `${uptStr.toFixed(2)} GB / ${uStr.toFixed(2)} GB`, 'Storage:', Math.floor((uptStr / uStr) * 100), File)}
</>

const renderDashes = (a, n, c, i, j, p, bg) => <div className="col-lg-4 col-12 mDW p-0" >
    <div className="col-lg-11 col-12 p-0 dIW" onClick={e => history.push(a)} style={{ cursor: 'pointer' }}>
        <div className="dSW">
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'flex-start' }}>
                <div className="dshPad">
                    <img src={bg} style={{ width: '30px', height: '30px' }} alt={n} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '12px' }}>
                    <h3 className="d-n" style={{ fontSize: '24px', fontWeight: '600', marginBottom: '-2px' }}>{n === 'Team' ? '' : ''}{n}</h3>
                    <h6 className="d-c" style={{ fontSize: '14px', fontWeight: '400', marginTop: '6px' }}>{c}</h6>
                </div>
            </div>

            {i !== 0 && <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {!j ? <h6 className="extDet" style={{ marginLeft: '0px' }}>{i}</h6> : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <h6 className="extDet" style={{ marginLeft: '0px' }}>{j}</h6>
                    <h6 className="extDet" style={{ marginLeft: 'auto' }}>{i}</h6>
                </div>}
            </div>}
            {p >= 0 ? <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div className="progress" style={{ height: '8px', width: '100%', borderRadius: '1000px' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${p}%`, backgroundColor: '#008CBD' }} aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
            </div> : <></>}
        </div>
    </div>
</div>