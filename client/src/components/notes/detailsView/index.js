import React, { useState, Suspense, lazy, useEffect, useRef } from 'react';
import '../style.css';
import '../snow.css';
import { connect } from 'react-redux';
import Down from '../../../assets/downB.svg';
import {
    downloadFileN,
    updateNote,
    updateTask,
    updateTaskL
} from '../../../redux/actions/noteActions';
import returnType from '../../types';
import Cross from '../../../assets/cross.svg';
import Tabnav from '../../tabnav';
import CreateFileModal from '../../user_files/addModal';
import { Link } from 'react-router-dom';
import { addComment } from '../../../redux/actions/discussionActions';
import More from '../../../assets/more.svg';
import Discussion from '../../discussion';
import DeleteModal from '../../containers/deleteContainer';
import Folder from '../../../assets/folder.svg';
import history from '../../../utils/history';
import BNote from '../../../assets/tabnav/B-notes.svg';
import GNote from '../../../assets/tabnav/G-notes.svg';
import BTask from '../../../assets/tabnav/B-Team Task.svg';
import GTask from '../../../assets/tabnav/G-Team task.svg';
import { downloadFile } from '../../../redux/actions/userFilesActions';

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
const ModalFolder = lazy(() => import('../modals/attach'));
const iS = {
    margin: '16px 0px 8px 0px',
    width: '90%',
    textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px'
};
const cS2 = { cursor: 'pointer', fontSize: '12px', marginTop: '8px', textAlign: 'center', wordBreak: 'break-all' };
const bSE = { borderBottom: 'solid 1px #dcdde1' };
const iG = { marginTop: '2px', width: '90%' };
const eS = { marginTop: '16px', marginBottom: '12px', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };

