import React, { Suspense, lazy, useState } from 'react';
import returnType, { finalizeType } from '../types';
import { clientUrl } from '../../utils/api';
import Axios from 'axios';
import Cross from '../../assets/cross.svg';
import '../style.css';
import Container from '../container';
import File from '../../assets/static/file.svg';
const InputText = lazy(() => import('../inputs/inputText'));
const InputTextA = lazy(() => import('../inputs/inputTextArea'));
const fC = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const iS = { marginTop: '30px', width: '120px', height: '120px', marginBottom: '20px' };
const mB = { marginBottom: '12px', marginLeft: '24px' };
const tS = { marginTop: '16px', width: '100%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { width: '100%', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const tM = { width: '12px', height: '12px', marginLeft: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')` };
const dF2 = { width: '90%', marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' };

export default ({ setting, onhandleS, onhandleFD, postedby, category }) => {
    const [description, setDescription] = useState(''), [uname, setUN] = useState(''), [errE, setErrE] = useState(false),
        [arr, setArr] = useState([]), [errS, setErrS] = useState(false), [fl, setFL] = useState([]), [email, setE] = useState(''),
        [erruN, setErrUN] = useState(false), [contact, setC] = useState(''), [errEM, setErrEM] = useState(false);

    var fileSize = setting.maxFileSize ? setting.maxFileSize : 5;

    const handleFilePreview = e => {
        var ar = [], fL = [];
        if (e.target.files && e.target.files.length > 0 && e.target.files.length < 11) {
            setErrE(false); setErrS(false);
            for (let i = 0; i < e.target.files.length; i = i + 1) {
                var file = e.target.files[i];
                var type = file.name.split(".");
                if (file.size <= (fileSize * 1024 * 1024)) {
                    var data = {
                        name: file.name, size: file.size, mime: file.type, type: finalizeType(type[type.length - 1]), fName: file.name,
                        description: description ? description : '', contact: contact, uname: uname, email: email, percentCheck: 0
                    }
                    ar.push(data);
                    fL.push(file);
                }
            }
        } else {
            if (!e.target.files || e.target.files.length <= 0) setErrE(true);
            else if (e.target.files.length > 10) setErrS(true);
        }
        setArr(ar); setFL(fL);
    }

    // eslint-disable-next-line
    const reCE = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    const reWS = /\s/g;

    const handleSubmit = async e => {
        e.preventDefault();
        if ((email && !reCE.test(email)) || (reWS.test(email))) return setErrEM(true);

        if (arr && arr.length > 0 && fl.length > 0 && uname) {
            arr.map(ar => {
                ar.description = description ? description : '';
                ar.contact = contact;
                ar.uname = uname;
                ar.email = email
                return ar;
            });
            onhandleFD(arr);
            onhandleS(3, 0);
            var i = 0;
            for (const f of arr) {
                await uploadFileM(f, fl[i], arr, i);
                i = i + 1;
            }
        } else {
            setErrUN(true);
            arr.length <= 0 && setErrE(true);
        }
    }

    const uploadFileM = async (f, fL, fLst, i) => {
        try {
            let res;
            if (category) {
                res = await Axios.put(`${clientUrl}/apiC/client/${postedby}/category/${category}/file/upload`, f);
            } else {
                res = await Axios.put(`${clientUrl}/apiC/client/${postedby}/file/upload`, f);
            }
            if (!res.data.error && res.data.file && res.data.url) {
                let percentCheck = 0;
                await Axios.put(res.data.url, fL, {
                    onUploadProgress: function (progressEvent) {
                        percentCheck = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        fLst[i].percentCheck = percentCheck;
                        onhandleFD(fLst, percentCheck);
                    }
                });
            } else {
                fLst[i].err = true;
            }
        } catch {
            fLst[i].err = true;
        }

    }

    // eslint-disable-next-line
    const re = /^[0-9\b]+$/;

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);

    const onhandleInputU = e => {
        setUN(e.target.value);
        erruN && setErrUN(false);
    }
    const onhandleInputE = e => {
        setE(e.target.value);
        errEM && setErrEM(false);
    }

    const onhandleInputC = e => {
        if (re.test(e.target.value) || e.target.value === '') setC(e.target.value);
    }

    const removeFile = a => {
        let ar = arr;
        ar = ar.filter(i => i.name !== a.name);
        setArr(ar);
    }

    const renderFL = () => arr.map(a => <div key={a.name} className="nt-f-w">
        <img src={returnType(a.type)} alt="type" />
        <h6>{`${a.name}`}</h6>
        <div style={tM} onClick={e => removeFile(a)} />
    </div>);

    return <Container>
        <div className="col-12 p-0" style={fC}>
            <div className="col-12 p-0" style={dF}>
                <img src={File} alt="Upload File" style={iS} />
                <input type="file" className="btn" style={mB} onChange={e => handleFilePreview(e)} multiple />
                {errE && <div className="mr-auto" style={eS}>No file selected</div>}
                {errS && <div className="mr-auto" style={eS}>Maximum of 10 files can be uploaded</div>}
                <hr style={{ width: '100%' }}></hr>
            </div>
            {arr && arr.length > 0 && <h6 style={tS}>FILES</h6>}
            {arr && arr.length > 0 && <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>{renderFL()}</div>}
            <hr style={{ width: '100%' }} />
            <Suspense fallback={<></>}>
                <InputText t={`NAME`} plh={`Enter your name`} tp={'text'} val={uname} handleInput={onhandleInputU} err={erruN} />
                <InputText t={`EMAIL`} plh={`Enter email`} tp={'email'} val={email} handleInput={onhandleInputE} err={false} />
                {errEM && <div className="mr-auto" style={eS}>Email format is incorrect.</div>}
                <InputText t={`CONTACT NUMBER`} plh={`Enter contact number`} tp={'text'} val={contact} handleInput={onhandleInputC} err={false} />
                <InputTextA t={arr && arr.length > 1 ? 'DESCRIPTION' : `FILE DESCRIPTION`} plh={`Enter description`} tp={'text'} val={description} handleInput={onhandleInputA} err={false} />
                <div style={dF2}>
                    <p className="word-count">{description.split(" ").length} / 500</p>
                </div>
            </Suspense>
            <button className="btn btn-primary btn-block" type="button" style={{ marginTop: '20px' }} onClick={e => handleSubmit(e)}>Upload File</button>
        </div>
    </Container>
}
