import React, { lazy, Suspense, Fragment } from 'react';
import { connect } from 'react-redux';
import { fetchEmp, fetchEmpSearch } from '../../../redux/actions/employeeDTActions';
import '../style.css';
import Tabnav from '../../tabnav';
const List = lazy(() => import('./item'));
const EmployeeTransfer = lazy(() => import('./empTransfer'));
const mT = { marginTop: '16px', marginLeft: '12px' };
const sT = { display: 'flex', justifyContent: 'flex-end' };

const ListUser = ({
    fetchEmp, fetchEmpSearch, id, _id, empData, isSuc, string, offsetMult, limit, tabNav, setTN,
    limitMult, handleS, handleL, handleLM, handleOFM, emp, sEmp, handleEmp, type, handleT
}) => {

    const onhandleInput = e => handleS(e.target.value);

    const handleSearch = e => {
        e.preventDefault();
        var data = { offset: 0, limit: 0, string: string, _id: id, skipId: _id, type: type.toLowerCase() };
        handleL(12); handleOFM(0); handleLM(0);
        string ? fetchEmpSearch(data) : fetchEmp(data);
    }

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, offset: offsetMult + 1, string: string, _id: id, skipId: _id, type: type.toLowerCase() };
            var upgradeLimit = limit + j;
            handleL(upgradeLimit); handleOFM(data.offset); handleLM(data.limit);
            string ? fetchEmpSearch(data) : fetchEmp(data);
        }
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const onselectEmp = (Empl) => {
        handleEmp(Empl);
        setTN(1);
    }

    var count = 0;
    var list = [];

    if (isSuc) {
        count = empData.count;
        list = empData.data;
    }

    return <div className="col-11 e-w p-0">
        <h4 className="h">User</h4>
        <Tabnav items={['Select Users', 'Transfer']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            <div style={sT}>
                <select className="form-control col-lg-2 col-4" value={type} onChange={e => handleSelect(e)} style={mT}>
                    <option data-key={'Name'}>Name</option>
                    <option data-key={'Email'}>Email</option>
                </select>
                <div className="input-group input-search" style={mT}>
                    <input type="text" className="form-control" placeholder="User name" value={string} name="string" onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                    </div>
                </div>
            </div>
            {isSuc && list && list.length > 0 && count > 0 ? <Suspense fallback={<Fragment />}> <List list={list} count={count} onFetch={fetch} selectEmp={onselectEmp} /> </Suspense> : <div width="100%"> <h6 className="e-n" width="100%" style={{ textAlign: 'center', marginTop: '50px' }}>No user found</h6> </div>}
        </>}
        {tabNav === 1 && <Suspense fallback={<></>}> <EmployeeTransfer Emp={emp} sEmp={sEmp} id={id} /> </Suspense>}
    </div>
}

const mapStateToProps = state => {
    return {
        empData: state.Employee.list,
        isErr: state.Employee.isErr,
        isSuc: state.Employee.isSuc
    }
}
export default connect(mapStateToProps, { fetchEmp, fetchEmpSearch })(ListUser);