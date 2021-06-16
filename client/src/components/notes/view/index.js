import React, { useState, Suspense, lazy, useRef, useEffect } from 'react';
import '../style.css';
import More from '../../../assets/more.svg';
import Folder from '../../../assets/folder.svg';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import Tabnav from '../../tabnav';
import { connect } from 'react-redux';
import { addComment } from '../../../redux/actions/discussionActions';
import Discussion from '../../discussion';
import history from '../../../utils/history';
import BNote from '../../../assets/tabnav/B-notes.svg';
import GNote from '../../../assets/tabnav/G-notes.svg';
import BTask from '../../../assets/tabnav/B-Team Task.svg';
import GTask from '../../../assets/tabnav/G-Team task.svg';
import Down from '../../../assets/downB.svg';
import { downloadFile } from '../../../redux/actions/userFilesActions';
import { downloadFileN } from '../../../redux/actions/noteActions';
let iconsN = [
    { G: GNote, B: BNote }
];

let iconsT = [
    { G: GTask, B: BTask }
];
const ModalFile = lazy(() => import('../modelView'));
const cS2 = {
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '8px',
    textAlign: 'center', wordBreak: 'break-all'
};
const bSE = { borderBottom: 'solid 1px #dcdde1' };

const NoteView = ({
    Note, Rec, tabNav, setTN, updated, profile, discussion, count,
    addComment, offset, setOF, updateChat, downloadFile, downloadFileN
}) => {
    const [f, setF] = useState(''), [ModalF, setMF] = useState(''), [t, setT] = useState(2), [message, setMessage] = useState(''), [active, setAct] = useState(false);

    const node = useRef({});

    useEffect(() => {
        const handleClick = e => {
            if (((Note.editable && !Note.isTask) || (Note.isTask && Note.editable && Note.status !== 'Closed')))
                if (node && node.current && !node.current.contains(e.target)) {
                    setAct(false);
                }
        };
        document.addEventListener('mousedown', handleClick, true);
    }, [Note.editable, Note.status, Note.isTask]);

    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    const handleFile = (file, i) => {
        setF(file);
        setT(i);
        setMF(true);
    };

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

    const renderFile = at => {
        let temp = at.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        return temp.map(a => <div key={a._id} className="col-lg-2 col-4 mFWS">
            <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '12px', width: 'fit-content' }}>
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
    };

    const renderCat = at => {
        let temp = at.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        return temp.map(a => <div key={a._id} className="col-lg-2 col-4 mFWS">
            <img src={Folder} alt="Folder" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`)} />
            {a && a.uId && <Link style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', wordBreak: 'break-all' }} to={`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`}>{a.name.length > 35 ? `${a.name.substr(0, 35)}...` : a.name}</Link>}
            {a.uId && a.uId.name ? <h6 style={{ marginTop: '8px', fontSize: '10px', color: 'gray', textAlign: 'center' }}>By {a.uId.name} on {a.date && renderDate(a.date)}</h6> :
                <h6 style={{ marginTop: '8px', fontSize: '10px', color: 'gray', textAlign: 'center' }}>By {profile.name} on {renderDate(a.date)}</h6>}
        </div>);
    };

    const handleModalView = (e, val) => setMF(val);

    return <div className="col-11 nt-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">{Note.isTask ? 'Task' : 'Note'}</h4>
            <div style={{ marginLeft: 'auto' }} />
            {((Note.editable && !Note.isTask) || (Note.isTask && Note.editable && Note.status !== 'Closed')) && <h6 className={`order`} style={{ position: 'relative', marginTop: '0px' }} onClick={e => setAct(!active)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                    <h6 className='s-l' style={bSE} onClick={e => {
                        setAct(false); history.push(`/organization/${Note.org}/myspace/user/${Note.postedby}/notes/shared/details/${Note._id}`)
                    }}>{Note.isTask ? 'Edit Task' : 'Edit Note'}</h6>
                </div>
            </h6>}
        </div>
        <Tabnav items={[Note.title]} i={tabNav} setI={setTN} icons={Note.isTask ? iconsT : iconsN} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                {Note.text && <div style={{ width: '100%', borderRadius: '4px', border: '#d2dae2 1px solid', padding: '12px', maxHeight: '300px', overflowY: 'auto', marginTop: '12px', overflowX: 'auto' }}>
                    <div dangerouslySetInnerHTML={{ __html: Note.text }} />
                </div>}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                    {Note.catList && Note.catList.length > 0 && renderCat(Note.catList)}
                    {Note.attachment && Note.attachment.length > 0 && renderFile(Note.attachment)}
                    {Rec && Rec.url && <div className="col-lg-2 col-4 mFWS">
                        <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '12px', width: 'fit-content' }}>
                            <div onClick={e => downloadFileN(Rec._id)} style={{
                                width: '20px', height: '20px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                                justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                            }}>
                                <div style={{ width: '11px', height: '11px', cursor: 'pointer', backgroundImage: `url('${Down}')` }} />
                            </div>
                        </h6>
                        <img src={returnType(Rec.type)} style={{ cursor: 'pointer' }} alt="Recording" onClick={e => {
                            handleFile(Rec, 1);
                        }} />
                        <h6 style={{ fontSize: '12px', marginTop: '6px', cursor: 'pointer' }} onClick={e => {
                            handleFile(Rec, 1);
                        }}>{`${Rec.name}`}</h6>
                    </div>}
                </div>
            </div>
            <Discussion id={Note._id} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={true}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} disabled={(Note.isTask && Note.editable && Note.status === 'Closed')} />
        </div>

        {ModalF && f && <Suspense fallback={<></>}> <ModalFile file={f} onhandleModalView={handleModalView} t={t} /> </Suspense>}
    </div >
}

export default connect(null, { addComment, downloadFileN, downloadFile })(NoteView);