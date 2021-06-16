import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { deletePlan, fetchPlans, fetchPlansSearch, registerPlan } from '../../../redux/actions/planActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import AddPlan from '../modals/addPlan';
import EditPlan from '../modals/editPlans';
import DeleteModal from '../../containers/deleteContainer';
import '../style.css';
import GPlan from '../../../assets/tabnav/G-my plan.svg';
import BPlan from '../../../assets/tabnav/B-my plan.svg';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import DailyPlan from '../modals/dailyPlan';
import Searchbar from '../../searchbarReusable';
import { getPlanAll, getPlanD } from '../../../redux/actions/dailyPlanActions';
let icons = [{ G: GPlan, B: BPlan }];
const List = lazy(() => import('./planList'));
const mT = { marginTop: '16px' };
const eT = {
    textAlign: 'center',
    marginTop: '50px',
    width: '100%'
};

const ListNote = ({
    fetchPlans, fetchPlansSearch, org, _id, planData, string, limit, limitMult, handleS, handleLM, handleL, tabNav, setTN, registerPlan,
    isList, setISL, deletePlan, type, handleType, due, handleDue, getPlanD, PlanList, getPlanAll, disabled
}) => {

    const [ord, setO] = useState(0), [modalAdd, setMA] = useState(false), [del, setDel] = useState(false), [tempPlan, setTP] = useState(false);

    const [value, setDateV] = useState(''), [dateC, setDateC] = useState(''), [activeDate, setADate] = useState(new Date(Date.now()));


    const checkTile = ({ date }) => {
        let tempDate = new Date(date);
        tempDate = tempDate.toISOString().substring(0, 10);
        let iT = false;

        if (PlanList && PlanList.length > 0) {
            PlanList.map(i => {

                if (i.date === tempDate) {
                    iT = true;
                }
                return i;
            });

            return iT ? <div style={{ width: '6px', height: '6px', backgroundColor: 'blue', borderRadius: '1000px', marginLeft: 'auto', marginRight: 'auto' }}></div> : '';
        }

        return '';
    };

    const setActiveDate = ({ activeStartDate }) => {
        let today = new Date(activeStartDate);

        let month = today.getMonth();
        let year = today.getFullYear();

        setADate(today);

        getPlanAll({ month, year });
    };

    const setVal = date => {
        if (date) {
            let tempDate = date;
            tempDate = tempDate.toISOString().substring(0, 10);
            setDateV(tempDate);
            getPlanD({ date: tempDate });
        } else setDateV('');
        setDateC(date);
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = { limit: 0, _id: _id, string: string, type, due };
        handleL(12); handleLM(0);
        string ? fetchPlansSearch(data) : fetchPlans(data);
    };

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            let data = { limit: limitMult + i, string: string, _id: _id, type, due };
            let upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            string ? fetchPlansSearch(data) : fetchPlans(data);
        }
    };

    const handleAdd = (text, date) => {
        let data = { name: text, org: org, _id: _id, date };
        registerPlan(data);
    };

    let list = [], count = 0;

    if (planData.planList && planData.count) {
        list = planData.planList;
        count = planData.count
    }

    const handleSelectT = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleType(e.target.options[selectedIndex].getAttribute('data-name'));
    };

    const handleSelectD = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleDue(e.target.options[selectedIndex].getAttribute('data-name'));
    };

    return <div className="col-11 nt-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">My Plans</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={true} classN={true ? `col-lg-7 col-12` : 'col-lg-5 col-12'} isInput={type === 'To Do Date'} pad={true} value={string} onHandleInput={val => handleS(val)}
                callFunc={e => !disabled && setMA(true)}
                holder={'Enter text here'} handleSearch={e => handleSearch(e)} comp={<>
                     {type === 'To Do Date' && <>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className="custom-select col-5" onChange={e => handleSelectD(e)} value={due}>
                            {['Due', 'Over Due', 'Due Today', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due Next Month'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                        </select>
                    </>}
                    <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                    <select className={`custom-select ${type === 'To Do Date' ? 'col-5' : 'col-3'}`} onChange={e => handleSelectT(e)} value={type}>
                        {['Name', 'To Do Date'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                    </select>
                </>}>
            </Searchbar>
            <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ marginLeft: '12px', marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                    <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order mTHS ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                    <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order mTHS`} style={{ padding: '6px', marginTop: '0px' }} onClick={e => setISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
            </div>
        </div>
        <Tabnav items={['Plans']} i={tabNav} setI={setTN} icons={icons} />
        {tabNav === 0 && <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <div className="col-lg-5 col-12" style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', alignItems: 'center' }}>
                    <h6 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px' }}>Weekly Plan</h6>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {list && list.length > 0 && count ?
                            <Suspense fallback={<></>}>
                                <List isList={isList} id={org} _id={_id} ord={ord} count={count}
                                    list={list} onFetch={fetch} setEP={setTP} setDel={setDel}
                                />
                            </Suspense> :
                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <h6 className="cat-name" style={eT}> No plans found</h6></div>}
                    </div>
                </div>
                <div className="col-lg-1 col-12 hide" style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '2px', height: '80%', backgroundColor: '#dfe6e9' }}></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }} className="col-lg-5 col-12">
                    <h6 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>Daily Plan</h6>
                    <Calendar
                        onActiveStartDateChange={setActiveDate}
                        tileContent={checkTile}
                        onChange={setVal}
                        value={dateC}
                    />
                </div>
            </div>

            {modalAdd && <AddPlan onhandleAdd={(text, date) => handleAdd(text, date)} onhandleModal={e => setMA(false)} />}

            {tempPlan && <EditPlan Plan={tempPlan} onhandleModal={e => setTP(false)} />}

            {del && <DeleteModal handleModalDel={e => setDel(false)} handleDelete={async e => {
                let data = { _id: del, skip: true };
                await deletePlan(data);
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {value && <DailyPlan disabled={disabled} onhandleModal={e => {
                setVal('');
                let month = activeDate.getMonth();
                let year = activeDate.getFullYear();

                getPlanAll({ month, year });

            }} date={value} />}
        </>}
    </div>
}

const mapStateToProps = state => {
    return {
        planData: state.Plan.list,
        PlanList: state.PlanD.listP,
        isL: state.PlanD.isL
    }
};

export default connect(mapStateToProps, { fetchPlans, fetchPlansSearch, registerPlan, deletePlan, getPlanD, getPlanAll })(ListNote);