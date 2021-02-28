import React from 'react';
import { connect } from 'react-redux';
import { downloadFile, urlFile } from '../../../redux/actions/clientFilesAction';
import Down from '../../../assets/downB.svg';
import Url from '../../../assets/urlB.svg';

const ButtonDown = ({ id, downloadFile, mT, showModal, urlFile }) => <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
    <h6 className={`order`} style={{ marginTop: mT }} onClick={e => downloadFile(id)}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Down}')` }} /></h6>
    <h6 className={`order`} style={{ marginTop: mT }} onClick={e => { urlFile(id); showModal(true); }}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Url}')` }} /></h6>
</div>

export default connect(null, { downloadFile, urlFile })(ButtonDown);