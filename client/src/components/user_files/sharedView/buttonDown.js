import React from 'react';
import { connect } from 'react-redux';
import { downloadFile } from '../../../redux/actions/userFilesActions';
import Down from '../../../assets/downB.svg';

const ButtonDown = ({ id, downloadFile, mT }) => <h6 className={`order`} style={{ marginTop: mT }} onClick={e => downloadFile(id)}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Down}')`, marginLeft: '4px' }} /></h6>


export default connect(null, { downloadFile })(ButtonDown);