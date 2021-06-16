import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import Tabnav from '../../tabnav';
import AddPoll from '../modals/addPoll';
import EditPoll from '../modals/editPoll';
import SubmitPollM from '../modals/submitPoll';
import DeleteModal from '../../containers/deleteContainer';
import '../style.css';
import GPolling from '../../../assets/tabnav/G-Polling.svg';
import BPolling from '../../../assets/tabnav/B-Polling.svg';
import 'react-calendar/dist/Calendar.css';
import { fetchPolls, registerPoll, deletePoll, SubmitPoll, UpdatePoll } from '../../../redux/actions/pollActions';
import Searchbar from '../../searchbarReusable';
let icons = [{ G: GPolling, B: BPolling }];
const List = lazy(() => import('./pollList'));
const mT = { marginTop: '16px' };
const eT = {
    textAlign: 'center',
    marginTop: '50px',
    width: '100%'
};

const ListNote = ({
    fetchPolls, registerPoll, org, _id, planData, string, handleS, tabNav, setTN,
    isList, deletePoll, disabled, auth, profile, SubmitPoll, UpdatePoll
}) => {

    const [ord, setO] = useState(0), [modalAdd, setMA] = useState(false), [del, setDel] = useState(false), [tempPlan, setTP] = useState(false), [pollItem, setPT] = useState(false);

    const handleSearch = e => {
        e.preventDefault();
        let data = { auth, string };
        fetchPolls(data);
    };

    const handleAdd = (name, date, description, questions) => {
        let data = { name, end_date: date, description, questions };
        registerPoll(data);
    };


    const handleUpt = (_id, name, date, description, questions) => {
        setTP(false);
        let data = { _id, name, date, description, questions };
        UpdatePoll(data);
    };

    const handleSubmit = (_id, questions) => {
        setPT(false);
        SubmitPoll({ _id, questions });
    };

    let list = [];

    list = planData;

    return <div className="col-11 nt-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Polling</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={auth} classN={auth ? `col-lg-7 col-12` : 'col-lg-4 col-12'} pad={!auth} value={string} onHandleInput={val => handleS(val)}
                callFunc={e => !disabled && setMA(true)} isElp={false}
                holder={'Poll title'} handleSearch={e => handleSearch(e)} />
            <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ marginLeft: '12px', marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                    <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order mTHS ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                    <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
            </div>
        </div>
        <Tabnav items={['Polls']} i={tabNav} setI={setTN} icons={icons} />
        {tabNav === 0 && <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {list && list.length > 0 ?
                    <Suspense fallback={<></>}>
                        <List id={org} _id={_id} auth={auth} ord={ord}
                            list={list} setEP={setTP} setDel={setDel}
                            setPT={setPT}
                        />
                    </Suspense> :
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <h6 className="cat-name" style={eT}> No polls found</h6></div>}
            </div>

            {modalAdd && <AddPoll onhandleAdd={(name, date, description, questions) => handleAdd(name, date, description, questions)} onhandleModal={e => setMA(false)} />}

            {tempPlan && <EditPoll Poll={tempPlan} onhandleAdd={(name, date, description, questions) => handleUpt(tempPlan._id, name, date, description, questions)} onhandleModal={e => setTP(false)} />}

            {pollItem && <SubmitPollM userId={profile._id} Poll={pollItem} onhandleAdd={(_id, questions) => handleSubmit(_id, questions)} onhandleModal={e => setPT(false)} />}

            {del && <DeleteModal handleModalDel={e => setDel(false)} handleDelete={async e => {
                let data = { _id: del };
                await deletePoll(data);
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

        </>}
    </div>
}

const mapStateToProps = state => {
    return {
        planData: state.Poll.list,
    }
};

export default connect(mapStateToProps, { fetchPolls, registerPoll, deletePoll, SubmitPoll, UpdatePoll })(ListNote);