const Details = ({
    org, _id, Note, updateNote, setting, Rec, tabNav, setTN, profile, updateTaskL,
    discussion, count, offset, setOF, addComment, updateChat, updated, updateTask,
    disabled, downloadFileN, downloadFile
}) => {
    const [id, setId] = useState(''), [note, setNote] = useState(''), [at, setAT] = useState([]), [modal, setModal] = useState(false), [c, setC] = useState('#ffffcc'), [f, setF] = useState(''), [ModalF, setMF] = useState(false), [MF, setMDF] = useState(false),
        [rec, setRec] = useState(''), [MC, setMC] = useState(false), [MCV, setMCV] = useState(false), [message, setMessage] = useState(''), [activeT, setActT] = useState(false), [isTask, setIT] = useState(false), [due, setDue] = useState(''), [status, setStatus] = useState('Open'),
        [t, setTp] = useState(2), [cbEditable, setCBE] = useState(false), [ct, setCT] = useState([]), [tempFId, setTempFId] = useState(''), [cId, setCId] = useState(''),
        [tempCId, setTempCId] = useState(''), [errD, setErrD] = useState(false);
    const node = useRef({});

    useEffect(() => {
        const handleClick = e => {
            if (isTask && status !== 'Closed' && node && node.current && !node.current.contains(e.target)) {
                setActT(false);
            }
        };
        document.addEventListener('mousedown', handleClick, true);
    }, [isTask, status]);

    useEffect(() => {
        setAT(Note.attachment);
        setCT(Note.catList ? Note.catList : []);

        setId(Note._id);
        setNote(Note.text);
        setRec(Rec);
        setC(Note.color);
        setCBE(Note.editable);
        setIT(Note.isTask);

        if (Note.isTask) {
            setDue(Note.due);
            setStatus(Note.status);
        }
    }, [Note, Rec, setId, setAT, setNote]);

    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    const attachCat = (e, cat) => {
        let bool = false;
        let tempCat = ct;

        tempCat.map(tF => {
            if (tF._id === cat._id) bool = true;
            return tF;
        });


        if (!bool) {
            tempCat.push({
                _id: cat._id, name: cat.name, uId: profile && profile._id,
                date: new Date(Date.now()).toISOString()
            });
        }
        if (Note.isTask) handleUpdateTAuto(at, tempCat);
        else handleUpdateAuto(at, tempCat);
    }

    const handleInputD = e => {
        setDue(e.target.value.substring(0, 10));
        handleUpdateTSilentData('due', e.target.value.substring(0, 10));
        errD && setErrD(false);
    };

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-name')) {
            setStatus(e.target.options[selectedIndex].getAttribute('data-name'));
            handleUpdateTSilentData('status', e.target.options[selectedIndex].getAttribute('data-name'));
        }
    }

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

    const attachFile = (e, file) => {
        var bool = false;
        let tempFile = at;
        tempFile.map(tF => {
            if (tF._id === file._id) bool = true;
            return tF;
        });
        if (!bool) {
            tempFile.push({
                _id: file._id, name: file.name, type: file.type, url: file.url,
                postedby: profile && profile._id, date: new Date(Date.now()).toISOString()
            });
        }

        if (Note.isTask) handleUpdateTAuto(tempFile, ct);
        else handleUpdateAuto(tempFile, ct);
    };

    const handleFile = (file, i) => {
        setF(file);
        setTp(i);
        setMF(true);
    };

    const removeFile = (isTrue) => {
        if (!isTrue) return setTempFId('');
        let tempFile = at;
        tempFile = tempFile.filter(tF => tF._id !== tempFId);
        if (Note.isTask) handleUpdateTAuto(tempFile, ct);
        else handleUpdateAuto(tempFile, ct);
    };

    const renderFile = () => {
        let tempL = at;
        if (tempL && tempL.length > 0) {
            tempL = tempL.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
         
            return tempL.map(a => <div key={a._id} className="col-lg-2 col-4 mFWS">

                {profile && profile._id === a.postedby._id && status !== 'Closed' && <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                    <div onClick={e => setTempFId(a._id)} style={{
                        width: '18px', height: '18px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                        justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                    }}>
                        <div style={{ width: '10px', height: '10px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }} />
                    </div>
                </h6>}
                <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: profile && profile._id === a.postedby._id && status !== 'Closed' ? '36px' : '12px', width: 'fit-content' }}>
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
    };

    const handleUpdateAuto = (at, ct) => {
        var arr = [], cats = [];
        if (Note && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => a && a._id && arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => c && c._id && cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: Note.title, text: note, color: c, fileList: arr, catList: cats, isEdt: true,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable
            };

            updateNote(data);
        }
    };

    const handleUpdateTAuto = (at, ct) => {
        var arr = [], cats = [];
        if (Note && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: Note.title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, isEdt: true, due: due
            };
            updateTask(data);
        }
    };

    const handleUpdateTSilentData = (field, value) => {
        var arr = [], cats = [];
        if (c) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: Note.title, text: Note.text, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, due: due, isEdt: true
            };

            if (field === 'due') data.due = value;
            else if (field === 'status') data.status = value;
            updateTaskL(data);
        }
    }

    const renderCat = () => {
        if (ct && ct.length > 0) {

            let list = ct.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            return list.map(a => <div key={a._id} className="col-lg-2 col-4 mFWS">
                {profile && profile._id === a.uId._id && isTask && status !== 'Closed' && <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                    <div onClick={e => setTempCId(a._id)} style={{
                        width: '18px', height: '18px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                        justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                    }}>
                        <div style={{ width: '10px', height: '10px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }} />
                    </div>
                </h6>}
                <img src={Folder} style={{ cursor: 'pointer' }} alt="Folder" onClick={e => history.push(`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`)} />
                {a && a.uId && <Link style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', wordBreak: 'break-all' }} to={`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`}>{a && a.name.length > 35 ? `${a.name.substr(0, 35)}...` : a.name}</Link>}
                {a.uId && a.uId.name ? <h6 style={{ marginTop: '8px', fontSize: '10px', color: 'gray', textAlign: 'center' }}>By {a.uId.name} on {a.date && renderDate(a.date)}</h6> :
                    <h6 style={{ marginTop: '8px', fontSize: '10px', color: 'gray', textAlign: 'center' }}>By {profile.name} on {renderDate(a.date)}</h6>}
            </div>);
        }
        return <></>
    }

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
        setMC(false);
        setMCV(false);
    }

    const handleModalView = (e, val) => setMF(val);

    const onhandleModal = (file, val) => {
        if (file) {
            let tempFile = at ? at : [];
            var bool = false;
            tempFile.map(tF => {
                if (tF && tF._id && tF._id === file._id) bool = true;
                if (tF && tF._id && tF._id === file.versionId) bool = true;
                return tF;
            });
            if (!bool) {
                tempFile.push({
                    _id: file.versionId, name: file.name, type: file.type,
                    postedby: { _id: profile._id, name: profile.name },
                    url: file.url, date: new Date(Date.now()).toISOString()
                });
            }
            if (Note.isTask) handleUpdateTAuto(tempFile, ct);
            else handleUpdateAuto(tempFile, ct);
        }
        setModal(val);
    };

    return <div className="col-11 nt-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">{Note.isTask ? 'Shared Task' : 'Shared Note'}</h4>
            <div style={{ marginLeft: 'auto' }} />
            {((isTask && status !== 'Closed') || (!isTask && status !== 'Closed')) && <h6 className={`order`} style={{ position: 'relative', marginTop: '0px' }} onClick={e => setActT(!activeT)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" ref={node} style={{ display: `${activeT ? 'flex' : 'none'}` }}>
                    <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false);
                        setMDF(true);
                    }}>Attach File/Folder</h6>
                </div>
            </h6>}
        </div>
        <Tabnav items={[Note.title]} i={tabNav} setI={setTN} icons={isTask ? iconsT : iconsN} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                <div className="shadow" style={{ width: '100%', borderRadius: '4px', padding: '12px 16px', maxHeight: '300px', overflowY: 'auto', marginTop: '16px', overflowX: 'auto' }}>
                    <div dangerouslySetInnerHTML={{ __html: Note.text }} />
                </div>
                {isTask && <>
                    <h6 style={iS}>DUE DATE</h6>
                    <div className="input-group" style={iG}>
                        <input type={'date'} disabled min={(new Date(Date.now()).toISOString()).slice(0, 10)} className="form-control" placeholder={'Select Date'} value={due} onChange={e => handleInputD(e)} />
                    </div>
                    {errD && <div style={eS}>This field is required</div>}
                    <h6 style={iS}>STATUS</h6>
                    <select className="form-control" style={{ width: '90%' }} disabled={(isTask && status === 'Closed')} defaultValue={status} onChange={e => handleSelect(e)}>
                        <option data-name={''}>Choose here</option>
                        {['In Progress', 'Completed'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                    </select>
                </>}
                {((at && at.length > 0) || (ct && ct.length > 0)) && <h6 style={iS}>ATTACHED FOLDER/FILE</h6>}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    {ct && ct.length > 0 && renderCat()}
                    {at && at.length > 0 && renderFile()}
                    {rec && <div className="col-lg-2 col-4 mFWS">
                        <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '12px', width: 'fit-content' }}>
                            <div onClick={e => downloadFileN(rec._id)} style={{
                                width: '20px', height: '20px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                                justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                            }}>
                                <div style={{ width: '11px', height: '11px', cursor: 'pointer', backgroundImage: `url('${Down}')` }} />
                            </div>
                        </h6>
                        <img src={returnType(rec.type)} style={{ cursor: 'pointer' }} alt="Recording" onClick={e => {
                            handleFile(rec, 1);
                        }} />
                        <h6 style={{ fontSize: '12px', marginTop: '6px', cursor: 'pointer' }} onClick={e => {
                            handleFile(rec, 1);
                        }}>{`${rec.name}`}</h6>
                    </div>}
                </div>
            </div>
            <Discussion id={id} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={false}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF}
                disabled={(Note.isTask && Note.editable && Note.status === 'Closed')} />
        </div>
        {modal && <CreateFileModal id={org} setting={setting && setting.setting} _id={profile && profile._id} onhandleModal={onhandleModal} />}
        {tempFId && <DeleteModal handleModalDel={e => removeFile(false)} handleDelete={async e => removeFile(true)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {tempCId && <DeleteModal handleModalDel={e => removeCat(false)} handleDelete={async e => removeCat(true)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}
        {ModalF && f && <Suspense fallback={<></>}> <ModalFile uId={profile && profile._id} file={f} onhandleModalView={handleModalView} t={t} /> </Suspense>}
        {MF && <Suspense fallback={<></>}> <ModalFolder disabled={disabled} setModal={e => {
            setMDF(false);
            setCId('');
            setModal(true);
        }} _id={_id} org={org} onAttachCat={attachCat} onAttachFile={attachFile} cId={cId} setCId={setCId} onhandleModal={e => {
            setMDF(false);
            setCId('');
        }} /> </Suspense>}
        {MC && <Suspense fallback={<></>}> <ModalRec _id={_id} org={org} onhandleModal={handleModalC} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
        {MCV && <Suspense fallback={<></>}>  <ModalRecV _id={_id} org={org} onhandleModal={handleModalCV} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
    </div>

}

const mapStateToProps = state => {
    return {
        setting: state.setting.data,
    }
};

export default connect(mapStateToProps, { updateNote, addComment, updateTask, updateTaskL, downloadFileN, downloadFile })(Details);