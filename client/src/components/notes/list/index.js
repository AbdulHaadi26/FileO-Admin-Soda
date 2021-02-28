import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { fetchNotes, fetchNotesSearch } from '../../../redux/actions/noteActions';
import Link from 'react-router-dom/Link';
import Plus from '../../../assets/plus.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import '../style.css';
import Tabnav from '../../tabnav/tabNavCount';
import { fetchAttachment } from '../../../redux/actions/userFilesActions';
import { fetchTasks, fetchTasksSearch } from '../../../redux/actions/taskActions';
import history from '../../../utils/history';
const List = lazy(() => import('../noteList'));
const FileList = lazy(() => import('./fileList'));
const ListT = lazy(() => import('../taskList'));
const eS = { marginTop: '50px', width: '100%', textAlign: 'center' };
const dF = { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' };
const mT = { marginTop: '16px' };
const eT = { textAlign: 'center', marginTop: '50px', width: '100%' };

const ListNote = ({
    fetchNotes, fetchNotesSearch, org, _id, isSuc, noteData, string, limit, limitMult, handleS, handleLM, handleL, tabNav, isList, handleISL,
    fileData, isSucF, type, handleT, fetchAttachment, string2, handleS2, noteC, taskC,
    handleTypeT, handleStatus, status, typeT, handleST, stringT, isSucT, taskData, due, handleDue, limitMultT, handleLMT, handleLT, limitT,
    fetchTasks, fetchTasksSearch, handleTypeN, typeN
}) => {

    const [ord, setO] = useState(0), [ordF, setOF] = useState(0), [ordT, setOT] = useState(0);

    const handleSearch = e => {
        e.preventDefault();
        let data = { limit: 0, _id: _id, string: string, search: typeN };
        handleL(12); handleLM(0);
        string ? fetchNotesSearch(data) : fetchNotes(data);
    }

    const handleSearchF = e => {
        e.preventDefault();
        let data = { type: type === 'All' ? 'All' : type.toLowerCase(), string: string2 };
        fetchAttachment(data);
    }

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            let data = { limit: limitMult + i, string: string, _id: _id, search: typeN };
            let upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            string ? fetchNotesSearch(data) : fetchNotes(data);
        }
    }

    const fetchT = (e, count, i, j) => {
        e.preventDefault();
        if ((limitT < count && i > 0) || (limitT > 12 && i < 0)) {
            let data = { limit: limitMultT + i, string: stringT, _id: _id, type: typeT, status, due };
            let upgradeLimit = limitT + j;
            handleLT(upgradeLimit); handleLMT(data.offset);
            stringT ? fetchTasksSearch(data) : fetchTasks(data);
        }
    }

    const handleSearchT = e => {
        e.preventDefault();
        let data = { offset: 0, _id: _id, string: stringT, type: typeT, status, due };
        handleLT(12); handleLMT(0);
        stringT ? fetchTasksSearch(data) : fetchTasks(data);
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSelectT = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleTypeT(e.target.options[selectedIndex].getAttribute('data-name'));
    }

    const handleSelectN = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleTypeN(e.target.options[selectedIndex].getAttribute('data-name'));
    }

    const handleSelectT2 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleStatus(e.target.options[selectedIndex].getAttribute('data-name'));
    }

    const handleSelectD = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleDue(e.target.options[selectedIndex].getAttribute('data-name'));
    }

    var list = [], count = 0;

    if (isSuc && noteData.noteList && noteData.count) {
        list = noteData.noteList;
        count = noteData.count
    }

    var listF = [];

    if (isSucF && fileData) {
        listF = fileData.files;
    }

    var listT = [], countT = 0;

    if (isSucT && taskData.noteList && taskData.count) {
        listT = taskData.noteList;
        countT = taskData.count
    }

    const setTNCheck = i => {
         history.push(`/organization/${org}/myspace/user/${_id}/notes/list/page/${i}`);
    }

    return <div className="col-11 nt-w p-0">
        <h4 className="h">Team Up</h4>
        <Tabnav items={['Team Notes', 'Team Tasks', 'Attachments']} count={[noteC, taskC, 0]} i={tabNav} setI={setTNCheck} />

        {tabNav === 0 && <>
            <div style={dF}>
                <Link className="btn btn-dark" to={`/organization/${org}/myspace/user/${_id}/notes/add`}>Add note <div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></Link>
            </div>
            <div style={dF}>
                <select className="form-control col-lg-3" value={typeN} style={{ marginTop: '16px', marginRight: '6px' }} onChange={e => handleSelectN(e)}>
                    {['All', 'Updated'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                </select>
                <div className="input-group" style={mT}>

                    <input type="text" className="form-control" placeholder="Note title" value={string} onChange={e => handleS(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
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
            </div>
            {isSuc && list && list.length > 0 && count ? <Suspense fallback={<></>}><List id={org} _id={_id} ord={ord} count={count} list={list} onFetch={fetch} /></Suspense> : <div> <h6 className="cat-name" style={eT}> No notes found</h6></div>}
        </>}


        {tabNav === 1 && <>
            <div style={dF}>
                <Link className="btn btn-dark" to={`/organization/${org}/myspace/user/${_id}/tasks/add`}>Add task<div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></Link>
            </div>
            <div style={dF}>
                <select className="form-control col-lg-3" value={typeT} style={{ marginTop: '16px', marginRight: '6px' }} onChange={e => handleSelectT(e)}>
                    {['Name', 'Due Date', 'Status', 'Updated'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                </select>
                {typeT !== 'Status' && typeT !== 'Due Date' && <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Type here" value={stringT} onChange={e => handleST(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearchT(e)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearchT(e)} ><div className="faH" /></button>
                    </div>
                </div>}
                {typeT === 'Status' && <div className="input-group" style={mT}>
                    <select className="form-control" value={status} onChange={e => handleSelectT2(e)}>
                        {['All', 'Open', 'In Progress', 'On Hold', 'Completed', 'Closed'].map((i, k) => <option value={i} key={k} data-name={i}>{i}</option>)}
                    </select>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearchT(e)} ><div className="faH" /></button>
                    </div>
                </div>}

                {typeT === 'Due Date' && <div className="input-group" style={mT}>
                    <select className="form-control" value={due} onChange={e => handleSelectD(e)}>
                        {['Due', 'Over Due', 'Due Today', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due Next Month'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                    </select>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearchT(e)} ><div className="faH" /></button>
                    </div>
                </div>}
            </div>
            <div style={dF}>
                <div className={`order ${ordT < 2 ? 'orderA' : ''}`} onClick={e => setOT(ordT >= 2 ? 0 : ordT === 0 ? 1 : 0)}>
                    <img src={ordT === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order ${ordT >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setOT(ordT < 2 ? 2 : ordT === 2 ? 3 : 2)}>
                    <img src={ordT === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order`} onClick={e => handleISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
            </div>
            {isSucT && listT && listT.length > 0 && countT ? <Suspense fallback={<></>}><ListT id={org} isList={isList} _id={_id} ord={ord} count={countT} list={listT} onFetch={fetchT} /></Suspense> : <div> <h6 className="cat-name" style={eT}> No tasks found</h6></div>}
        </>}


        {tabNav === 2 && <>
            <div style={dF}>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="File name" value={string2} onChange={e => handleS2(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearchF(e)} />
                    <select className="custom-select col-lg-3 col-4" onChange={e => handleSelect(e)} defaultValue={type}>
                        <option data-key={'All'} value="All">All</option>
                        <option data-key={'Video'} value="Video">Video</option>
                        <option data-key={'Audio'} value="Audio">Audio</option>
                    </select>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearchF(e)} ><div className="faH" /></button>
                    </div>
                </div>
            </div>
            <div style={dF}>
                <div className={`order ${ordF < 2 ? 'orderA' : ''}`} onClick={e => setOF(ordF >= 2 ? 0 : ordF === 0 ? 1 : 0)}>
                    <img src={ordF === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order ${ordF >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setOF(ordF < 2 ? 2 : ordF === 2 ? 3 : 2)}>
                    <img src={ordF === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order`} onClick={e => handleISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
                {listF && listF.length > 0 ? <Suspense fallback={<></>}> <FileList isList={isList} list={listF} ord={ordF} id={org} uId={_id} /> </Suspense> : <h6 className="f-n" style={eS}>No file found</h6>}
            </div>
        </>}
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
}

export default connect(mapStateToProps, { fetchNotes, fetchTasks, fetchTasksSearch, fetchNotesSearch, fetchAttachment })(ListNote);