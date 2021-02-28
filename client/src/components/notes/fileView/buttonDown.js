import React from 'react';
import { connect } from 'react-redux';
import { downloadFile} from '../../../redux/actions/noteActions';
import Down from '../../../assets/downB.svg';

const ButtonDown = ({ id, downloadFile, mT }) => <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
    <h6 className={`order`} style={{ marginTop: mT }} onClick={e => downloadFile(id)}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Down}')` }} /></h6>
 </div>

export default connect(null, { downloadFile})(ButtonDown);