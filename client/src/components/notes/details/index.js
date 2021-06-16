import React, { useState, Suspense, lazy, useEffect, useRef } from 'react';
import '../style.css';
import '../snow.css';
import { connect } from 'react-redux';
import {
    updateNote,
    deleteRec,
    updateTask,
    convertNote,
    updateNoteL,
    updateTaskL,
    deleteTask,
    deleteNote
} from '../../../redux/actions/noteActions';
import returnType from '../../types';
import Link from 'react-router-dom/Link';
import MP from '../../../assets/mp2.svg';
import VC from '../../../assets/vc1.svg';
import Cross from '../../../assets/cross.svg';
import Down from '../../../assets/downB.svg';
import Tabnav from '../../tabnav';
import CreateFileModal from '../../user_files/addModal';
import { addComment } from '../../../redux/actions/discussionActions';
import More from '../../../assets/more.svg';
import Discussion from '../../discussion';
import DeleteModal from '../../containers/deleteContainer';
import Assigned from '../modals/shared';
import AssignedT from '../modals/sharedT';
import AssignedA from '../modals/sharedA';
import AssignedTA from '../modals/sharedTA';
import Icons from '../modals/icons';
import Folder from '../../../assets/folder.svg';
import history from '../../../utils/history';
import BNote from '../../../assets/tabnav/B-notes.svg';
import GNote from '../../../assets/tabnav/G-notes.svg';
import BTask from '../../../assets/tabnav/B-Team Task.svg';
import GTask from '../../../assets/tabnav/G-Team task.svg';
import { downloadFile } from '../../../redux/actions/userFilesActions';
import { downloadFileN } from '../../../redux/actions/noteActions';

let iconsN = [
    { G: GNote, B: BNote }
];

let iconsT = [
    { G: GTask, B: BTask }
];

const mT = {
    marginTop: '16px'
};

const ModalFile = lazy(() => import('../modelView'));
const ModalRec = lazy(() => import('../modelRec'));
const ModalRecV = lazy(() => import('../modelRecVideo'));
const FileText = lazy(() => import('../../inputs/inputText'));
const ReactQuill = lazy(() => import('react-quill'));
const ModalFolder = lazy(() => import('../modals/attach'));

const CB = lazy(() => import('./cb'));
const iG = {
    marginTop: '2px',
    width: '90%'
};
const iS = {
    margin: '16px 0px 8px 0px',
    width: '90%',
    textAlign: 'left',
    fontWeight: 700,
    color: '#0a3d62',
    fontSize: '12px'
};
const cS2 = {
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '8px',
    textAlign: 'center',
    wordBreak: 'break-all'
};
const bSE = {
    borderBottom: 'solid 1px #dcdde1'
};
const eS = {
    marginTop: '16px',
    marginBottom: '12px',
    textAlign: 'left',
    fontWeight: 700,
    color: '#b33939',
    fontSize: '12px'
};

