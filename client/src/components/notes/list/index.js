import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import {
    fetchNotes,
    fetchNotesSearch,
    deleteNote,
    convertNote,
    deleteTask
} from '../../../redux/actions/noteActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Searchbar from '../../searchbarReusable';
import Tabnav from '../../tabnav';
import {
    fetchAttachment
} from '../../../redux/actions/userFilesActions';
import {
    fetchTasks,
    fetchTasksSearch
} from '../../../redux/actions/taskActions';
import {
    deleteAttachment
} from '../../../redux/actions/noteActions';
import DeleteModal from '../../containers/deleteContainer';
import history from '../../../utils/history';
import Assigned from '../modals/shared';
import AssignedT from '../modals/sharedT';
import AssignedA from '../modals/sharedA';
import AssignedTA from '../modals/sharedTA';
import NOwnership from '../modals/transferOwnership';
import TOwnership from '../modals/transferOwnershipT';
import '../style.css';
import BNote from '../../../assets/tabnav/B-notes.svg';
import GNote from '../../../assets/tabnav/G-notes.svg';
import BTask from '../../../assets/tabnav/B-Team Task.svg';
import GTask from '../../../assets/tabnav/G-Team task.svg';
import BAttach from '../../../assets/tabnav/B-attachment.svg';
import GAttach from '../../../assets/tabnav/G-attachment.svg';
let icons = [
    { G: GNote, B: BNote },
    { G: GTask, B: BTask },
    { G: GAttach, B: BAttach }
];
const List = lazy(() => import('../noteList'));
const FileList = lazy(() => import('./fileList'));
const ListT = lazy(() => import('../taskList'));
const eS = {
    marginTop: '50px',
    width: '100%',
    textAlign: 'center'
};
const eT = {
    textAlign: 'center',
    marginTop: '50px',
    width: '100%'
};

