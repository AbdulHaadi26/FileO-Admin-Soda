import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { fetchFile } from '../../../redux/actions/sharedFilesAction';
import { fetchNote, fetchNoteSearch } from '../../../redux/actions/sharedNotesAction';
import { fetchCats } from '../../../redux/actions/sharedCatActions';
import { fetchTasks, fetchTasksSearch } from '../../../redux/actions/sharedTasksActions';
import { returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import CalDes from '../../../assets/calendar-up.svg';
import '../style.css';
import Tabnav from '../../tabnav/tabNavCount';
import history from '../../../utils/history';
const FileList = lazy(() => import('./fileList'));
const NoteList = lazy(() => import('../noteList'));
const CatList = lazy(() => import('../catList'));
const ListT = lazy(() => import('../taskList'));
const mT = { marginTop: '16px' };
const dF = { display: 'flex', justifyContent: 'flex-end' };
const eS = { textAlign: 'center', marginTop: '50px' };
const eT = { textAlign: 'center', marginTop: '50px', width: '100%' };

const List = ({
    fetchFile, fetchNote, fetchNoteSearch, id, _id, isSucS, fileData, isSuc, opt2, opt1, string3, handleS3, isSucC, catData, fetchCats,
    handleOPT1, handleOPT2, handleOPT3, handleL2, handleS2, handleLM2, string, handleS, type, handleT, string2, limit2, limitMult2, opt3, noteData,
    tabNav, setTN, countSC, isList, handleISL, countCC, countFC, countTC, isSucT, taskData, typeT, handleDue, handleST, handleLT, handleLMT, stringT, limitMultT, limitT, due, status, handleTypeT, handleStatus
    , fetchTasks, fetchTasksSearch
}) => {
    const [ord, setO] = useState(0), [ordC, setOC] = useState(0), [ordN, setON] = useState(0), [ordT, setOT] = useState(0);

    const onhandleInput = e => handleS(e.target.value);
    const onhandleInput2 = e => handleS2(e.target.value);
    const onhandleInput3 = e => handleS3(e.target.value);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSelect4 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleOPT1(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSelect2 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleOPT2(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSelect3 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleOPT3(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSearch = (e, i) => {
        e.preventDefault();
        if (i === 1) {
            let data = { string: string, _id: _id, type: type === 'All' ? type : type.toLowerCase(), search: opt2.toLowerCase() === 'user' ? 'employee' : opt2.toLowerCase() };
            fetchFile(data);
        } else if (i === 2) {
            var data2 = { limit: 0, string: string2, _id: _id, search: opt3.toLowerCase() === 'user' ? 'employee' : opt3.toLowerCase() };
            handleL2(12); handleLM2(0);
            string2 ? fetchNoteSearch(data2) : fetchNote(data2);
        } else {
            let data3 = { string: string3, _id: _id, search: opt1.toLowerCase() === 'user' ? 'employee' : opt1.toLowerCase() };
            fetchCats(data3);
        }
    }

    const fetch = (e, count, i, j, k) => {
        e.preventDefault();
        if (k === 2) {
            if ((limit2 < countS && i > 0) || (limit2 > 12 && i < 0)) {
                var data2 = { limit: limitMult2 + i, string: string2, _id: _id, search: opt3.toLowerCase() === 'user' ? 'employee' : opt3.toLowerCase() };
                var upgradeLimit2 = limit2 + j;
                handleL2(upgradeLimit2); handleLM2(0);
                string2 ? fetchNoteSearch(data2) : fetchNote(data2);
            }
        }
    }

    const fetchT = (e, count, i, j) => {
        e.preventDefault();
        if ((limitT < count && i > 0) || (limitT > 12 && i < 0)) {
            let data = { limit: limitMultT + i, string: stringT, _id: _id, type: typeT, status, due };
            let upgradeLimit = limitT + j;
            handleLT(upgradeLimit); handleLMT(data.limit);
            stringT ? fetchTasksSearch(data) : fetchTasks(data);
        }
    }

    const handleSearchT = e => {
        e.preventDefault();
        let data = { limit: 0, _id: _id, string: stringT, type: typeT, status, due };
        handleLT(12); handleLMT(0);
        stringT ? fetchTasksSearch(data) : fetchTasks(data);
    }

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    const handleSelectT = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleTypeT(e.target.options[selectedIndex].getAttribute('data-name'));
    }

    const handleSelectT2 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleStatus(e.target.options[selectedIndex].getAttribute('data-name'));
    }

    const handleSelectD = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && handleDue(e.target.options[selectedIndex].getAttribute('data-name'));
    }


    let countS = 0, countT = 0;
    let list = [], listS = [], listC = [], listT = [];

    if (isSucS) { listS = noteData.data; countS = noteData.count; }
    if (isSuc) { list = fileData; }
    if (isSucC && catData) { listC = catData; }
    if (isSucT) { listT = taskData.data; countT = taskData.count; }

    return <div className="col-11 sh-w p-0">
        <h4 className="h">Shared With Me</h4>
        <Tabnav items={['Folders', 'Files', 'Team Notes', 'Team Tasks']} i={tabNav} setI={i => history.push(`/organization/${id}/user/${_id}/shared/files/page/${i}`)} count={[countCC, countFC, countSC, countTC]} />
        {tabNav === 0 && <>
            <div className="sh-i-w">
                <select className="form-control select col-lg-3 col-12" style={mT} onChange={e => handleSelect4(e)} defaultValue={opt1}>
                    <option data-key={'Category'}>Folder</option>
                    <option data-key={'User'}>User</option>
                    <option data-key={'Updated'}>Updated</option>
                </select>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Enter name" value={string3} onChange={e => onhandleInput3(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e, 3)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e, 3)} ><div className="faH" /></button>
                    </div>
                </div>
            </div>
            <div style={dF}>
                <div className={`order ${ordC < 2 ? 'orderA' : ''}`} onClick={e => setOC(ordC >= 2 ? 0 : ordC === 0 ? 1 : 0)}>
                    <img src={ordC === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order ${ordC >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setOC(ordC < 2 ? 2 : ordC === 2 ? 3 : 2)}>
                    <img src={ordC === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
            </div>
            {isSucC && listC && listC.length > 0 ? <Suspense fallback={<></>}> <CatList list={listC} ord={ordC} id={id} _id={_id} /> </Suspense> : <div> <h6 className="sh-n" style={eS}>No folers found</h6> </div>}
        </>}
        {tabNav === 1 && <>
            <div className="sh-i-w">
                <select className="form-control select col-lg-3 col-12" style={mT} onChange={e => handleSelect2(e)} defaultValue={opt2}>
                    <option data-key={'File'}>File</option>
                    <option data-key={'User'}>User</option>
                    <option data-key={'Updated'}>Updated</option>
                </select>
                <select className="form-control select col-lg-2 col-12" style={mT} onChange={e => handleSelect(e)} defaultValue={type}>
                    {renderOptions()}
                </select>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Enter name" value={string} name="string" onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e, 1)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e, 1)} ><div className="faH" /></button>
                    </div>
                </div>
            </div>
            <div style={dF}>
                <div className={`order ${ord < 2 ? 'orderA' : ''}`} style={{ padding: '6px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                    <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                    <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order`} onClick={e => handleISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
            </div>
            {isSuc && list && list.length > 0 ? <Suspense fallback={<></>}> <FileList list={list} isList={isList} ord={ord} id={id} _id={_id} /> </Suspense> : <div> <h6 className="sh-n" style={eS}>No file found</h6> </div>}
        </>}
        {tabNav === 2 && <>
            <div className="sh-i-w">
                <select className="form-control select col-lg-3 col-12" style={mT} onChange={e => handleSelect3(e)} defaultValue={opt3}>
                    <option data-key={'Note'}>Note</option>
                    <option data-key={'User'}>User</option>
                    <option data-key={'Updated'}>Updated</option>
                </select>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Enter name" value={string2} onChange={e => onhandleInput2(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e, 2)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e, 2)} ><div className="faH" /></button>
                    </div>
                </div>
            </div>
            <div style={dF}>
                <div className={`order ${ordN < 2 ? 'orderA' : ''}`} onClick={e => setON(ordN >= 2 ? 0 : ordN === 0 ? 1 : 0)}>
                    <img src={ordN === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order ${ordN >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setON(ordN < 2 ? 2 : ordN === 2 ? 3 : 2)}>
                    <img src={ordN === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
            </div>
            {isSucS && countS && countS > 0 && listS && listS.length > 0 ? <Suspense fallback={<></>}> <NoteList list={listS} ord={ordN} count={countS} id={id} _id={_id} onFetch={fetch} /> </Suspense> : <div> <h6 className="sh-n" style={eS}>No note found</h6> </div>}
        </>}

        {tabNav === 3 && <>
            <div style={dF}>
                <select className="form-control col-lg-3" value={typeT} style={{ marginTop: '16px', marginRight: '6px' }} onChange={e => handleSelectT(e)}>
                    {['Name', 'Due Date', 'Status', 'Task Owner', 'Updated'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
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
            {isSucT && listT && listT.length > 0 && countT ? <Suspense fallback={<></>}><ListT id={id} isList={isList} _id={_id} ord={ord} count={countT} list={listT} onFetch={fetchT} /></Suspense> : <div> <h6 className="cat-name" style={eT}> No tasks found</h6></div>}
        </>}
    </div>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isSuc: state.File.isSuc,
        isSucS: state.Note.isSuc,
        noteData: state.Note.list,
        isSucC: state.Category.isSuc,
        isSucT: state.Task.isSuc,
        catData: state.Category.list,
        taskData: state.Task.list,
        countSC: state.Note.countS,
        countFC: state.File.countS,
        countCC: state.Category.countS,
        countTC: state.Task.countS
    }
}

export default connect(mapStateToProps, { fetchFile, fetchNote, fetchNoteSearch, fetchCats, fetchTasks, fetchTasksSearch })(List);