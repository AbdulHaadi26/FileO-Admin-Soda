import React, { lazy, Suspense, useEffect, useState } from 'react';
import '../../style.css';
import { connect } from 'react-redux';
import { fetchAssigned, fetchAssignedSearch } from '../../../../redux/actions/sharedNotesAction';
import Modal from '../../../containers/modalBgContainer';
import SimpleLoader from '../../../loader/simpleLoader';
const AssignedList = lazy(() => import('./assignedList'));
const eS = { textAlign: 'center', marginTop: '20px', marginBottom: '20px' };
const List = ({
    id, fetchAssigned, fetchAssignedSearch, nId, ALData, isSucA, onhandleModal, isTask, isL, isShow
}) => {

    const [string, setS] = useState(''), [limitMult2, setLM2] = useState(0),
        [limit2, setL2] = useState(12);

    useEffect(() => {
        let data;
        data = {
            limit: 0, _id: nId
        };
        fetchAssigned(data);
    }, [id, nId, fetchAssigned]);

    const onhandleS = e => setS(e.target.value);

    const handleSearch = (e) => {
        e.preventDefault();
        let data;
        data = { limit: 0, _id: nId, string: string };
        setL2(12); setLM2(0);
        string ? fetchAssignedSearch(data) : fetchAssigned(data);
    };

    const fetch = (e, count, count2, num, i, j) => {
        e.preventDefault();
        let data, upgradeLimit;
        if ((limit2 < count2 && i > 0) || (limit2 > 12 && i < 0)) {
                data = { limit: limitMult2 + i, string: string, _id: nId };
                upgradeLimit = limit2 + j;
                setL2(upgradeLimit); setLM2(data.limit);
                string ? fetchAssignedSearch(data) : fetchAssigned(data);
            }
    }

    let count2 = 0, listA = [];


    if (ALData && ALData.data) {
        count2 = ALData.count;
        listA = ALData.data;
    }

    return <Modal handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Transfer {isTask ? 'Task' : 'Note'}</h3>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            <div className="input-group" style={{ width: '100%'}}>
                <input type="text" className="form-control" placeholder="Enter name or email" value={string} onChange={e => onhandleS(e)} onKeyPress={e => {
                    if (e.key === 'Enter') {
                        handleSearch(e)
                    }
                }} />
            </div>
        </div>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            <h3 style={{ fontWeight: '600', fontSize: '14px' }}>Users</h3>
            {!isL && isSucA && count2 && count2 > 0 && listA && listA.length > 0 ? <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                <Suspense fallback={<></>}>
                    <AssignedList isTask={isTask} list={listA} count={count2} nId={nId} id={id} onFetch={fetch} onhandleModal={e => onhandleModal(e)} />
                </Suspense>
            </div> : !isL ? <h6 className="sh-n" style={eS}>No user found</h6> : <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
                <SimpleLoader />
            </div>}
        </div>
    </Modal>
}

const mapStateToProps = state => {
    return {
        ALData: state.Employee.list2,
        isSucA: state.Employee.isSuc,
        isL: state.Employee.isL
    }
};

export default connect(mapStateToProps, { fetchAssigned, fetchAssignedSearch })(List);