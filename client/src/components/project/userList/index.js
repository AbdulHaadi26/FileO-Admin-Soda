import React, { lazy, Suspense, Fragment, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchEmp, fetchEmpSearch } from '../../../redux/actions/projectActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import Tabnav from '../../tabnav';
const EmployeeList = lazy(() => import('./item'));
const mT = { marginTop: '16px' };
const dF = { display: 'flex', justifyContent: 'flex-end' };
const eS = { textAlign: 'center', marginTop: '50px' };
const UserList = ({
    empData, isSuc, fetchEmp, fetchEmpSearch, id, pId, string, limit, Project,
    limitMult, offsetMult, handleS, handleL, handleLM, handleOFM, tabNav, setTN
}) => {
    const [ordC, setOC] = useState(0);
    
    const onhandleInput = e => handleS(e.target.value);

    const handleSearch = e => {
        e.preventDefault();
        var data = { offset: 0, limit: 0, string: string, _id: id, pId: pId };
        handleOFM(0); handleLM(0); handleL(12);
        string ? fetchEmpSearch(data) : fetchEmp(data);
    }

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, offset: offsetMult + 1, string: string, _id: id, pId: pId };
            var upgradeLimit = limit + j;
            handleL(upgradeLimit); handleOFM(data.offset); handleLM(data.limit);
            string ? fetchEmpSearch(data) : fetchEmp(data);
        }
    }

    var count = 0;
    var list = [];

    if (isSuc) {
        count = empData.count;
        list = empData.data;
    }

    return <div className="col-11 p-w p-0">
        <h4 className="h">{Project && Project.project && Project.project.name ? Project.project.name : ''}</h4>
        <Tabnav items={['Users']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <div className="input-group input-search" style={mT}>
                <input type="text" className="form-control" placeholder="User name" value={string} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
        <div style={dF}>
        <div className={`order ${ordC >= 2 ? 'orderA' : ''}`} onClick={e => setOC(ordC === 0 ? 1 : 0)}>
                <img src={ordC === 1 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Name</span>
            </div>
        </div>
        {isSuc && list.length > 0 && count > 0 ? <Suspense fallback={<Fragment />}><EmployeeList list={list} count={count} ord={ordC} id={id} pId={pId} onFetch={fetch} /> </Suspense> : <div><h6 className="e-n" style={eS}>No user found</h6></div>}
    </div>
}

const mapStateToProps = state => {
    return {
        empData: state.Employee.list,
        isSuc: state.Employee.isSuc,
        Project: state.Project.data
    }
}

export default connect(mapStateToProps, { fetchEmp, fetchEmpSearch })(UserList);