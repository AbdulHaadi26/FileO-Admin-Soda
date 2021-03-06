import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import '../style.css';
import ModalLink from './modalLink';
import ConvertDate from '../../containers/dateConvert';
import { AddToF, DelToF } from '../../../redux/actions/fvrActions';
import { connect } from 'react-redux';
import User from '../../../assets/static/user.png';
import Tabnav from '../../tabnav';
import { addComment } from '../../../redux/actions/discussionActions';
import Discussion from '../../discussion';
import More from '../../../assets/more.svg';
import Assigned from '../modals/shared';
import { downloadFile } from '../../../redux/actions/userFilesActions';
import { generateUrl } from '../../../redux/actions/userFilesActions';
import GView from '../../../assets/tabnav/G-admin files.svg';
import BView from '../../../assets/tabnav/B-admin files.svg';
import { clientUrl } from '../../../utils/api';
let icons = [
    { G: GView, B: BView }
];
const bS = { borderBottom: 'solid 1px #dcdde1' };
const FileType = lazy(() => import('../../containers/fileType'));
const HigRes = lazy(() => import('./higRes'));
const LowRes = lazy(() => import('./lowRes'));

const View = ({ File, AddToF, DelToF, tabNav, setTN, ver, discussion, updated, profile, count, offset, setOF, addComment, updateChat, downloadFile, generateUrl, disabled }) => {
    const [width, setWidth] = useState(0), [cmp, setCmp] = useState(false), [version, setVer1] = useState([]), [version2, setVer2] = useState([]), [url1, setUrl1] = useState(''), [id1, setId1] = useState(''), [mId, setMID] = useState(''),
        [ver1, setV1] = useState(0), [url2, setUrl2] = useState(''), [ver2, setV2] = useState(0), [p1, setP1] = useState(''), [p2, setP2] = useState(''), [d1, setD1] = useState(''), [id2, setId2] = useState(''), [sM, setSM] = useState(''),
        [d2, setD2] = useState(''), [desc1, setDesc1] = useState(''), [desc2, setDesc2] = useState(''), [i1, setI1] = useState(''), [i2, setI2] = useState(''), [t1, setT1] = useState(''), [t2, setT2] = useState(''), [i, setI] = useState(0),
        [message, setMessage] = useState(''), [active, setAct] = useState(false), [shMod, setSHMOD] = useState(false)

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
        if (File && File.versions && File.file) {
            let latestVersion = File.versions.length - 1;

            File.versions = File.versions.sort(function (a, b) {
                var textA = a.version;
                var textB = b.version;
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            let latestFile = File.versions[ver !== null ? ver : latestVersion];

            setVer1(File.versions); setVer2(File.versions);
            setId1(latestFile._id); setId2(latestFile._id);
            setUrl1(latestFile.url); setV1(latestFile.version);
            setUrl2(latestFile.url); setV2(latestFile.version);
            setP1(latestFile.postedby ? latestFile.postedby.name : ''); setP2(latestFile.postedby ? latestFile.postedby.name : '');
            setD1(latestFile.date); setD2(latestFile.date);
            setDesc1(latestFile.description ? latestFile.description : ''); setDesc2(latestFile.description ? latestFile.description : '');
            setI1(latestFile.postedby ? latestFile.postedby.image : ''); setI2(latestFile.postedby ? latestFile.postedby.image : '');
            setT1(latestFile.type); setT2(latestFile.type); setI(File.isF ? 1 : 0);
        }
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    }, [File, ver])

    if (File && File.file) var { name, url, _id, postedby, org } = File.file;

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, i) => <Suspense fallback={<></>}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' }}>
            <img src={i ? i : User} alt="user" style={{ width: '50px', height: '50px', borderRadius: '1000px', marginRight: '12px' }} />
            <h6 className="name mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        <h6 className="desc">{desc}</h6>
        <FileType width={width} cmp={cmp} type={type} url={url} name={name} />
    </Suspense>

    const handleModal = (bool, Id) => {
        setSM(bool);
        setMID(Id);
    }

    const handleEmailModal = (text) => window.location.href = `mailto:?subject=Shared%20Url&body=Url:%20${text}`;

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setId1(e.target.options[selectedIndex].getAttribute('data-id'));
            setUrl1(e.target.options[selectedIndex].getAttribute('data-key'));
            setV1(e.target.options[selectedIndex].getAttribute('data-ver'));
            setP1(e.target.options[selectedIndex].getAttribute('data-post'));
            setD1(e.target.options[selectedIndex].getAttribute('data-date'));
            setDesc1(e.target.options[selectedIndex].getAttribute('data-desc'));
            setI1(e.target.options[selectedIndex].getAttribute('data-img'));
            setT1(e.target.options[selectedIndex].getAttribute('data-type'));
        }
    }

    const handleSelect2 = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setId2(e.target.options[selectedIndex].getAttribute('data-id'));
            setUrl2(e.target.options[selectedIndex].getAttribute('data-key'));
            setV2(e.target.options[selectedIndex].getAttribute('data-ver'));
            setP2(e.target.options[selectedIndex].getAttribute('data-post'));
            setD2(e.target.options[selectedIndex].getAttribute('data-date'));
            setDesc2(e.target.options[selectedIndex].getAttribute('data-desc'));
            setI2(e.target.options[selectedIndex].getAttribute('data-img'));
            setT2(e.target.options[selectedIndex].getAttribute('data-type'));
        }
    }

    const renderScreenSize = () => {
        if (File && File.file) var { name, postedby, org } = File.file;
        return width === 0 || width >= 992 ? <> {cmp && version && version.length > 0 && url1 !== '' && url2 !== '' && t1 !== '' && t2 !== '' && id1 !== '' && id2 !== '' && <Suspense fallback={<></>}>
            <HigRes disabled={disabled} postedby={postedby} org={org} width={width} cmp={cmp} type1={t1} type2={t2} url1={url1} url2={url2} name={name} ver1={ver1} ver2={ver2} i2={i2}
                p1={p1} p2={p2} d1={d1} d2={d2} desc1={desc1} desc2={desc2} version={version} version2={version2} i1={i1} id1={id1} id2={id2}
                onhandleSelect={handleSelect} onhandleSelect2={handleSelect2} onhandleModal={handleModal} />
        </Suspense>} </ > : <> {cmp && version2 && version2.length > 0 && url1 !== '' && url2 !== '' && t1 !== '' && t2 !== '' && id1 !== '' && id2 !== '' && <Suspense fallback={<></>}>
            <LowRes disabled={disabled} postedby={postedby} org={org} width={width} cmp={cmp} type1={t1} type2={t2} url1={url1} url2={url2} name={name} ver1={ver1} ver2={ver2} i1={i1}
                p1={p1} p2={p2} d1={d1} d2={d2} desc1={desc1} desc2={desc2} version={version} version2={version2} i2={i2} id1={id1} id2={id2}
                onhandleSelect={handleSelect} onhandleSelect2={handleSelect2} onhandleModal={handleModal} />
        </Suspense>} </>
    }

    const Add = async () => {
        if (_id) {
            let data = { fileId: _id, fileType: 2, pId: '' };
            i === 0 ?
                await AddToF(data) :
                await DelToF({ fileId: _id });
            setI(1);
        }
    };

    const renderOptions = versions => versions.map(Item => <option data-key={Item.url} key={Item._id} data-id={Item._id} data-ver={`${Item.version}`} data-img={Item.postedby ? Item.postedby.image : ''} data-type={Item.type}
        data-post={Item.postedby ? Item.postedby.name : ''} data-date={Item.date} data-desc={Item.description}>Version {Item.version}</option>);

    if (File && File.file) var { category, versionId } = File.file;

    return <div className="col-11 p-0 f-w">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">User File</h4>
            <div style={{ marginLeft: 'auto' }} />
            {!cmp && version && version.length > 1 && url1 !== '' && <select className={`custom-select col-lg-3 col-6`} style={{ marginRight: '12px', marginTop: '-8px' }} onChange={e => handleSelect(e)} defaultValue={`Version ${ver1}`}>
                {renderOptions(version)}
            </select>}
            <h6 ref={node} className="order orderA" style={{ position: 'relative', width: 'fit-content', marginRight: '0px', marginTop: '0px' }} onClick={e => setAct(!active)}>
                <div style={{ width: '16px', height: '16px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => setSHMOD(true)}>Share</h6>
                    {!File.isF ?
                        <h6 className='s-l' style={bS} onClick={e => {
                            setAct(false);
                            Add();
                        }}>Add To Favorites</h6> :
                        <h6 className='s-l' style={bS} onClick={e => {
                            setAct(false);
                            Add();
                        }}>Remove From Favorites</h6>}
                    <h6 className='s-l' style={bS} onClick={e => {
                        !disabled && generateUrl(versionId);
                        !disabled && handleEmailModal(`${clientUrl}/shared/file/${versionId}`);
                    }}>Share By Email</h6>
                    {!cmp && version && version.length > 1 && <h6 className='s-l' style={bS} onClick={e => { setAct(false); setCmp(!cmp); }}>Compare Version</h6>}
                    {cmp && version && version.length > 1 && <h6 className='s-l' style={bS} onClick={e => { setAct(false); setCmp(!cmp) }}>Standalone View</h6>}
                    <h6 className='s-l' style={bS} onClick={e => {
                        setAct(false);
                        !disabled && downloadFile(id1);
                    }}>Download File</h6>
                    <h6 className='s-l' onClick={e => !disabled && handleModal(true, versionId)}>Generate link</h6>
                </div>
            </h6>
        </div>
        <Tabnav items={[name ? name : '']} i={tabNav} setI={setTN} icons={icons} />
        {shMod && <Assigned id={org} _id={postedby} fId={versionId} onhandleModal={e => setSHMOD(false)} />}

        {!cmp && <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                {version && version.length <= 1 && url !== '' && t1 !== '' && id1 !== '' && renderAccordingToFileTypesDyn(t1, url, name, p1, d1, desc1, i1)}
                {version && version.length > 1 && url !== '' && t1 !== '' && id1 !== '' && renderAccordingToFileTypesDyn(t1, url1, name, p1, d1, desc1, i1)}
            </div>
            <Discussion id={versionId} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={false}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} isFile={true} catId={category ? category._id : category} />
        </div>}
        {cmp && renderScreenSize()}
        {sM && mId !== '' && <ModalLink id={mId} showModal={handleModal} />}
    </div>
}

export default connect(null, { AddToF, DelToF, addComment, generateUrl, downloadFile })(View);