import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import '../style.css';
import ConvertDate from '../../containers/dateConvert';
import User from '../../../assets/static/user.png';
import Tabnav from '../../tabnav';
import { addComment } from '../../../redux/actions/discussionActions';
import { connect } from 'react-redux';
import Discussion from '../../discussion';
import { downloadFile } from '../../../redux/actions/userFilesActions';
import More from '../../../assets/more.svg';
import GView from '../../../assets/tabnav/G-admin files.svg';
import BView from '../../../assets/tabnav/B-admin files.svg';
let icons = [
    { G: GView, B: BView }
];
const FileType = lazy(() => import('../../containers/fileType'));
const bS = { borderBottom: 'solid 1px #dcdde1' };

const ViewPage = ({ disabled, File, tabNav, setTN, updated, updateChat, addComment, discussion, profile, offset, setOF, count, _id, downloadFile }) => {
    const [width, setWidth] = useState(0), [version, setVer] = useState([]), [url1, setUrl1] = useState(''), [id1, setId1] = useState(''), [p1, setP1] = useState(''),
        [d1, setD1] = useState(''), [desc1, setDesc1] = useState(''), [i1, setI1] = useState(''), [active, setAct] = useState(false),
        [message, setMessage] = useState(''), [t1, setT1] = useState('');

    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    useEffect(() => {
        if (File && File.versions && File.versions.length > 0 && File.file) {
            let latestVersion = File.versions.length - 1;

            File.versions = File.versions.sort(function (a, b) {
                var textA = a.version;
                var textB = b.version;
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            let latestFile = File.versions[latestVersion];

            setId1(latestFile._id); setVer(File.versions);
            setUrl1(latestFile.url);
            setP1(latestFile.postedby ? latestFile.postedby.name : '');
            setD1(latestFile.date);
            setDesc1(latestFile.description ? latestFile.description : '');
            setI1(latestFile.postedby ? latestFile.postedby.image : '');
            setT1(latestFile.type);
        }
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => { window.removeEventListener('resize', updateWindowDimensions); }
    }, [File])

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, i, id) => <Suspense fallback={<></>}>
        <FileType width={width} cmp={false} type={type} url={url} name={name} />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' }}>
            <img src={i ? i : User} alt="user" style={{ width: '40px', height: '40px', borderRadius: '1000px', marginRight: '12px' }} />
            <h6 className="date mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        <h6 className="desc">{desc}</h6>
    </Suspense>

    if (File && File.file) var { name, url, category } = File.file;

    return <div className="col-11 p-0 f-w">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">Shared File</h4>
            <div style={{ marginLeft: 'auto' }} />
            <h6 ref={node} className="order orderA" style={{ position: 'relative', width: 'fit-content', marginRight: '0px', marginTop: '0px' }} onClick={e => setAct(!active)}>
                <div style={{ width: '16px', height: '16px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => {
                        setAct(false);
                        !disabled && downloadFile(id1);
                    }}>Download File</h6>
                </div>
            </h6>
        </div>
        <Tabnav items={[name ? name : '']} i={tabNav} setI={setTN} icons={icons} />
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                {version && version.length <= 1 && url !== '' && t1 !== '' && id1 !== '' && renderAccordingToFileTypesDyn(t1, url, name, p1, d1, desc1, i1, id1)}
                {version && version.length > 1 && url !== '' && t1 !== '' && id1 !== '' && renderAccordingToFileTypesDyn(t1, url1, name, p1, d1, desc1, i1, id1)}
            </div>
            <Discussion id={_id} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={true}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} isFile={true} catId={category ? category._id : category} />
        </div>
    </div>
}

export default connect(null, { addComment, downloadFile })(ViewPage);