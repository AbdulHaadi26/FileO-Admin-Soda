import React, { lazy, Suspense, useEffect } from 'react';
import '../../style.css';
import { connect } from 'react-redux';
import { fetchAssigned, fetchAssignedSearch, fetchEmp, fetchEmpSearch, deleteAssignedAll } from '../../../../redux/actions/sharedFilesAction';
import Modal from '../../../containers/modalBgContainer';
import SimpleLoader from '../../../loader/simpleLoader';
const UserList = lazy(() => import('./userList'));
const AssignedList = lazy(() => import('./assignedList'));
const eS = { textAlign: 'center', marginTop: '20px', marginBottom: '20px' };
const List = ({
    id, fetchAssigned, fetchAssignedSearch, fetchEmp, fetchEmpSearch, fId, isSuc, empData, ALData, isSucA, string, string2, onhandleModal,
    limit, limit2, limitMult, limitMult2, handleS, handleS2, handleL2, handleL, handleLM2, handleLM, deleteAssignedAll, type, setType, isL
}) => {

    useEffect(() => {
        let data;
        if (type === 'Users') {
            data = { limit: 0, fId: fId, offset: 0, _id: id };
            fetchEmp(data);
        } else {
            data = { limit: 0, _id: fId };
            fetchAssigned(data);
        }

    }, [id, fId, fetchEmp, fetchAssigned, type]);

    const onhandleS = e => handleS(e.target.value);
    const onhandleS2 = e => handleS2(e.target.value);

    const handleSearch = (e, num) => {
        e.preventDefault();
        let data;
        if (Number(num) === 2) {
            data = { limit: 0, fId: fId, string: string2, offset: 0, _id: id };
            handleL(12); handleLM(0);
            string2 ? fetchEmpSearch(data) : fetchEmp(data);
        } else {
            data = { limit: 0, _id: fId, string: string };
            handleL2(12); handleLM2(0);
            string ? fetchAssignedSearch(data) : fetchAssigned(data);
        }
    };

    const fetch = (e, count, count2, num, i, j) => {
        e.preventDefault();
        let data, upgradeLimit;
        if (Number(num) === 2) {
            if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
                data = { limit: limitMult + i, fId: fId, string: string2, offset: 0, _id: id };
                upgradeLimit = limit + j;
                handleL(upgradeLimit); handleLM(data.limit);
                string2 ? fetchEmpSearch(data) : fetchEmp(data);
            }
        }
        else {
            if ((limit2 < count2 && i > 0) || (limit2 > 12 && i < 0)) {
                data = { limit: limitMult2 + i, string: string, _id: fId };
                upgradeLimit = limit2 + j;
                handleL2(upgradeLimit); handleLM2(data.limit);
                string ? fetchAssignedSearch(data) : fetchAssigned(data);
            }
        }
    }

    let count = 0, count2 = 0, list = [], listA = [];

    if (empData && empData.data) {
        count = empData.count;
        list = empData.data;
    }

    if (ALData && ALData.data) {
        count2 = ALData.count;
        listA = ALData.data;
    }

    return <Modal handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Share File</h3>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            {type !== 'Users' && <button style={{ marginBottom: '12px', marginLeft: 'auto', marginTop: '0px' }} className="btn btn-dark" onClick={e => deleteAssignedAll({ fileId: fId })}>Unshare With All</button>}
            <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                <input type="text" className="form-control" placeholder="Enter name or email" value={type === 'Users' ? string2 : string} onChange={e => type === 'Users' ? onhandleS2(e) : onhandleS(e)} onKeyPress={e => {
                    if (e.key === 'Enter') {
                        handleSearch(e, type === 'Users' ? 2 : 1)
                    }
                }} />
                <select className="custom-select col-lg-3 col-5" value={type} onChange={e => setType(e.target.value)}>
                    <option value={'Users'}>Users</option>
                    <option value={'Assigned'}>Assigned</option>
                </select>
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e, type === 'Users' ? 2 : 1)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            {type === 'Users' ? <>
                <h3 style={{ fontWeight: '600', fontSize: '14px' }}>Users</h3>
                {!isL && isSuc && list && count && count > 0 && list.length > 0 ?
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                        <Suspense fallback={<></>}>
                            <UserList list={list} count={count} id={id} fId={fId} onFetch={fetch} />
                        </Suspense>
                    </div> : !isL ? <h6 className="sh-n" style={eS}>No user found</h6> : <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
                        <SimpleLoader />
                    </div>}
            </> : <>
                    <h3 style={{ fontWeight: '600', fontSize: '14px' }}>Assigned</h3>
                    {!isL && isSucA && count2 && count2 > 0 && listA && listA.length > 0 ? <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                        <Suspense fallback={<></>}>
                            <AssignedList list={listA} count={count2} fId={fId} id={id} onFetch={fetch} />
                        </Suspense>
                    </div> : !isL ? <h6 className="sh-n" style={eS}>No user found</h6> : <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
                        <SimpleLoader />
                    </div>}

                </>}
        </div>
    </Modal>
}

const mapStateToProps = state => {
    return {
        empData: state.Employee.list,
        isSuc: state.Employee.isSuc,
        ALData: state.Employee.list2,
        isSucA: state.Employee.isSuc,
        isL: state.Employee.isL
    }
}

export default connect(mapStateToProps, { fetchAssigned, fetchAssignedSearch, fetchEmp, fetchEmpSearch, deleteAssignedAll })(List);