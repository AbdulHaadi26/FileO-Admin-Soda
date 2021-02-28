import React, { lazy, Suspense, Fragment } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchRoles, fetchRolesSearch } from '../../../redux/actions/rolesAction';
import Link from 'react-router-dom/Link';
import Popover from '../../popover';
import Plus from '../../../assets/plus.svg';
import Tabnav from '../../tabnav';
const RoleList = lazy(() => import('./item'));
const dF = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' };
const mT = { marginTop: '16px' };
const eS = { textAlign: 'center', marginTop: '50p' };

const List = ({ fetchRoles, fetchRolesSearch, tabNav, setTN, id, isSuc, roleData, limit, limitMult, string, handleS, handleLM, handleL }) => {
    const onhandleInput = e => handleS(e.target.value);
    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, string: string, _id: id };
            var upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            string ? fetchRolesSearch(data) : fetchRoles(data);
        }
    }
    const handleSearch = e => {
        e.preventDefault();
        var data = { limit: 0, _id: id, string: string };
        handleL(12); handleLM(0);
        string ? fetchRolesSearch(data) : fetchRoles(data);
    }

    var list = [], count = 0;
    if (isSuc && roleData && roleData.roleList && roleData.count) {
        list = roleData.roleList;
        count = roleData.count;
    }

    return <div className="col-11 r-w p-0">
        <h4 className="h">Roles</h4>
        <Tabnav items={['Roles']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <Popover sty={{ marginRight: '6px', marginTop: '12px' }} text={'Roles are a method of providing service entitlements to persons within the organization.'} url={`https://docs.file-o.com:4242/doc/topic/9/content/0`} />
            <Link className="btn btn-dark" to={`/organization/${id}/role/add`}>Add role<div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></Link>
        </div>
        <div style={dF}>
            <div className="input-group" style={mT}>
                <input type="text" className="form-control" placeholder="Role name" value={string} name="string" onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
        {isSuc && list.length > 0 && count > 0 ? <Suspense fallback={<Fragment />}> <RoleList id={id} list={list} count={count} onFetch={fetch} /> </Suspense> : <div> <h6 className="r-n" style={eS}>No role found</h6> </div>}
    </div>
}

const mapStateToProps = state => {
    return {
        roleData: state.Role.list,
        isSuc: state.Role.isSuc
    }
}

export default connect(mapStateToProps, { fetchRoles, fetchRolesSearch })(List);