const ListNote = ({
    fetchNotes, fetchNotesSearch, org, _id, noteData, string, limit, limitMult, handleS, handleLM, handleL, tabNav, isList, handleISL,
    fileData, isSucF, type, handleT, fetchAttachment, string2, handleS2, noteC, taskC, deleteNote, deleteAttachment, convertNote,
    handleTypeT, handleStatus, status, typeT, handleST, stringT, taskData, due, handleDue, limitMultT, handleLMT, handleLT, limitT,
    fetchTasks, fetchTasksSearch, handleTypeN, typeN, deleteTask, disabled
}) => {

    const [ord, setO] = useState(0), [ordF, setOF] = useState(0), [ordT, setOT] = useState(0), [noteS, setNS] = useState(false), [modalDel, setNI] = useState(false),
        [modalCon, setCN] = useState(false), [modalDelF, setDI] = useState(false), [modalDelC, setNIC] = useState(false), [taskS, setNST] = useState(false),
        [PT, setPT] = useState(false), [tFN, setTFN] = useState(false), [tFT, setTFT] = useState(false);

    const handleSearch = e => {
        e.preventDefault();
        let data = {
            limit: 0, _id: _id, string: string, search: typeN
        };
        handleL(12); handleLM(0);
        string ? fetchNotesSearch(data) : fetchNotes(data);
    };

    const handleSearchF = e => {
        e.preventDefault();
        let data = { type: type === 'All' ? 'All' : type.toLowerCase(), string: string2 };
        fetchAttachment(data);
    };

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            let data = { limit: limitMult + i, string: string, _id: _id, search: typeN };
            let upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            string ? fetchNotesSearch(data) : fetchNotes(data);
        }
    };

    const fetchT = (e, count, i, j) => {
        e.preventDefault();
        if ((limitT < count && i > 0) || (limitT > 12 && i < 0)) {
            let data = { limit: limitMultT + i, string: stringT, _id: _id, type: typeT, status, due };
            let upgradeLimit = limitT + j;
            handleLT(upgradeLimit); handleLMT(data.offset);
            stringT ? fetchTasksSearch(data) : fetchTasks(data);
        }
    };

    const handleSearchT = e => {
        e.preventDefault();
        let data = { offset: 0, _id: _id, string: stringT, type: typeT, status, due };
        handleLT(12); handleLMT(0);
        stringT ? fetchTasksSearch(data) : fetchTasks(data);
    };

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSelectT = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleTypeT(e.target.options[selectedIndex].getAttribute('data-name'));
    };

    const handleSelectN = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleTypeN(e.target.options[selectedIndex].getAttribute('data-name'));
    };

    const handleSelectT2 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleStatus(e.target.options[selectedIndex].getAttribute('data-name'));
    };

    const handleSelectD = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleDue(e.target.options[selectedIndex].getAttribute('data-name'));
    };

    var list = [], count = 0;

    if (noteData && noteData.noteList && noteData.count) {
        list = noteData.noteList;
        count = noteData.count
    } else {
        list = [];
        count = 0;
    }

    var listF = [];

    if (isSucF && fileData) {
        listF = fileData.files;
    }

    var listT = [], countT = 0;

    if (taskData && taskData.noteList && taskData.count) {
        listT = taskData.noteList;
        countT = taskData.count
    };

    const setTNCheck = i => {
        history.push(`/organization/${org}/myspace/user/${_id}/notes/list/page/${i}`);
    };

    return <div className="col-11 nt-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Team Up</h4>
            <div style={{ marginLeft: 'auto' }} />

            {tabNav === 0 && <>
                <Searchbar isCreate={true} classN={true ? `col-lg-7 col-12` : 'col-lg-4 col-12'} pad={true} value={string} onHandleInput={val => handleS(val)}
                    callFunc={e => !disabled && history.push(`/organization/${org}/myspace/user/${_id}/notes/add`)}
                    holder={'Enter text here'} handleSearch={e => handleSearch(e)} comp={<>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className={`custom-select col-3`} onChange={e => handleSelectN(e)} value={typeN}>
                            {['All', 'Updated'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                        </select>
                    </>}>
                </Searchbar>
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', marginLeft: '12px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                        <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                        <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                    <div className={`order mTHS`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                        <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                    </div>
                </div>
            </>}
            {tabNav === 1 && <>
                <Searchbar isCreate={true} classN={true ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={true} isInput={typeT === 'Status' || typeT === 'Due Date'} value={stringT}
                    handleSearch={e => handleSearchT(e)} onHandleInput={val => handleST(val)} holder={'Enter text here'} 
                    callFunc={e => !disabled && history.push(`/organization/${org}/myspace/user/${_id}/tasks/add`)} comp={<>
                        {typeT === 'Status' && <>
                            <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                            <select className="custom-select col-5" onChange={e => handleSelectT2(e)} value={status}>
                                {['All', 'Open', 'In Progress', 'On Hold', 'Completed', 'Closed'].map((i, k) => <option value={i} key={k} data-name={i}>{i}</option>)}
                            </select>
                        </>}
                        {typeT === 'Due Date' && <>
                            <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                            <select className="custom-select col-5" onChange={e => handleSelectD(e)} value={due}>
                                {['Due', 'Over Due', 'Due Today', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due Next Month'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                            </select>
                        </>}
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className={`custom-select ${(typeT === 'Status' || typeT === 'Due Date') ? 'col-5' : 'col-4'}`} onChange={e => handleSelectT(e)} value={typeT}>
                            {['Name', 'Due Date', 'Status', 'Updated'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                        </select>
                    </>} />
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ordT < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', marginLeft: '12px' }} onClick={e => setOT(ordT >= 2 ? 0 : ordT === 0 ? 1 : 0)}>
                        <img src={ordT === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ordT >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setOT(ordT < 2 ? 2 : ordT === 2 ? 3 : 2)}>
                        <img src={ordT === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                    <div className={`order mTHS`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                        <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                    </div>
                </div>
            </>}
            {tabNav === 2 && <>
                <Searchbar isCreate={false} classN={true ? `col-lg-5 col-12` : 'col-lg-4 col-12'} pad={true} value={string2} onHandleInput={val => handleS2(val)}
                    holder={'Enter text here'} handleSearch={e => handleSearchF(e)} comp={<>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className={`custom-select col-3`} onChange={e => handleSelect(e)} value={type}>
                            <option data-key={'All'} value="All">All</option>
                            <option data-key={'Video'} value="Video">Video</option>
                            <option data-key={'Audio'} value="Audio">Audio</option>
                        </select>
                    </>}>
                </Searchbar>
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ordF < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', marginLeft: '12px' }} onClick={e => setOF(ordF >= 2 ? 0 : ordF === 0 ? 1 : 0)}>
                        <img src={ordF === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ordF >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setOF(ordF < 2 ? 2 : ordF === 2 ? 3 : 2)}>
                        <img src={ordF === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                    <div className={`order mTHS`} onClick={e => handleISL(!isList)} style={{ marginTop: '0px' }}>
                        <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                    </div>
                </div>
            </>}
        </div>
        <Tabnav items={['Team Notes', 'Team Tasks', 'Attachments']} count={[noteC, taskC, 0]} i={tabNav} setI={setTNCheck} icons={icons} />

        {tabNav === 0 && <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {list && list.length > 0 && count ? <Suspense fallback={<></>}>
                    <List id={org} _id={_id} isList={isList} setNI={setNI}
                        setNS={setNS} setCN={setCN} ord={ord} count={count}
                        list={list} onFetch={fetch} setPT={setPT} setTFN={setTFN}
                    />
                </Suspense> :
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <h6 className="cat-name" style={eT}> No notes found</h6>
                    </div>}
            </div>
        </>}

        {tabNav === 1 && <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {listT && listT.length > 0 && countT ? <Suspense fallback={<></>}>
                    <ListT id={org} isList={isList} _id={_id} ord={ordT} count={countT}
                        list={listT} onFetch={fetchT} setNI={setNIC} setNS={setNST} setPT={setPT}
                        setTFT={setTFT}
                    />
                </Suspense> : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <h6 className="cat-name" style={eT}> No tasks found</h6>
                </div>}
            </div>
        </>}

        {tabNav === 2 && <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {listF && listF.length > 0 ? <Suspense fallback={<></>}>
                    <FileList isList={isList} list={listF} setDI={setDI} ord={ordF} id={org} uId={_id} />
                </Suspense> : <h6 className="f-n" style={eS}>No file found</h6>}
            </div>
        </>}

        {modalDel && <DeleteModal handleModalDel={e => setNI(false)} handleDelete={async e => {
            let data = { _id: modalDel };
            await deleteNote(data);
        }}>
            <p style={{ marginTop: '16px' }}>Are you sure? </p>
        </DeleteModal>}

        {modalDelC && <DeleteModal handleModalDel={e => setNIC(false)} handleDelete={async e => {
            let data = { _id: modalDelC };
            await deleteTask(data);
        }}>
            <p style={{ marginTop: '16px' }}>Are you sure? </p>
        </DeleteModal>}

        {modalCon && <DeleteModal handleModalDel={e => setCN(false)} handleDelete={async e => {
            await convertNote({ _id: modalCon });
            setTNCheck(1);
        }}>
            <p style={{ marginTop: '16px' }}>Are you sure? This will convert this note to task. </p>
        </DeleteModal>}

        {modalDelF && <DeleteModal handleModalDel={e => setDI(false)} handleDelete={async e => {
            let data = { _id: modalDelF };
            await deleteAttachment(data);
        }}>
            <p style={{ marginTop: '16px' }}>Are you sure? </p>
        </DeleteModal>}


        {tFN && <NOwnership id={org} isTask={false} _id={_id} nId={tFN} onhandleModal={e => {
            handleSearch(e)
            setTFN(false)
        }
        } />}

        {tFT && <TOwnership id={org} isTask={true} _id={_id} nId={tFT} onhandleModal={e => {
            handleSearchT(e);
            setTFT(false)
        }
        } />}

        {noteS && <Assigned id={org} isTask={false} _id={_id} nId={noteS} onhandleModal={e => setNS(false)} />}

        {taskS && <AssignedT id={org} isTask={true} _id={_id} nId={taskS} onhandleModal={e => setNST(false)} />}

        {PT && PT._id && !PT.isTask && <AssignedA id={org} isTask={PT.isTask} _id={_id} nId={PT._id} onhandleModal={e => setPT(false)} />}
        {PT && PT._id && PT.isTask && <AssignedTA id={org} isTask={PT.isTask} _id={_id} nId={PT._id} onhandleModal={e => setPT(false)} />}
    </div>
}

const mapStateToProps = state => {
    return {
        noteData: state.Note.list,
        isSuc: state.Note.isSuc,
        fileData: state.File.list,
        isSucF: state.File.isSuc,
        taskData: state.Task.list,
        isSucT: state.Task.isSuc,
        noteC: state.Note.count,
        taskC: state.Task.count
    }
};

export default connect(mapStateToProps, { fetchNotes, fetchTasks, fetchTasksSearch, fetchNotesSearch, fetchAttachment, deleteNote, deleteAttachment, convertNote, deleteTask })(ListNote);