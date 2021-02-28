import React, { useState, Suspense, lazy } from 'react';
import '../style.css';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import Tabnav from '../../tabnav';
import { connect } from 'react-redux';
import { addComment } from '../../../redux/actions/discussionActions';
import Discussion from '../../discussion';
const ModalFile = lazy(() => import('../modelView'));
const cS = { cursor: 'pointer' };

const NoteView = ({ Note, Rec, tabNav, setTN, updated, profile, discussion, count, addComment, offset, setOF, updateChat }) => {
    const [f, setF] = useState(''), [ModalF, setMF] = useState(''), [t, setT] = useState(2), [message, setMessage] = useState('');

    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    const handleFile = (file, i) => {
        setF(file);
        setT(i);
        setMF(true);
    };

    const renderFile = at => at.map(a => <div key={a._id} className="nt-f-w2" style={{ margin: '6px 12px' }} onClick={e => handleFile(a, 2)}>
        <img style={cS} src={returnType(a.type)} alt="type" />
        <h6 style={cS}>{`${a.name}`}</h6>
    </div>);

    const renderCat = at => at.map(a => <div key={a._id} className="nt-f-w2" style={{ margin: '6px 12px' }}>
        {a && a.uId && <Link style={cS} to={`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`}>{`${a.name}`}</Link>}
    </div>);

    const handleModalView = (e, val) => setMF(val);

    return <div className="col-11 nt-w p-0">
        <h4 className="h">{Note.isTask ? 'Task' : 'Note'}</h4>
        <Tabnav items={[Note.title]} i={tabNav} setI={setTN} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
            {((Note.editable && !Note.isTask) || (Note.isTask && Note.editable && Note.status !== 'Closed')) && <Link to={`/organization/${Note.org}/myspace/user/${Note.postedby}/notes/shared/details/${Note._id}`}>{Note.isTask ? 'Edit Task' : 'Edit Note'}</Link>}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                <div style={{ width: '100%', borderRadius: '4px', border: '#d2dae2 1px solid', padding: '12px', minHeight: '200px', marginTop: '12px', overflowX: 'auto' }}>
                    <div dangerouslySetInnerHTML={{ __html: Note.text }} />
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                    {Note.catList && Note.catList.length > 0 && renderCat(Note.catList)}
                    {Note.attachment && Note.attachment.length > 0 && renderFile(Note.attachment)}
                    {Rec && Rec.url && <div className="nt-f-w2" style={{ margin: '6px 12px' }} onClick={e => handleFile(Rec, 1)}>
                        <img style={cS} src={returnType(Rec.type)} alt="type" />
                        <h6 style={cS}>{`${Rec.name}`}</h6>
                    </div>}
                </div>
            </div>
            <Discussion id={Note._id} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={true}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} />
        </div>

        {ModalF && f && <Suspense fallback={<></>}> <ModalFile file={f} onhandleModalView={handleModalView} t={t} /> </Suspense>}
    </div >
}

export default connect(null, { addComment })(NoteView);