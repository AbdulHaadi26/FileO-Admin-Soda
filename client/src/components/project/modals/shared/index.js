import React, { lazy, Suspense, useEffect, useState } from 'react';
import '../../style.css';
import { connect } from 'react-redux';
import { fetchEmpA, fetchEmpSearchA, fetchEmp, fetchEmpSearch } from '../../../../redux/actions/projectActions';
import Modal from '../../../containers/modalBgContainer';
import SimpleLoader from '../../../loader/simpleLoader';
const UserList = lazy(() => import('./userList'));
const AssignedList = lazy(() => import('./assignedList'));
const eS = { textAlign: 'center', marginTop: '20px', marginBottom: '20px' };
const List = ({
    id, fetchEmpA, fetchEmpSearchA, fetchEmp, fetchEmpSearch, pId, isSuc, empData, ALData, isSucA, onhandleModal, isL
}) => {

    const [string, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [limitMult2, setLM2] = useState(0),
        [limit2, setL2] = useState(12), [string2, setS2] = useState(''), [type, setType] = useState('Users');

    useEffect(() => {
        let data;
        if (type === 'Users') {
            data = {  pId: pId, offset: 0, _id: id };
            fetchEmp(data);
        } else {
            data = { offset: 0, pId: pId };
            fetchEmpA(data);
        }

    }, [id, pId, fetchEmp, fetchEmpA, type]);

    const getList = () => {
        let data;
        if (type === 'Users') {
            data = {  pId: pId, offset: 0, _id: id };
            fetchEmp(data);
        } else {
            data = { offset: 0, pId: pId };
            fetchEmpA(data);
        }
    };

    const onhandleS = e => setS(e.target.value);
    const onhandleS2 = e => setS2(e.target.value);

    const handleSearch = (e, num) => {
        e.preventDefault();
        let data;
        if (Number(num) === 2) {
            data = { pId: pId, string: string2, offset: 0, _id: id };
            setL(12); setLM(0);
            string2 ? fetchEmpSearch(data) : fetchEmp(data);
        } else {
            data = { offset: 0, _id: pId, string: string };
            setL2(12); setLM2(0);
            string ? fetchEmpSearchA(data) : fetchEmpA(data);
        }
    };

    const fetch = (e, count, count2, num, i, j) => {
        e.preventDefault();
        let data, upgradeLimit;
        if (Number(num) === 2) {
            if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
                data = { offset: limitMult + i, pId: pId, string: string2, _id: id };
                upgradeLimit = limit + j;
                setL(upgradeLimit); setLM(data.offset);
                string2 ? fetchEmpSearch(data) : fetchEmp(data);
            }
        }
        else {
            if ((limit2 < count2 && i > 0) || (limit2 > 12 && i < 0)) {
                data = { offset: limitMult2 + i, string: string, pId: pId };
                upgradeLimit = limit2 + j;
                setL2(upgradeLimit); setLM2(data.offset);
                string ? fetchEmpSearchA(data) : fetchEmpA(data);
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
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Project Participants</h3>
        <hr />
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
                            <UserList list={list} count={count} org={id} pId={pId} getList={getList} onFetch={fetch} />
                        </Suspense>
                    </div> : !isL ? <h6 className="sh-n" style={eS}>No user found</h6> : <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
                        <SimpleLoader />
                    </div>}
            </> : <>
                    <h3 style={{ fontWeight: '600', fontSize: '14px' }}>Assigned</h3>
                    {!isL && isSucA && count2 && count2 > 0 && listA && listA.length > 0 ? <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                        <Suspense fallback={<></>}>
                            <AssignedList list={listA} count={count2} getList={getList} pId={pId} org={id} onFetch={fetch} />
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

export default connect(mapStateToProps, { fetchEmpA, fetchEmpSearchA, fetchEmp, fetchEmpSearch })(List);