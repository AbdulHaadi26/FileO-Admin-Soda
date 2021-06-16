import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { uploadImage } from '../../redux/actions/profileActions';
import Resizer from 'react-image-file-resizer';
import User from '../../assets/static/user.png';
import Org from '../../assets/static/org.svg';
import './style.css';
const iS = { width: '150px', height: '150px', borderRadius: '1000px' };
const iL = { fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { fontWeight: 700, color: '#b33939', fontSize: '12px' };
const mt = { marginTop: '16px', marginBottom: '16px' };
const mB = { marginTop: '16px' };
const mS = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const EditImage = ({ handleModal, val, name, head, num, modal, refAct, uploadImage, id, imgSize }) => {
    const [sM, setSM] = useState(false), [err, setE] = useState(false), [errR, setErrR] = useState(false), [IS, setIS] = useState(false), [v, setV] = useState(''), [i, setI] = useState(''), [errB, setErrB] = useState(false), [size, setS] = useState(), [mT, setMT] = useState(''), [s, setFS] = useState(0), [iN, setIN] = useState('');

    useEffect(() => {
        setV(val);
        setS(imgSize);
        setSM(modal);
    }, [modal, val, imgSize])

    const handleImagePreview = e => {
        try {
            if (e.target.files && e.target.files[0]) {
                let f = e.target.files[0];
                setMT(f.type); setFS(f.size); setIN(f.name);
                if (f.type === 'image/x-png' || f.type === 'image/png' || f.type === 'image/gif' || f.type === 'image/jpg' || f.type === 'image/jpeg') {
                    Resizer.imageFileResizer(f, 200, 200, 'JPEG', 80, 0, uri => setV(URL.createObjectURL(uri)), 'blob');
                    if (f.size <= (1024 * 1024 * size)) {
                        Resizer.imageFileResizer(f, 200, 200, 'JPEG', 80, 0, uri => {
                            if (uri.size <= 1024 * 50) {
                                setI(uri); setIS(true);
                            } else setErrR(true);
                            setE(false); setErrB(false);
                        }, 'blob');
                    }
                    else setE(true);
                } else setErrB(true);
            } else setErrB(true);
        } catch { setErrB(true); }
    }

    const showModal = async e => {
        modal && await handleModal(0);
        handleModal(num);
    }

    const hideModal = e => {
        setV(val); setIS(false); setE(false);
        handleModal(0);
    }

    const handleUpdate = e => {
        e.preventDefault();
        if (IS && mT && s && iN) {
            setE(false); setIS(false); setErrB(false); handleModal(0);
            chooseReference();
        } else setE(true);
    }

    const chooseReference = () => {
        let data = { id: id, image: iN, mimeType: mT, fileSize: s };
        switch (refAct) {
            case 'profile': uploadImage(data, i, id); break;
            default: break;
        }
    }

    const renderButtons = name => IS ? <button type="submit" className="btn btn-primary" name={name}>Upload Image</button> : <input type='file' className="btn col-lg-4 col-md-5 col-sm-6 col-12 " accept="image/x-png,image/png,image/gif,image/jpeg,image/jpg" onChange={e => handleImagePreview(e)} />

    const renderError = (err, eB, errR) => err ? <div className="mr-auto" style={eS}> Image size exceeds the limit </div> :
        eB ? <div className="mr-auto" style={eS}> Image type not supported </div> :
            errR ? <div className="mr-auto" style={eS}> Image resolution not supported </div> :
                <div className="mr-auto" style={iL}> Limit: {size}mb </div>

    return sM ? <div className="animated fadeIn faster">
        <form className="modal-content" style={mt} onSubmit={e => handleUpdate(e)}>
            <div className="modal-header">
                <h6 className="static">Update Photo</h6>
            </div>
            <div className="modal-body" style={mS}>
                <img src={v ? v : refAct === 'organization' ? Org : User} alt={refAct === 'organization' ? 'logo' : 'user'} style={iS} />
            </div>
            <div className="modal-footer" style={mB}>
                {renderError(err, errB, errR)}
                <button type="button" className="btn btn-danger" onClick={e => hideModal(e)} >Cancel</button>
                {renderButtons(name)}
            </div>
        </form>
    </div> : <div className="data">
            <h6 className="static mr-auto">{head}</h6>
            <img src={v ? v : refAct === 'organization' ? Org : User} alt={refAct === 'organization' ? 'logo' : 'user'} className="user-profile" />
            <h6 className="link" name={name} onClick={e => showModal(e)}><div className="fa-edit" /></h6>
        </div>
}

export default connect(null, { uploadImage })(EditImage);