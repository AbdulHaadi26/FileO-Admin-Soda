import React, { useState } from 'react';
import Plus from '../../../assetsFile-O/arrowDown.svg';
import './style.css';

let list = [
    {
        q: 'How much time will we actually save?',
        a: `More time than you might expect. A typical employee spends 30–40% of his or her time searching for documents in email, hard drives, and filing cabinets. This doesn’t factor in subsequent time it will take to scan, copy, send, or re-file the document.
        Wouldn’t it be nice to get that time back and put it to better use? With File-O, you can!`
    }, {
        q: 'Are there any limits to what documents can be captured in File-O?',
        a: `There are no limits! Every document you have can be saved into File-O. And everything means everything, from Docs files to PDFs and from Excel to PowerPoint, every File is stored in one central repository. You won’t have to go through multiple systems to get your files ever again.`
    }, {
        q: 'I already know how to find my documents. How will File-O help me?',
        a: 'You may know how to find your documents, but that doesn’t mean anyone else will. With File-O, document management can be truly standardized across your company. When documents are stored and categorized consistently, it makes it easy for anyone to find any document, now and in the future.'
    }, {
        q: ' Anyone can find documents in File-O? What about documents that need to be kept secure?',
        a: `Anyone who is only allowed can find documents. Documents can be secured by sharing with only people you know, which means they can be made accessible to only those people whom you allow.`
    }, {
        q: 'Can File-O integrate with third party software systems?',
        a: `For now, File-O cannot integrate with third party software systems.`
    }, {
        q: ' Can I export my documents from File-O into a Windows folder?',
        a: `Yes. File-O allows you to export a single document or even all of the documents into a Windows folder by downloading it from the system.`
    }, {
        q: 'Does File-o enables a manager to see the recent documents?',
        a: `Yes. File-O keeps an audit trail on every document uploaded by the project manager, so that project manager can always check the recent viewed documents.`
    }, {
        q: 'Does File-O allow for version control?',
        a: `Yes, you can set version control on a document-by-document basis. An assigned user can always see the latest version of the documents if the versioning of the document is activated by the uploader.`
    }, {
        q: 'What browsers can File-O support?',
        a: `File-O supports Google Chrome, Mozilla Firefox, UC Browser and Edge.`
    }, {
        q: 'What forms of payments do you accept?',
        a: `We accept a variety of payment methods including, Debit/Credit Card and Easy Paisa payments.`
    }

];

export default ({ mref, setStarted }) => {

    const [j, setJ] = useState(-1);

    const renderList = () => {
        return list && list.length > 0 ? list.map((i, k) => <div className="card col-12 p-0" key={k}>
            <h5 style={{ padding: '12px 30px' }}>{i.q}</h5>
            {(k !== list.length - 1 || k === j) && <div style={{ width: '100%', height: '1.5px', backgroundColor: '#f5f6fa' }}></div>}
            {(k === j) && <p style={{ padding: '12px 30px' }}>{i.a}</p>}
            {k === j && k !== list.length - 1 &&
                <div style={{ width: '100%', height: '1.5px', backgroundColor: '#f5f6fa' }}></div>}
            <img src={Plus} alt="Arrow Down" onClick={e => j !== k ? setJ(k) : setJ(-1)}
                className="sign" style={{ width: '14px', height: '14px', cursor: 'pointer', marginRight: '12px' }} />
        </div>) : <h3 style={{ marginTop: '12px', fontSize: '16px', color: 'gray' }}>No Answers found</h3>;
    }

    return <div className="faq">
        <div className="mid">
            <div className="col-lg-11 col-12" style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '33px', fontWeight: '600' }}>FAQS</h1>
                <div className="form" style={{ marginTop: '24px' }}>
                    {renderList()}
                </div>
            </div>

        </div>
        <div style={{ marginBottom: '30px' }}></div>
    </div>
}