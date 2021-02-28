import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { registerTicket, registerTicketImage } from '../../../redux/actions/ticketActions';
import '../style.css';
import RegisterC from '../../containers/registerContainer';
const Image = lazy(() => import('./image'));
const InputText = lazy(() => import('../../inputs/inputText'));
const InputTextA = lazy(() => import('../../inputs/inputTextArea'));

const Add = ({ registerTicket, org, registerTicketImage }) => {
    const [title, setT] = useState(''), [errT, setET] = useState(false), [description, setD] = useState(''), [errD, setED] = useState(false), [errB, setEB] = useState(false), [err, setErr] = useState(false),
        [img, setI] = useState(''), [image, setImg] = useState(''), [fN, setFN] = useState(''), [size, setFS] = useState(0), [mime, setMT] = useState('');

    const handleSubmit = e => {
        e.preventDefault();
        if (image) {
            var data2 = { title: title, description: description, mimeType: mime, size, fName: fN };
            title && description && registerTicketImage(data2, image);
            !title && setET(true);
            !description && setED(true);
        } else {
            var data = { title: title, description: description };
            title && description && registerTicket(data, org);
            !title && setET(true);
            !description && setED(true);
        }
    }

    const handleImagePreview = e => {
        try {
            if (e.target.files && e.target.files[0]) {
                let file = e.target.files[0];
                setMT(file.type); setFN(file.name); setFS(file.size);
                if (file.type === 'image/x-png' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
                    setI(URL.createObjectURL(file))
                    if (file.size <= (1024 * 1024 * 5)) { setImg(file); setErr(false); setEB(false); }
                    else setErr(true);
                } else setEB(true);
            } else setEB(true);
        } catch { setEB(true); }
    }

    const onhandleTitle = e => { setT(e.target.value); setET(false); }
    const onhandleDescription = e => { setD(e.target.value); setED(false); }

    return <RegisterC onSubmit={handleSubmit} text={'Generate Ticket'}>
        <Suspense fallback={<></>}>
            <InputText t={`TICKET TITLE`} plh={`Enter title`} tp={'text'} val={title} handleInput={onhandleTitle} err={errT} />
            <InputTextA t={`TICKET DESCRIPTION`} plh={`Enter description`} tp={'text'} val={description} handleInput={onhandleDescription} err={errD} />
            <Image img={img} err={err} errBroken={errB} onhandleImagePreview={handleImagePreview} />
        </Suspense>
    </RegisterC>
}

export default connect(null, { registerTicket, registerTicketImage })(Add);