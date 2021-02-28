import React, { useState, Suspense, lazy, useEffect, useRef } from 'react';
import '../style.css';
import '../snow.css';
import { connect } from 'react-redux';
import { updateNote, updateTask, updateTaskL } from '../../../redux/actions/noteActions';
import returnType from '../../types';
import Cross from '../../../assets/cross.svg';
import Tabnav from '../../tabnav';
import CreateFileModal from '../../user_files/addModal';
import { Link } from 'react-router-dom';
import { addComment } from '../../../redux/actions/discussionActions';
import More from '../../../assets/more.svg';
import Discussion from '../../discussion';
import DeleteModal from '../../containers/deleteContainer';
const mT = { marginTop: '16px' };
const Modal = lazy(() => import('../modals/attachFile'));
const ModalFile = lazy(() => import('../modelView'));
const ModalRec = lazy(() => import('../modelRec'));
const ModalRecV = lazy(() => import('../modelRecVideo'));
const ModalFolder = lazy(() => import('../modals/attachFolder'));
const iS = { margin: '16px 0px 8px 0px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const tM = { width: '12px', height: '12px', marginTop: '2px', cursor: 'pointer', backgroundImage: `url('${Cross}')`, marginLeft: '6px' };
const tM2 = { width: '12px', height: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')`, marginLeft: '6px', marginTop: '6px' };
const cS = { cursor: 'pointer' };
const cS2 = { cursor: 'pointer', marginTop: '0px' };
const bSE = { borderBottom: 'solid 1px #dcdde1' };
const iG = { marginTop: '2px', width: '90%' };
const eS = { marginTop: '16px', marginBottom: '12px', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };

const Details = ({
    org, _id, Note, updateNote, setting, Rec, tabNav, setTN, profile, updateTaskL,
    discussion, count, offset, setOF, addComment, updateChat, updated, updateTask
}) => {
    const [id, setId] = useState(''), [note, setNote] = useState(''), [at, setAT] = useState([]), [modal, setModal] = useState(false), [MD, setMD] = useState(false), [c, setC] = useState('#ffffcc'), [f, setF] = useState(''), [ModalF, setMF] = useState(false), [MF, setMDF] = useState(false),
        [rec, setRec] = useState(''), [MC, setMC] = useState(false), [MCV, setMCV] = useState(false), [message, setMessage] = useState(''), [activeT, setActT] = useState(false), [isTask, setIT] = useState(false), [due, setDue] = useState(''), [status, setStatus] = useState('Open'),
        [t, setTp] = useState(2), [cbEditable, setCBE] = useState(false), [ct, setCT] = useState([]), [tempFId, setTempFId] = useState(''), [tempCId, setTempCId] = useState(''), [errD, setErrD] = useState(false);
    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setActT(false);
        }
    };


    useEffect(() => {
        setId(Note._id); setAT(Note.attachment); setNote(Note.text); setRec(Rec); setC(Note.color);
        setCBE(Note.editable); setCT(Note.catList ? Note.catList : []); setIT(Note.isTask);
        if (Note.isTask) {
            setDue(Note.due);
            setStatus(Note.status);
        }
    }, [Note, Rec, setId, setAT, setNote]);

    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    const handleModal = (e, val) => setMD(val);

    const attachCat = (e, cat) => {
        let bool = false;
        let tempCat = ct;
        tempCat.map(tF => {
            if (tF._id === cat._id) bool = true;
            return tF;
        });
        if (!bool) {
            let fl = { _id: cat._id, name: cat.name, uId: profile && profile._id, date: new Date(Date.now()).toISOString() };
            tempCat.push(fl);
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
    }

    const attachFile = (e, file) => {
        var bool = false;
        var tempFile = at;
        tempFile.map(tF => {
            if (tF._id === file._id) bool = true;
            return tF;
        });
        if (!bool) {
            var fl = { _id: file._id, name: file.name, type: file.type, url: file.url, postedby: profile && profile._id, date: new Date(Date.now()).toISOString() };
            tempFile.push(fl);
        }

        if (Note.isTask) handleUpdateTAuto(tempFile, ct);
        else handleUpdateAuto(tempFile, ct);
    };

    const handleFile = (file, i) => {
        setF(file); setTp(i); setMF(true);
    }

    const removeFile = (isTrue) => {
        if (!isTrue) return setTempFId('');
        let tempFile = at;
        tempFile = tempFile.filter(tF => tF._id !== tempFId);
        if (Note.isTask) handleUpdateTAuto(tempFile, ct);
        else handleUpdateAuto(tempFile, ct);
    }

    const handleModalCat = (e, val) => setMDF(val);

    const renderColor = () => ['#ffffcc', '#7efff5', '#ff9ff3', '#7bed9f', '#f8c291', '#f7f1e3'].map(col => <div key={col} style={{ width: '30px', height: '30px', border: col === c ? '1px solid black' : '', marginLeft: '6px', backgroundColor: col, cursor: 'pointer' }} onClick={e => setC(col)} />);

    const renderFile = () => {
        let tempL = at;
        if (tempL && tempL.length > 0) {
            tempL = tempL.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            return tempL.map(a => <div key={a._id} className="nt-f-w" style={{ alignItems: 'flex-start' }}>
                <img style={cS} src={returnType(a.type)} alt="type" onClick={e => handleFile(a, 2)} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h6 style={cS2} onClick={e => handleFile(a, 2)}>{`${a.name}`}</h6>
                    {a.postedby && a.postedby.name ? <h6 style={{ fontSize: '12px', color: 'gray' }}>By {a.postedby.name} on {a.date && renderDate(a.date)}</h6> :
                        <h6 style={{ fontSize: '12px', color: 'gray' }}>By {profile.name} on {a.date && renderDate(a.date)}</h6>}
                </div>
                {profile && profile._id === a.postedby._id && <div style={tM} onClick={e => a && a._id && setTempFId(a._id)} />}
            </div>);
        }
    }

    const handleUpdateAuto = (at, ct) => {
        var arr = [], cats = [];
        if (c && Note && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => a && a._id && arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => c && c._id && cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: Note.title, text: note, color: c, fileList: arr, catList: cats, isEdt: true,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable
            };
            updateNote(data);
        }
    }

    const handleUpdateTAuto = e => {
        var arr = [], cats = [];
        if (c && Note && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
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

            return list.map(a => <div key={a._id} className="nt-f-w" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Link style={{ marginTop: '0px', marginLeft: '10px' }} to={`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`}>{`${a.name}`}</Link>
                    {a.uId && a.uId.name ? <h6 style={{ marginLeft: '10px', fontSize: '12px', color: 'gray' }}>By {a.uId.name} on {a.date && renderDate(a.date)}</h6> :
                        <h6 style={{ marginLeft: '10px', fontSize: '12px', color: 'gray' }}>By {profile.name} on {a.date && renderDate(a.date)}</h6>}
                </div>
                {profile && profile._id === a.uId._id && <div style={tM2} onClick={e => a && a._id && setTempCId(a._id)} />}
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
    const handleRec = fData => { setRec(fData); setMC(false); setMCV(false); }
    const handleModalView = (e, val) => setMF(val);

    const onhandleModal = (file, val) => {
        if (file) {
            var tempFile = at ? at : [];
            var bool = false;
            tempFile.map(tF => {
                if (tF && tF._id && tF._id === file._id) bool = true;
                return tF;
            });
            if (!bool) {
                var fl = { _id: file._id, name: file.name, type: file.type, postedby: { _id: profile._id, name: profile.name }, url: file.url, date: new Date(Date.now()).toISOString() };
                tempFile.push(fl);
            }
            if (Note.isTask) handleUpdateTAuto(tempFile, ct);
            else handleUpdateAuto(tempFile, ct);
        }
        setModal(val);
    }

    return <div className="col-11 nt-w p-0">
        <h4 className="h">{Note.isTask ? 'Shared Task' : 'Shared Note'}</h4>
        <Tabnav items={[Note.title]} i={tabNav} setI={setTN} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px', marginBottom: '12px', alignItems: 'center' }}>
            <h6 className={`order`} style={{ position: 'relative', marginTop: '0px', marginBottom: '-2px' }} onClick={e => setActT(!activeT)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" ref={node} style={{ display: `${activeT ? 'flex' : 'none'}` }}>
                    <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false); setMD(true);
                    }}>Attach From My Space</h6>
                    <h6 className='s-l' style={bSE} onClick={e => { setActT(false); setMDF(true); }}>Attach Folder</h6>
                    <h6 className='s-l' onClick={e => {
                        setActT(false); setModal(true);
                    }}>Attach From PC</h6>
                </div>
            </h6>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                <div className="shadow" style={{ width: '100%', borderRadius: '4px', padding: '12px 16px', minHeight: '200px', marginTop: '16px', overflowX: 'auto' }}>
                    <div dangerouslySetInnerHTML={{ __html: Note.text }} />
                </div>
                {isTask && <>
                    <h6 style={iS}>DUE DATE</h6>
                    <div className="input-group" style={iG}>
                        <input type={'date'} disabled min={(new Date(Date.now()).toISOString()).slice(0, 10)} className="form-control" placeholder={'Select Date'} value={due} onChange={e => handleInputD(e)} />
                    </div>
                    {errD && <div style={eS}>This field is required</div>}
                    <h6 style={iS}>STATUS</h6>
                    <select className="form-control" style={{ width: '90%' }} defaultValue={status} onChange={e => handleSelect(e)}>
                        <option data-name={''}>Choose here</option>
                        {['In Progress', 'Completed'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                    </select>
                </>}
                {ct && ct.length > 0 && <>
                    <h6 style={iS}>ATTACHED FOLDER</h6>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                        {renderCat()}
                    </div>
                </>}
                {at && at.length > 0 && <>
                    <h6 style={iS}>ATTACHED FILE</h6>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                        {renderFile()}
                    </div>
                </>}
                <h6 style={iS}>Color</h6>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    {renderColor()}
                </div>
            </div>
            <Discussion id={id} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={false}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} />
        </div>
        {modal && <CreateFileModal id={org} setting={setting && setting.setting} _id={profile && profile._id} onhandleModal={onhandleModal} />}
        {tempFId && <DeleteModal handleModalDel={e => removeFile(false)} handleDelete={async e => removeFile(true)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {tempCId && <DeleteModal handleModalDel={e => removeCat(false)} handleDelete={async e => removeCat(true)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}
        {ModalF && f && <Suspense fallback={<></>}> <ModalFile file={f} onhandleModalView={handleModalView} t={t} /> </Suspense>}
        {MF && <Suspense fallback={<></>}> <ModalFolder _id={profile && profile._id} org={org} onAttach={attachCat} onhandleModal={handleModalCat} /> </Suspense>}
        {MD && <Suspense fallback={<></>}> <Modal _id={profile && profile._id} org={org} onAttach={attachFile} onhandleModal={handleModal} /> </Suspense>}
        {MC && <Suspense fallback={<></>}> <ModalRec _id={_id} org={org} onhandleModal={handleModalC} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
        {MCV && <Suspense fallback={<></>}>  <ModalRecV _id={_id} org={org} onhandleModal={handleModalCV} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
    </div>

}

const mapStateToProps = state => {
    return {
        setting: state.setting.data,
    }
}

export default connect(mapStateToProps, { updateNote, addComment, updateTask, updateTaskL })(Details);