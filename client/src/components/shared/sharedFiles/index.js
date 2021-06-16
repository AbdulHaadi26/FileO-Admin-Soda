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
import Tabnav from '../../tabnav';
import history from '../../../utils/history';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
import GAFiles from '../../../assets/tabnav/G-admin files.svg';
import BAFiles from '../../../assets/tabnav/B-admin files.svg';
import BNote from '../../../assets/tabnav/B-notes.svg';
import GNote from '../../../assets/tabnav/G-notes.svg';
import BTask from '../../../assets/tabnav/B-Team Task.svg';
import GTask from '../../../assets/tabnav/G-Team task.svg';
import Searchbar from '../../searchbarReusable';
let icons = [
    { G: GFolder, B: BFolder },
    { G: GAFiles, B: BAFiles },
    { G: GNote, B: BNote },
    { G: GTask, B: BTask }
];

const FileList = lazy(() => import('./fileList'));
const NoteList = lazy(() => import('../noteList'));
const CatList = lazy(() => import('../catList'));
const ListT = lazy(() => import('../taskList'));
const eS = {
    textAlign: 'center',
    marginTop: '50px'
};
const eT = {
    textAlign: 'center',
    marginTop: '50px',
    width: '100%'
};

const List = ({
    fetchFile, fetchNote, fetchNoteSearch, id, _id, isSucS, fileData, isSuc, opt2, opt1, string3, handleS3, isSucC, catData, fetchCats,
    handleOPT1, handleOPT2, handleOPT3, handleL2, handleS2, handleLM2, string, handleS, type, handleT, string2, limit2, limitMult2, opt3, noteData,
    tabNav, countSC, isList, handleISL, countCC, countFC, countTC, isSucT, taskData, typeT, handleDue, handleST, handleLT, handleLMT, stringT, limitMultT, limitT, due, status, handleTypeT, handleStatus
    , fetchTasks, fetchTasksSearch
}) => {
    const [ord, setO] = useState(0), [ordC, setOC] = useState(0), [ordN, setON] = useState(0), [ordT, setOT] = useState(0);


    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSelect4 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleOPT1(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSelect2 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleOPT2(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSelect3 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleOPT3(e.target.options[selectedIndex].getAttribute('data-key'));
    };

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
    };

    const handleSearchC = (i) => {
        if (i === 1) {
            let data = { _id: _id, type: 'All', search: 'updated' };
            fetchFile(data);
        } else if (i === 2) {
            var data2 = { limit: 0, _id: _id, search: 'updated' };
            handleL2(12); handleLM2(0);
            fetchNote(data2);
        } else {
            let data3 = { _id: _id, search: 'updated' };
            fetchCats(data3);
        }
    };


    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit2 < count && i > 0) || (limit2 > 12 && i < 0)) {
            var data2 = { limit: limitMult2 + i, string: string2, _id: _id, search: opt3.toLowerCase() === 'user' ? 'employee' : opt3.toLowerCase() };
            var upgradeLimit2 = limit2 + j;
            handleL2(upgradeLimit2); handleLM2(0);
            string2 ? fetchNoteSearch(data2) : fetchNote(data2);
        }
    };

    const fetchT = (e, count, i, j) => {
        e.preventDefault();
        if ((limitT < count && i > 0) || (limitT > 12 && i < 0)) {
            let data = { limit: limitMultT + i, string: stringT, _id: _id, type: typeT, status, due };
            let upgradeLimit = limitT + j;
            handleLT(upgradeLimit); handleLMT(data.limit);
            stringT ? fetchTasksSearch(data) : fetchTasks(data);
        }
    };

    const handleSearchT = e => {
        e.preventDefault();
        let data = {
            limit: 0, _id: _id, string: stringT, type: typeT, status, due
        };
        handleLT(12); handleLMT(0);
        stringT ? fetchTasksSearch(data) : fetchTasks(data);
    }

    const handleSearchTC = () => {
        let data = {
            limit: 0, _id: _id, type: 'Updated', status, due
        };
        handleLT(12); handleLMT(0);
        fetchTasks(data);
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

    if (isSucS && noteData) { listS = noteData.data; countS = noteData.count; }
    if (isSuc && fileData) { list = fileData; }
    if (isSucC && catData) { listC = catData; }
    if (isSucT && taskData) { listT = taskData.data; countT = taskData.count; }

    return <div className="col-11 sh-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Shared</h4>
            <div style={{ marginLeft: 'auto' }} />

            {tabNav === 0 && <>
                <Searchbar isCreate={false} classN={false ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={true} value={string3}
                    handleSearch={e => handleSearch(e, 3)} onHandleInput={val => handleS3(val)} holder={'Enter text here'} comp={<>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className="custom-select col-3" onChange={e => handleSelect4(e)} value={opt1}>
                            <option data-key={'Category'}>Folder</option>
                            <option data-key={'User'}>User</option>
                            <option data-key={'Updated'}>Updated</option>
                        </select>
                    </>} />

                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ordC < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', marginLeft: '12px' }} onClick={e => setOC(ordC >= 2 ? 0 : ordC === 0 ? 1 : 0)}>
                        <img src={ordC === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ordC >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setOC(ordC < 2 ? 2 : ordC === 2 ? 3 : 2)}>
                        <img src={ordC === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                </div>
            </>}
            {tabNav === 1 && <>
                <Searchbar isCreate={false} classN={false ? `col-lg-8 col-12` : 'col-lg-5 col-12'} pad={true} value={string}
                    handleSearch={e => handleSearch(e, 1)} onHandleInput={val => handleS(val)} holder={'Enter text here'} comp={<>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className="custom-select col-3" onChange={e => handleSelect2(e)} value={opt2}>
                            <option data-key={'File'}>File</option>
                            <option data-key={'User'}>User</option>
                            <option data-key={'Updated'}>Updated</option>
                        </select>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className="form-control select col-lg-2 mTHS" style={{ marginRight: '6px' }} onChange={e => handleSelect(e)} defaultValue={type}>
                            {renderOptions()}
                        </select>
                    </>} />

                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ padding: '6px', marginTop: '0px', marginLeft: '12px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
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
            {tabNav === 2 && <>
                <Searchbar isCreate={false} classN={false ? `col-lg-8 col-12` : 'col-lg-5 col-12'} pad={true} value={string2}
                    handleSearch={e => handleSearch(e, 2)} onHandleInput={val => handleS2(val)} holder={'Enter text here'} comp={<>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className="custom-select col-3" onChange={e => handleSelect3(e)} value={opt3}>
                            <option data-key={'Note'}>Note</option>
                            <option data-key={'User'}>User</option>
                            <option data-key={'Updated'}>Updated</option>
                        </select>
                    </>} />

                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ordN < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px' }} onClick={e => setON(ordN >= 2 ? 0 : ordN === 0 ? 1 : 0)}>
                        <img src={ordN === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ordN >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setON(ordN < 2 ? 2 : ordN === 2 ? 3 : 2)}>
                        <img src={ordN === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                    <div className={`order mTHS`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                        <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                    </div>
                </div>
            </>}
            {tabNav === 3 && <>

                <Searchbar isCreate={false} classN={false ? `col-lg-8 col-12` : 'col-lg-5 col-12'} pad={true} isInput={typeT === 'Status' || typeT === 'Due Date'} value={stringT}
                    handleSearch={e => handleSearchT(e)} onHandleInput={val => handleST(val)} holder={'Enter text here'} comp={<>
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
                            {['Name', 'Due Date', 'Status', 'Task Owner', 'Updated'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
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
        </div>
        <Tabnav items={['Folders', 'Files', 'Team Notes', 'Team Tasks']} i={tabNav} icons={icons} setI={i => history.push(`/organization/${id}/user/${_id}/shared/files/page/${i}`)} count={[countCC, countFC, countSC, countTC]} />
        {
            tabNav === 0 && <>
                <h6 style={{ fontSize: '14px', color: '#74b9ff', marginTop: '16px', cursor: 'pointer' }} onClick={e => handleSearchC(0)}>Show Updated Folders</h6>
                {isSucC && listC && listC.length > 0 ? <Suspense fallback={<></>}>
                    <CatList list={listC} ord={ordC} id={id} _id={_id} />
                </Suspense> : <div> <h6 className="sh-n" style={eS}>No folers found</h6> </div>}
            </>
        }
        {
            tabNav === 1 && <>
                <h6 style={{ fontSize: '14px', color: '#74b9ff', marginTop: '16px', cursor: 'pointer' }} onClick={e => handleSearchC(1)}>Show Updated Files</h6>
                {isSuc && list && list.length > 0 ? <Suspense fallback={<></>}>
                    <FileList list={list} isList={isList} ord={ord} id={id} _id={_id} />
                </Suspense> : <div> <h6 className="sh-n" style={eS}>No file found</h6> </div>}
            </>
        }
        {
            tabNav === 2 && <>
                <h6 style={{ fontSize: '14px', color: '#74b9ff', marginTop: '16px', cursor: 'pointer' }} onClick={e => handleSearchC(2)}>Show Updated Notes</h6>
                {isSucS && countS && countS > 0 && listS && listS.length > 0 ? <Suspense fallback={<></>}>
                    <NoteList isList={isList} list={listS} ord={ordN} count={countS} id={id} _id={_id} onFetch={fetch} />
                </Suspense> : <div> <h6 className="sh-n" style={eS}>No note found</h6> </div>}
            </>
        }

        {
            tabNav === 3 && <>

                <h6 style={{ fontSize: '14px', color: '#74b9ff', marginTop: '16px', cursor: 'pointer' }} onClick={e => handleSearchTC()}>Show Updated Tasks</h6>
                {isSucT && listT && listT.length > 0 && countT ? <Suspense fallback={<></>}>
                    <ListT id={id} isList={isList} _id={_id} ord={ordT} count={countT} list={listT} onFetch={fetchT} />
                </Suspense> : <div> <h6 className="cat-name" style={eT}> No tasks found</h6></div>}
            </>
        }
    </div >
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