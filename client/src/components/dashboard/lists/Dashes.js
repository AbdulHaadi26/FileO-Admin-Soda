import React from 'react';
import history from '../../../utils/history';
import Users from '../../../assets/dashboard/users.svg';
import Law from '../../../assets/dashboard/team.svg';
import Files from '../../../assets/dashboard/files.svg';

export default ({ org, u, f, orgCount, fileStr, orgStorage }) => <>

    {org && renderDashes(`/organization/${org._id}/files/categories`, 'Team', org && org.name ? org.name : '', 0, '', -1, Law)}
    {org && renderDashes(`/organization/${org._id}/employee/search`, 'Users', u, `${u} of ${orgCount} users added`, '', Math.floor((u / orgCount) * 100), Users)}
    {org && renderDashes(`/organization/${org._id}/all/files/page/0`, 'Files', f, `${fileStr.toFixed(2)} GB / ${orgStorage.toFixed(2)} GB`, 'Storage:', Math.floor((fileStr / orgStorage) * 100), Files)}
</>

const renderDashes = (a, n, c, i, j, p, bg) => <div className="col-lg-4 col-12 mDW p-0" >
    <div className="col-lg-11 col-12 p-0 dIW" onClick={e => history.push(a)} style={{ cursor: 'pointer' }}>
        <div className="dSW">
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems:'flex-start' }}>
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
                    <div className="progress-bar" role="progressbar" style={{ width: `${p}%`, backgroundColor:'#008CBD' }} aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
            </div> : <></>}
        </div>
    </div>
</div>