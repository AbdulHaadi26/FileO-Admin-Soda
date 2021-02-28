import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { deletePlan, fetchPlans, fetchPlansSearch, registerPlan } from '../../../redux/actions/planActions';
import Plus from '../../../assets/plus.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import '../style.css';
import Tabnav from '../../tabnav';
import AddPlan from '../modals/addPlan';
import EditPlan from '../modals/editPlans';
import DeleteModal from '../../containers/deleteContainer';
const List = lazy(() => import('./planList'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '16px' };
const eT = { textAlign: 'center', marginTop: '50px', width: '100%' };

const ListNote = ({
    fetchPlans, fetchPlansSearch, org, _id, isSuc, planData, string, limit, limitMult, handleS, handleLM, handleL, tabNav, setTN, registerPlan,
    isList, setISL, getList, deletePlan
}) => {

    const [ord, setO] = useState(0), [modalAdd, setMA] = useState(false), [del, setDel] = useState(false), [tempPlan, setTP] = useState(false);

    const handleSearch = e => {
        e.preventDefault();
        let data = { limit: 0, _id: _id, string: string };
        handleL(12); handleLM(0);
        string ? fetchPlansSearch(data) : fetchPlans(data);
    }

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            let data = { limit: limitMult + i, string: string, _id: _id };
            let upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            string ? fetchPlansSearch(data) : fetchPlans(data);
        }
    }

    const handleAdd = (text, date) => {
        let data = { name: text, org: org, _id: _id, date };
        registerPlan(data);
    }

    var list = [], count = 0;

    if (isSuc && planData.planList && planData.count) {
        list = planData.planList;
        count = planData.count
    }

    return <div className="col-11 nt-w p-0">
        <h4 className="h">My Plans</h4>
        <Tabnav items={['Plans']} i={tabNav} setI={setTN} />

        {tabNav === 0 && <>
            <div style={dF}>
                <button className="btn btn-dark" onClick={e => setMA(true)}>Add Plan <div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></button>
            </div>
            <div style={dF}>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Plan title" value={string} onChange={e => handleS(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                    </div>
                </div>
            </div>
            <div style={dF}>
                <div className={`order ${ord < 2 ? 'orderA' : ''}`} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                    <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                    <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order`} style={{ padding: '6px' }} onClick={e => setISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
            </div>
            {isSuc && list && list.length > 0 && count ? <Suspense fallback={<></>}>
                <List isList={isList} id={org} _id={_id} ord={ord} count={count} list={list} onFetch={fetch} setEP={setTP} setDel={setDel} />
            </Suspense> : <div> <h6 className="cat-name" style={eT}> No plans found</h6></div>}
            {modalAdd && <AddPlan onhandleAdd={(text, date) => handleAdd(text, date)} onhandleModal={e => setMA(false)} />}
            {tempPlan && <EditPlan getList={getList} Plan={tempPlan} onhandleModal={e => setTP(false)} />}
            {del && <DeleteModal handleModalDel={e => setDel(false)} handleDelete={async e => {
                let data = { _id: del, skip: true };
                await deletePlan(data);
                getList();
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}
        </>}
    </div>
}

const mapStateToProps = state => {
    return {
        planData: state.Plan.list,
        isSuc: state.Plan.isSuc,
    }
}

export default connect(mapStateToProps, { fetchPlans, fetchPlansSearch, registerPlan, deletePlan })(ListNote);