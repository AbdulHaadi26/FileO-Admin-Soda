import React, { lazy, Suspense, useEffect, useState } from 'react';
import '../../style.css';
import { connect } from 'react-redux';
import { fetchAssigned, fetchAssignedSearch, fetchEmp, fetchEmpSearch, removeEmpAll, registerEmpAll } from '../../../../redux/actions/categoryActions';
import Modal from '../../../containers/modalBgContainer';
import SimpleLoader from '../../../loader/simpleLoader';
const UserList = lazy(() => import('./userList'));
const AssignedList = lazy(() => import('./assignedList'));
const eS = { textAlign: 'center', marginTop: '20px', marginBottom: '20px' };
const List = ({
    fetchAssigned, fetchAssignedSearch, fetchEmp, fetchEmpSearch, cId, isSuc, empData, ALData, isSucA, onhandleModal, isL, removeEmpAll, registerEmpAll
}) => {
    const [string, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [limitMult2, setLM2] = useState(0),
        [limit2, setL2] = useState(12), [string2, setS2] = useState(''), [type, setType] = useState('Users'), [All, setAll] = useState(false),
        [removeAll, setRAll] = useState(false);

    useEffect(() => {
        let data;
        if (type === 'Users') {
            data = { offset: 0, _id: cId };
            fetchEmp(data);
        } else {
            data = { limit: 0, _id: cId };
            fetchAssigned(data);
        }

    }, [cId, fetchEmp, fetchAssigned, type]);

    const onhandleS = e => setS(e.target.value);
    const onhandleS2 = e => setS2(e.target.value);

    const getList = () => {
        let data;
        if (type === 'Users') {
            data = { offset: 0, _id: cId };
            fetchEmp(data);
        } else {
            data = { limit: 0, _id: cId };
            fetchAssigned(data);
        }
    };

    const handleSearch = (e, num) => {
        e.preventDefault();
        let data;
        if (Number(num) === 2) {
            data = { string: string2, offset: 0, _id: cId };
            setL(12); setLM(0);
            string2 ? fetchEmpSearch(data) : fetchEmp(data);
        } else {
            data = { limit: 0, _id: cId, string: string };
            setL2(12); setLM2(0);
            string ? fetchAssignedSearch(data) : fetchAssigned(data);
        }
    };

    const fetch = (e, count, count2, num, i, j) => {
        e.preventDefault();
        let data, upgradeLimit;
        if (Number(num) === 2) {
            if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
                data = { limit: limitMult + i, string: string2, offset: 0, _id: cId };
                upgradeLimit = limit + j;
                setL(upgradeLimit); setLM(data.limit);
                string2 ? fetchEmpSearch(data) : fetchEmp(data);
            }
        }
        else {
            if ((limit2 < count2 && i > 0) || (limit2 > 12 && i < 0)) {
                data = { limit: limitMult2 + i, string: string, _id: cId };
                upgradeLimit = limit2 + j;
                setL2(upgradeLimit); setLM2(data.limit);
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
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Folder Access</h3>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            {!removeAll && <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <h6 className="mr-auto" style={{ fontWeight: '400' }}>Share with all</h6>
                <div className="form-switch">
                    <input type="checkbox" style={{ marginTop: '-12px' }}
                        onChange={e => setAll(e.target.checked)}
                        className="form-check-input"
                    />
                </div>
            </div>}
            {!All && <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <h6 className="mr-auto" style={{ fontWeight: '400' }}>Un-share with all</h6>
                <div className="form-switch">
                    <input type="checkbox" style={{ marginTop: '-12px' }}
                        onChange={e => setRAll(e.target.checked)}
                        className="form-check-input"
                    />
                </div>
            </div>}
        </div>
        {!All && !removeAll && <>
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                    <input type="text" className="form-control" placeholder="Enter name or email" value={type === 'Users' ? string2 : string} onChange={e => type === 'Users' ? onhandleS2(e) : onhandleS(e)} onKeyPress={e => {
                        if (e.key === 'Enter') {
                            handleSearch(e, type === 'Users' ? 2 : 1)
                        }
                    }} />
                    <select className="custom-select col-lg-3 col-5" value={type} onChange={e => setType(e.target.value)}>
                        <option value={'Users'}>Share To</option>
                        <option value={'Assigned'}>Shared With</option>
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
                                <UserList list={list} count={count} cId={cId} getList={getList} onFetch={fetch} />
                            </Suspense>
                        </div> : !isL ? <h6 className="sh-n" style={eS}>No user found</h6> : <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
                            <SimpleLoader />
                        </div>}
                </> : <>
                        <h3 style={{ fontWeight: '600', fontSize: '14px' }}>Assigned</h3>
                        {!isL && isSucA && count2 && count2 > 0 && listA && listA.length > 0 ? <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                            <Suspense fallback={<></>}>
                                <AssignedList list={listA} count={count2} cId={cId} getList={getList} onFetch={fetch} />
                            </Suspense>
                        </div> : !isL ? <h6 className="sh-n" style={eS}>No user found</h6> : <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
                            <SimpleLoader />
                        </div>}

                    </>}
            </div>
        </>}
        {(All || removeAll) && <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
            <button className="btn btn-primary" type="button" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={async e => {
                if (All) registerEmpAll({ cId });
                else if (removeAll) removeEmpAll({ cId });
                onhandleModal();
            }}>Done</button>
        </div>}
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

export default connect(mapStateToProps, { fetchAssigned, fetchAssignedSearch, fetchEmp, fetchEmpSearch, registerEmpAll, removeEmpAll })(List);