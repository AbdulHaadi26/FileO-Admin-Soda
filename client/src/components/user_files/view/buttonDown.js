import React, { useState } from 'react';
import { connect } from 'react-redux';
import { downloadFile, generateUrl } from '../../../redux/actions/userFilesActions';
import Down from '../../../assets/downB.svg';
import Url from '../../../assets/urlB.svg';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

const ButtonDown = ({ id, downloadFile, showModal, showEmailModal, mT, showShareModal, generateUrl }) => {
    const [active, setAct] = useState(false);

    const shareWithin = () => {
        setAct(false);
        showShareModal(true);
    }

    const handleModal = () => {
        setAct(false);
        showModal(true, id);
    }

    const handleModalEmail = () => {
        setAct(false);
        generateUrl(id);
        showEmailModal(`https://ocidev.file-o.com:4224/shared/file/${id}`);
    }

    return <div style={{ display: 'flex', flexDirection: 'row' }}>
        <h6 className={`order`} style={{ margin: mT }} onClick={e => downloadFile(id)}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Down}')` }} /></h6>
        <h6 className={`order`} style={{ margin: mT, position: 'relative' }} onClick={e => setAct(!active)}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Url}')` }} />
            {active && <div style={pF} onClick={e => setAct(false)} ></div>}
            <div className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}`, top:'30px' }}>
                <h6 className='s-l' style={bS} onClick={e => shareWithin()}>Share</h6>
                <h6 className='s-l' style={bS} onClick={e => handleModalEmail()}>Share By Email</h6>
                <h6 className='s-l' onClick={e => handleModal()}>Generate link</h6>
            </div>
        </h6>
    </div>
}

export default connect(null, { downloadFile, generateUrl })(ButtonDown);