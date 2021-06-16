import React from 'react';
import '../style.css';
import { connect } from 'react-redux';
import Tabnav from '../../tabnav';
import { downloadFile } from '../../../redux/actions/project_filesActions';
import GANC from '../../../assets/tabnav/G-announcement.svg';
import BANC from '../../../assets/tabnav/B-announcement.svg';
import dateConvert from '../../containers/dateConvert';
const vC = { boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.42), 0 2px 4px 0 rgba(0, 0, 0, 0.69)', borderRadius: '3px', marginTop:'20px' };

let icons = [
    { G: GANC, B: BANC }
];

const View = ({ annc, tabNav, setTN }) => {

    const { name, description, date, type, rec } = annc;

    return <div className="col-11 p-0 f-w">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">Project Annoucement</h4>
            <div style={{ marginLeft: 'auto' }} />
        </div>
        <Tabnav items={[name ? name : '']} i={tabNav} icons={icons} setI={setTN} />
        <h6 style={{ marginTop: '30px', fontSize: '14px' }}><b>Dated:</b> {dateConvert(date)}</h6>
        <p style={{ marginTop: '12px' }}>{description}</p>
        {type === 'audio' && <audio controls className="col-12 p-0" style={vC}> <source src={rec} type="audio/mpeg" /> Your browser does not support the audio element. </audio>}
        {type === 'video' && <video className="col-12 p-0" style={vC} controls> <source src={rec} type="video/mp4" /> Your browser does not support the video tag.</video>}
    </div>
}

export default connect(null, { downloadFile })(View);