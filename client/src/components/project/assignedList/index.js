import React, { lazy, Suspense, Fragment, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchEmpA, fetchEmpSearchA } from '../../../redux/actions/projectActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import Tabnav from '../../tabnav';
const EmployeeList = lazy(() => import('./item'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '16px' };
const eS = { textAlign: 'center', marginTop: '50px' };

const List = ({
    fetchEmpA, fetchEmpSearchA, id, pId, empData, isSuc, string, limit, setTN,
    limitMult, offsetMult, handleS, handleL, handleLM, handleOFM, tabNav, Project
}) => {
    const [ord, setO] = useState(0);

    const onhandleInput = e => handleS(e.target.value);

    const handleSearch = e => {
        e.preventDefault();
        var data = { offset: 0, limit: 1, string: string, _id: id, pId };
        handleOFM(0); handleLM(0); handleL(12);
        string ? fetchEmpSearchA(data) : fetchEmpA(data);
    }

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, offset: offsetMult + 1, string: string, _id: id, pId: pId };
            var upgradeLimit = limit + j;
            handleOFM(data.offset); handleL(upgradeLimit); handleLM(data.limit);
            string ? fetchEmpSearchA(data) : fetchEmpA(data);
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
        <Tabnav items={['Assigned User']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <div className="input-group input-search" style={mT}>
                <input type="text" className="form-control" placeholder="User name" value={string} name="string" onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
        <div style={dF}>
            <div className={`order ${ord >= 2 ? 'orderA' : ''}`} onClick={e => setO(ord === 0 ? 1 : 0)}>
                <img src={ord === 1 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Name</span>
            </div>
        </div>
        {isSuc && list.length > 0 && count > 0 ? <Suspense fallback={<Fragment />}><EmployeeList list={list} count={count} pId={pId} id={id} onFetch={fetch} ord={ord} /> </Suspense> :
            <div> <h6 className="e-n" style={eS}>No user found</h6> </div>}
    </div>
}

const mapStateToProps = state => {
    return {
        empData: state.Employee.list,
        isSuc: state.Employee.isSuc,
        Project: state.Project.data
    }
}

export default connect(mapStateToProps, { fetchEmpA, fetchEmpSearchA })(List);