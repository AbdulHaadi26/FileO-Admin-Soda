import React from 'react';
import Link from 'react-router-dom/Link';
import Group from '../../../assets/group.svg';
import Work from '../../../assets/work.svg';
import Tags from '../../../assets/price.svg';
import './style.css';
const dS = { color: '#2c3e50', marginTop: '12px', marginBottom: '24px' };

export default ({ r, e, c, id }) => <>
    {renderDashes(`/organization/${id}/employee/add`, `/organization/${id}/employee/search`, `Users: ${e}`, Group, 'fa-plus', 'fa-eye')}
    {renderDashes(`/organization/${id}/role/add`, `/organization/${id}/role/list`, `Roles: ${r}`, Work, 'fa-plus', 'fa-eye')}
    {renderDashes(`/organization/${id}/category/add`, `/organization/${id}/files/categories`, `Folders: ${c}`, Tags, '', 'fa-eye')}
</>

const renderDashes = (a1, a2, n, fa, fa1, fa2) => <div className="col-lg-4 col-12 mOW p-0" >
    <div className="col-lg-11 col-12 oIW2">
        <div style={{ marginTop: '12px', backgroundImage: `url('${fa}')`, backgroundSize: 'contain', width: '48px', height: '48px' }} />
        <h6 className="o-n" style={dS}>{n}</h6>
        <div className="d-flex col-12">
            {fa1 && <Link to={a1}><div className={fa1} /></Link>}
            <Link to={a2}><div className={fa2} /></Link>
        </div>
    </div>
</div>