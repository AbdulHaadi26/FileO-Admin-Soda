import React, { useEffect, useState, Suspense, lazy } from 'react';
import ButtonDown from './buttonDown';
import '../style.css';
import ConvertDate from '../../containers/dateConvert';
import User from '../../../assets/static/user.png';
import Tabnav from '../../tabnav';
import { addComment } from '../../../redux/actions/discussionActions';
import { connect } from 'react-redux';
import Discussion from '../../discussion';
import GView from '../../../assets/tabnav/G-admin files.svg';
import BView from '../../../assets/tabnav/B-admin files.svg';
let icons = [
    { G: GView, B: BView }
];
const FileType = lazy(() => import('../../containers/fileType'));
const Select = lazy(() => import('./select'));
const dF = { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' };
const iS = { width: '50px', height: '50px', borderRadius: '1000px', marginRight: '12px' };

const ViewPage = ({ disabled, File, setTN, tabNav, addComment, updated, discussion, updateChat, profile, count, offset, setOF, _id }) => {
    const [width, setWidth] = useState(0), [version, setVer1] = useState([]), [url1, setUrl1] = useState(''), [ver1, setV1] = useState(0), [p1, setP1] = useState(''), [d1, setD1] = useState(''), [desc1, setDesc1] = useState(''),
        [id1, setId] = useState(''), [i1, setI1] = useState(''), [t1, setT1] = useState(''), [message, setMessage] = useState('');

    useEffect(() => {
        if (File && File.versions && File.versions.length > 0 && File.file) {
            let latestVersion = File.versions.length - 1;

            File.versions = File.versions.sort(function (a, b) {
                var textA = a.version;
                var textB = b.version;
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            let latestFile = File.versions[latestVersion];

            setVer1(File.versions); setId(latestFile._id);
            setUrl1(latestFile.url); setV1(latestFile.version);
            setP1(latestFile.postedby ? latestFile.postedby.name : '');
            setD1(latestFile.date);
            setDesc1(latestFile.description ? latestFile.description : '');
            setI1(latestFile.postedby ? latestFile.postedby.image : '');
            setT1(latestFile.type);
        }
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    }, [File])

    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, i) => <Suspense fallback={<></>}>
        <FileType width={width} type={type} url={url} name={name} />
        <div style={dF}>
            <img src={i ? i : User} alt="user" style={iS} />
            <h6 className="name mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        <h6 className="desc">{desc}</h6>
    </Suspense>

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setUrl1(e.target.options[selectedIndex].getAttribute('data-key'));
            setId(e.target.options[selectedIndex].getAttribute('data-id'));
            setV1(e.target.options[selectedIndex].getAttribute('data-ver'));
            setP1(e.target.options[selectedIndex].getAttribute('data-post'));
            setD1(e.target.options[selectedIndex].getAttribute('data-date'));
            setDesc1(e.target.options[selectedIndex].getAttribute('data-desc'));
            setI1(e.target.options[selectedIndex].getAttribute('data-img'));
            setT1(e.target.options[selectedIndex].getAttribute('data-type'));
        }
    }

    if (File && File.file) var { name, versioning, compare, category } = File.file;

    return <div className="col-11 p-0 sh-w">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">File</h4>
            <div style={{ marginLeft: 'auto' }} />
            {version && version.length > 0 && url1 !== '' && versioning && <Suspense fallback={<></>}>
                <Select ver1={ver1} version={version} compare={compare} onhandleSelect={handleSelect} />
            </Suspense>}
            {id1 !== '' && <ButtonDown id={id1} disabled={disabled} />}
        </div>
        <Tabnav items={[name ? name : '']} i={tabNav} icons={icons} setI={setTN} />
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                {url1 !== '' && t1 !== '' && !versioning && !compare && renderAccordingToFileTypesDyn(t1, url1, name, p1, d1, desc1, i1)}
                {url1 !== '' && t1 !== '' && versioning && renderAccordingToFileTypesDyn(t1, url1, name, p1, d1, desc1, i1)}
            </div>
            <Discussion id={_id} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={true}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} isFile={true} catId={category ? category._id : category} />
        </div>
    </div>
}

export default connect(null, { addComment })(ViewPage);