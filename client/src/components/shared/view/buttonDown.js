import React from 'react';
import { connect } from 'react-redux';
import { downloadFile } from '../../../redux/actions/userFilesActions';
import Down from '../../../assets/downB.svg';

const ButtonDown = ({ id, downloadFile, mT, disabled }) => <h6 className={`order`} style={{ marginTop: mT, marginLeft: '12px' }} onClick={e => !disabled && downloadFile(id)}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Down}')` }} /></h6>

export default connect(null, { downloadFile })(ButtonDown);