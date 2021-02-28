import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchRoles, fetchRolesSearch } from '../../../redux/actions/project_rolesAction';
import Link from 'react-router-dom/Link';
import Popover from '../../popover';
import Plus from '../../../assets/plus.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import Tabnav from '../../tabnav';
const RoleList = lazy(() => import('./item'));
const dF = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' };
const mT = { marginTop: '16px' };
const eS = { textAlign: 'center', marginTop: '50px' };
const List = ({ fetchRoles, fetchRolesSearch, pId, isSuc, roleData, id, limit, limitMult, string, handleS, handleL, handleLM, tabNav, setTN }) => {
    const [ord, setO] = useState(0);

    const onhandleInput = e => handleS(e.target.value);

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, string: string, _id: pId };
            var upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            string ? fetchRolesSearch(data) : fetchRoles(data);
        }
    }

    const handleSearch = e => {
        e.preventDefault();
        var data = { limit: 0, _id: pId, string: string };
        handleLM(0); handleL(12);
        string ? fetchRolesSearch(data) : fetchRoles(data);
    }

    var list = [], count = 0;
    if (isSuc && roleData && roleData.roleList && roleData.count) {
        list = roleData.roleList;
        count = roleData.count;
    }

    return <div className="col-11 r-w p-0">
        <h4 className="h">Role</h4>
        <Tabnav items={['Roles']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <Popover sty={{ marginRight: '6px', marginTop: '12px' }} text={'Project roles are a method of providing service entitlements to persons within the specific project.'} url={`https://docs.file-o.com:4242/doc/topic/9/content/0`} />
            <Link className="btn btn-dark" to={`/organization/${id}/projects/${pId}/role/add`}>Add role<div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></Link>
        </div>
        <div style={dF}>
            <div className="input-group" style={mT}>
                <input type="text" className="form-control" placeholder="Role name" value={string} name="string" onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
        <div style={dF}>
            <div className={`order ${ord < 2 ? 'orderA' : ''}`} onClick={e => setO(ord === 0 ? 1 : 0)}>
                <img src={ord === 1 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Name</span>
            </div>
        </div>
        {isSuc && list.length > 0 && count > 0 ? <Suspense fallback={<></>}> <RoleList id={id} list={list} pId={pId} ord={ord} count={count} onFetch={fetch} /> </Suspense> : <div><h6 className="r-n" style={eS}>No role found</h6></div>}
    </div>
}

const mapStateToProps = state => {
    return {
        roleData: state.Role.list,
        isSuc: state.Role.isSuc
    }
}

export default connect(mapStateToProps, { fetchRoles, fetchRolesSearch })(List);