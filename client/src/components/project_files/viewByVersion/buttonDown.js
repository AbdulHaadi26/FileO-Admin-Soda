import React from 'react';
import { connect } from 'react-redux';
import { downloadFile } from '../../../redux/actions/project_filesActions';
import Down from '../../../assets/downB.svg';

const ButtonDown = ({ id, downloadFile, mT }) => <h6 className={`order`} style={{ marginTop: mT }} onClick={e => downloadFile(id)}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Down}')` }} /></h6>

export default connect(null, { downloadFile })(ButtonDown);