const Details = ({
    org, _id, Note, updateNote, deleteRec, count, setting, Rec, tabNav, convertNote, updateNoteL, deleteTask, deleteNote, downloadFileN,
    setTN, updated, profile, discussion, addComment, offset, setOF, updateChat, updateTask, updateTaskL, disabled, downloadFile
}) => {
    const [id, setId] = useState(''), [title, setT] = useState(''), [note, setNote] = useState(''), [at, setAT] = useState([]), [modal, setModal] = useState(false),
        [modalDel, setMDL] = useState(false), [c, setC] = useState('#ffffcc'), [f, setF] = useState(''), [ModalF, setMF] = useState(false),
        [rec, setRec] = useState(''), [MC, setMC] = useState(false), [MCV, setMCV] = useState(false), [errT, setErrT] = useState(false), [t, setTp] = useState(2),
        [due, setDue] = useState(''), [status, setStatus] = useState('Open'), [cbEditable, setCBE] = useState(false), [ct, setCT] = useState([]), [cId, setCId] = useState(''),
        [MF, setMDF] = useState(false), [tempFId, setTempFId] = useState(''), [isTask, setIT] = useState(false), [errD, setErrD] = useState(false),
        [tempCId, setTempCId] = useState(''), [lEx, setLEX] = useState(false), [message, setMessage] = useState(''), [activeT, setActT] = useState(false),
        [mdlT, setMDLT] = useState(false), [shMod, setSHMOD] = useState(false), [icon, setIcon] = useState(0), [PT, setPT] = useState(false);

    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setActT(false);
        }
    };

    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    useEffect(() => {
        setId(Note._id); setAT(Note.attachment);
        setT(Note.title); setNote(Note.text);
        setRec(Rec); setC(Note.color); setIT(Note.isTask ? true : false);
        setCBE(Note.editable); setCT(Note.catList ? Note.catList : []);
        setIcon(Note.icon ? Note.icon : 0);
        if (Note.isTask) {
            setDue(Note.due);
            setStatus(Note.status);
        }
    }, [Note, Rec, setId, setAT, setT, setNote]);

    const renderDate = date => {
        var serverDate = date;
        var dt = new Date(Date.parse(serverDate));
        var hours = dt.getHours();
        var minutes = dt.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var checkDate = new Date(Date.now());
        checkDate.setDate(checkDate.getDate() - 1);
        var strTime = `${checkDate < dt ? '' : `${date.slice(0, 10)} at `}${hours}:${minutes}  ${ampm}`;
        return strTime;
    };

    const onhandleModal = (file, val) => {
        if (file) {
            var bool = false;
            let tempFile = at ? at : [];

            tempFile.map(tF => {
                if (tF && tF._id && tF._id === file._id) bool = true;
                if (tF && tF._id && tF._id === file.versionId) bool = true;
                return tF;
            });

            if (!bool) {
                tempFile.push({
                    _id: file.versionId, name: file.name, type: file.type, url: file.url, date: new Date(Date.now()).toISOString()
                });
            }

            if (Note.isTask) handleUpdateTAuto(tempFile, ct);
            else handleUpdateAuto(tempFile, ct);

        }
        setModal(val);
    }

    const attachFile = (e, file) => {
        let bool = false;
        let tempFile = at ? at : [];
        tempFile.map(tF => {
            if (tF._id === file._id) bool = true;
            return tF;
        });
        if (!bool) {
            let fl = { _id: file._id, name: file.name, type: file.type, url: file.url, date: new Date(Date.now()).toISOString() };
            tempFile.push(fl);
        }

        if (Note.isTask) handleUpdateTAuto(tempFile, ct);
        else handleUpdateAuto(tempFile, ct);
    };

    const handleCBE = (e) => {
        if (isTask) {
            handleUpdateTSilentData('cb', e.target.checked);
        } else {
            handleUpdateSilentCB(e.target.checked);
        }
        setCBE(e.target.checked);
    }

    const handleFile = (file, i) => {
        setF(file);
        setTp(i);
        setMF(true);
    }

    const removeFile = (isTrue) => {
        if (!isTrue) return setTempFId('');
        let tempFile = at;
        tempFile = tempFile.filter(tF => tF._id !== tempFId);

        if (Note.isTask) handleUpdateTAuto(tempFile, ct);
        else handleUpdateAuto(tempFile, ct);
    };

    const renderFile = () => {
        if (at && at.length > 0) {
            let list = at.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            return list.map(a => <div key={a._id} className="col-lg-2 col-4 mFWS">
                <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                    <div onClick={e => setTempFId(a._id)} style={{
                        width: '20px', height: '20px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                        justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                    }}>
                        <div style={{ width: '11px', height: '11px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }} />
                    </div>
                </h6>
                <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '36px', width: 'fit-content' }}>
                    <div onClick={e => downloadFile(a._id)} style={{
                        width: '20px', height: '20px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                        justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                    }}>
                        <div style={{ width: '11px', height: '11px', cursor: 'pointer', backgroundImage: `url('${Down}')` }} />
                    </div>
                </h6>
                <img src={returnType(a.type)} style={{ cursor: 'pointer' }} alt="File" onClick={e => {
                    handleFile(a, 2);
                }} />
                <h6 style={cS2} onClick={e => handleFile(a, 2)}>{a.name.length > 35 ? `${a.name.substr(0, 35)}...` : a.name}</h6>
                {a.postedby && a.postedby.name ? <h6 style={{ marginTop: '8px', fontSize: '10px', color: 'gray', textAlign: 'center' }}>By {a.postedby.name} on {a.date && renderDate(a.date)}</h6> :
                    <h6 style={{ marginTop: '8px', fontSize: '10px', color: 'gray', textAlign: 'center' }}>By {profile.name} on {a.date && renderDate(a.date)}</h6>}
            </div>);
        }
        return <> </>
    };

    const handleUpdateAuto = (at, ct) => {
        var arr = [], cats = [];
        if (title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                icon
            };
            updateNote(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleUpdateSilent = () => {
        var arr = [], cats = [];
        if (((title && Note.title !== title) || (note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) && (Note.text !== note)))) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable, icon
            };
            updateNoteL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleUpdateSilentIcon = (icon) => {
        var arr = [], cats = [];
        if (title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                icon
            };
            updateNoteL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    };

    const handleUpdateSilentCB = (cb) => {
        var arr = [], cats = [];
        if (title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cb,
                icon
            };
            updateNoteL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    };

    const handleUpdateTAuto = (at, ct) => {
        let arr = [], cats = [];
        if (title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, due: due,
                icon
            };
            updateTask(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleUpdateTSilent = () => {
        var arr = [], cats = [];
        if (((title && Note.title !== title) || (note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) && (Note.text !== note)))) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, due: due, icon
            };
            updateTaskL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleUpdateTSilentIcon = (icon) => {
        var arr = [], cats = [];
        if (title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, due: due, icon
            };
            updateTaskL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    };

    const handleUpdateRec = (f) => {
        var arr = [], cats = [];
        if (title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: f && f._id ? f._id : '', editable: cbEditable,
                status: status, due: due, icon
            };
            updateTask(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    };

    const handleConfirm = (value) => {
        if (value) {
            setIT(true);
            convertNote({ _id: id });
        }

        return setMDLT(false);
    }

    const attachCat = (e, cat) => {
        var bool = false;
        let tempCat = ct;
        tempCat.map(tF => {
            if (tF._id === cat._id) bool = true;
            return tF;
        });
        if (!bool) {
            tempCat.push({
                _id: cat._id, name: cat.name, uId: cat.uId, date: new Date(Date.now()).toISOString()
            });
        }

        if (Note.isTask) handleUpdateTAuto(at, tempCat);
        else handleUpdateAuto(at, tempCat);
    }

    const removeRec = fId => {
        deleteRec({ _id: fId, isTask });
        setRec('');
    }

    const renderCat = () => {

        if (ct && ct.length > 0) {
            let list = ct.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            return list.map(a => <div key={a._id} className="col-lg-2 col-4 mFWS">
                <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                    <div onClick={e => setTempCId(a._id)} style={{
                        width: '20px', height: '20px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                        justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                    }}>
                        <div style={{ width: '11px', height: '11px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }} />
                    </div>
                </h6>
                <img src={Folder} style={{ cursor: 'pointer' }} alt="Folder" onClick={e => history.push(`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`)} />
                {a && a.uId && <Link style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', wordBreak: 'break-all' }} to={`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`}>{a.name.length > 35 ? `${a.name.substr(0, 35)}...` : a.name}</Link>}
                {a.uId && a.uId.name ? <h6 style={{ marginTop: '8px', fontSize: '10px', color: 'gray', textAlign: 'center' }}>By {a.uId.name} on {a.date && renderDate(a.date)}</h6> :
                    <h6 style={{ marginTop: '8px', fontSize: '10px', color: 'gray', textAlign: 'center' }}>By {profile.name} on {renderDate(a.date)}</h6>}
            </div>);
        }

        return <> </>
    };

    const removeCat = (isTrue) => {
        if (!isTrue) return setTempCId('');
        let tempFile = ct;
        tempFile = tempFile.filter(tF => tF._id !== tempCId);

        if (Note.isTask) handleUpdateTAuto(at, tempFile);
        else handleUpdateAuto(at, tempFile);
    }

    const handleModalC = (e, val) => setMC(val);
    const handleModalCV = (e, val) => setMCV(val);

    const handleRec = fData => {
        setRec(fData);
        handleUpdateRec(fData);
        setMC(false);
        setMCV(false);
    }

    const handleModalView = (e, val) => setMF(val);
    const handleInput = e => { setT(e.target.value); errT && setErrT(false); }

    const handleInputD = e => {
        setDue(e.target.value.substring(0, 10));
        handleUpdateTSilentData('due', e.target.value.substring(0, 10));
        errD && setErrD(false);
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-name')) {
            setStatus(e.target.options[selectedIndex].getAttribute('data-name'));
            handleUpdateTSilentData('status', e.target.options[selectedIndex].getAttribute('data-name'));
        }
    };

    const handleUpdateTSilentData = (field, value) => {
        var arr = [], cats = [];
        if (title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, due: due
            };

            if (field === 'due') data.due = value;
            else if (field === 'status') data.status = value;
            else if (field === 'cb') data.editable = value;
            updateTaskL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    };

    return <div className="col-11 nt-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">{Note.isTask ? 'Task' : 'Note'}</h4>
            <div style={{ marginLeft: 'auto' }} />
            <h6 className={`order`} style={{ position: 'relative', marginTop: '0px' }} onClick={e => setActT(!activeT)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" ref={node} style={{ display: `${activeT ? 'flex' : 'none'}` }}>
                    {!isTask ?
                        <h6 className='s-l' style={bSE} onClick={e => setSHMOD(true)}>Share Note</h6> :
                        <h6 className='s-l' style={bSE} onClick={e => setSHMOD(true)}>Share Task</h6>}
                    <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false);
                        setPT(true);
                    }}>View Participants</h6>
                    <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false);
                        setMDF(true);
                    }}>Attach File/Folder</h6>
                    {!isTask && <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false);
                        setMDLT(true);
                    }}>Convert To Task</h6>}
                    {!rec && <>
                        <h6 className='s-l' style={bSE} onClick={e => {
                            setActT(false); setMCV(true);
                        }}>Record Video</h6>
                        <h6 className='s-l' style={bSE} onClick={e => {
                            setActT(false); setMC(true);
                        }}>Record Audio</h6>
                    </>}
                    <h6 className='s-l' onClick={e => {
                        setActT(false);
                        setMDL(true)
                    }}>Delete {isTask ? 'Task' : 'Note'}</h6>
                </div>
            </h6>
        </div>
        <Tabnav items={[title]} i={tabNav} setI={setTN} icons={isTask ? iconsT : iconsN} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                <div style={{ width: '100%' }}>
                    <Suspense fallback={<></>}>
                        <div onMouseLeave={e => {
                            Note.isTask ? handleUpdateTSilent() : handleUpdateSilent();
                        }} onMouseEnter={e => {
                            Note.isTask ? handleUpdateTSilent() : handleUpdateSilent();
                        }}>
                            <FileText t={'TITLE'} plh={`Enter note title`} type={'text'} val={title}
                                handleInput={handleInput} err={errT} />
                        </div>
                    </Suspense>
                    <h6 style={iS}>NOTE</h6>
                    <Suspense fallback={<></>}>
                        <div onMouseLeave={e => {
                            Note.isTask ? handleUpdateTSilent() : handleUpdateSilent();
                        }} onMouseEnter={e => {
                            Note.isTask ? handleUpdateTSilent() : handleUpdateSilent();
                        }}>
                            <ReactQuill theme="snow" value={note} onChange={n => {
                                setNote(n); lEx && setLEX(false)
                            }} style={{ width: '90%' }} />
                        </div>
                    </Suspense>
                    {lEx && <div style={{ width: '90%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', position: 'relative' }}>
                        <h6 style={eS}>Note Size Exceeds 100mb.</h6>
                    </div>}
                    {isTask && <>
                        <h6 style={iS}>DUE DATE</h6>
                        <div className="input-group" style={iG}>
                            <input type={'date'} min={(new Date(Date.now()).toISOString()).slice(0, 10)} className="form-control" placeholder={'Select Date'} value={due} onChange={e => handleInputD(e)} />
                        </div>
                        {errD && <div style={eS}>This field is required</div>}
                        <h6 style={iS}>STATUS</h6>
                        <select className="form-control" style={{ width: '90%' }} defaultValue={status} onChange={e => handleSelect(e)}>
                            {['Open', 'In Progress', 'On Hold', 'Completed', 'Closed'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                        </select>
                    </>}
                    <h6 style={iS}>SHARING PERMISSIONS</h6>
                    {<Suspense fallback={<></>}>
                        <CB i={'cbEditable'} t='Editable' c={cbEditable} onhandleCB={handleCBE} />
                    </Suspense>}

                    <h6 style={iS}>RECORDING</h6>
                    {rec ? <div className="col-lg-2 col-4 mFWS">
                        <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                            <div onClick={e => removeRec(rec._id)} style={{
                                width: '20px', height: '20px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                                justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                            }}>
                                <div style={{ width: '11px', height: '11px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }} />
                            </div>
                        </h6>
                        <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '36px', width: 'fit-content' }}>
                            <div onClick={e => downloadFileN(rec._id)} style={{
                                width: '20px', height: '20px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                                justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                            }}>
                                <div style={{ width: '11px', height: '11px', cursor: 'pointer', backgroundImage: `url('${Down}')`}} />
                            </div>
                        </h6>
                        <img src={returnType(rec.type)} style={{ cursor: 'pointer' }} alt="Recording" onClick={e => { handleFile(rec, 1); }} />
                        <h6 style={{ fontSize: '12px', marginTop: '6px', cursor: 'pointer' }} onClick={e => {
                            handleFile(rec, 1);
                        }}>{`${rec.name}`}</h6>
                    </div> : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <button className="btn btn-dark" disabled={disabled} type='button' onClick={e => setMCV(true)} style={{ marginRight: '12px' }}>Record video<div className="faS" style={{ backgroundImage: `url('${VC}')` }} /></button>
                        <button className="btn btn-dark" disabled={disabled} type='button' onClick={e => setMC(true)}>Record audio<div className="faS" style={{ backgroundImage: `url('${MP}')` }} /></button>
                    </div>}

                    {((at && at.length > 0) || (ct && ct.length > 0)) && <h6 style={iS}>ATTACHED FOLDER/FILE</h6>}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {ct && ct.length > 0 && renderCat()}
                        {at && at.length > 0 && renderFile()}
                    </div>

                    <h6 style={iS}>ICON</h6>
                    <Icons i={icon} setI={i => {
                        isTask ? handleUpdateTSilentIcon(i) : handleUpdateSilentIcon(i);
                        setIcon(i);
                    }} isTask={isTask} />
                </div>
            </div>
            <Discussion id={id} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={false}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} />
        </div>

        {tempFId && <DeleteModal handleModalDel={e => removeFile(false)} handleDelete={async e => removeFile(true)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {tempCId && <DeleteModal handleModalDel={e => removeCat(false)} handleDelete={async e => removeCat(true)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {modalDel && <DeleteModal handleModalDel={e => setMDL(false)} handleDelete={async e => {
            let data = { _id: id, org: org, uId: _id };
            isTask ? deleteTask(data) : deleteNote(data);
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {mdlT && <DeleteModal handleModalDel={e => handleConfirm(false)} handleDelete={async e => {
            handleConfirm(true);
        }}>
            <p style={mT}>This will convert this note to task. Are you sure? </p>
        </DeleteModal>}


        {PT && !isTask && <AssignedA id={org} isTask={isTask} _id={_id} nId={id} onhandleModal={e => setPT(false)} />}
        {PT && isTask && <AssignedTA id={org} isTask={isTask} _id={_id} nId={id} onhandleModal={e => setPT(false)} />}

        {shMod && !isTask && <Assigned id={org} isTask={isTask} _id={_id} nId={id} onhandleModal={e => setSHMOD(false)} />}

        {shMod && isTask && <AssignedT id={org} isTask={isTask} _id={_id} nId={id} onhandleModal={e => setSHMOD(false)} />}

        {modal && <CreateFileModal id={org} _id={_id} setting={setting && setting.setting} onhandleModal={onhandleModal} />}
        {MF && <Suspense fallback={<></>}> <ModalFolder disabled={disabled} setModal={e => {
            setMDF(false);
            setCId('');
            setModal(true);
        }} _id={_id} org={org} onAttachCat={attachCat} onAttachFile={attachFile} cId={cId} setCId={setCId} onhandleModal={e => {
            setMDF(false);
            setCId('');
        }} /> </Suspense>}
        {ModalF && f && <Suspense fallback={<></>}> <ModalFile uId={profile && profile._id} file={f} onhandleModalView={handleModalView} t={t} /> </Suspense>}
        {MC && <Suspense fallback={<></>}> <ModalRec isTask={isTask} noteName={title} _id={_id} org={org} onhandleModal={handleModalC} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
        {MCV && <Suspense fallback={<></>}>  <ModalRecV isTask={isTask} noteName={title} _id={_id} org={org} onhandleModal={handleModalCV} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
    </div>

}

const mapStateToProps = state => {
    return {
        setting: state.setting.data
    }
};

export default connect(mapStateToProps, {
    updateNote, deleteRec, addComment, convertNote, updateTask, updateTaskL, updateNoteL,
    deleteTask, deleteNote, downloadFile, downloadFileN
})(Details);