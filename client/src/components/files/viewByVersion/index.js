import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import '../style.css';
import ConvertDate from '../../containers/dateConvert';
import { AddToF, DelToF } from '../../../redux/actions/fvrActions';
import { connect } from 'react-redux';
import Org from '../../../assets/static/user.png';
import Tabnav from '../../tabnav';
import More from '../../../assets/more.svg';
import { downloadFile } from '../../../redux/actions/fileActions';
import GView from '../../../assets/tabnav/G-admin files.svg';
import BView from '../../../assets/tabnav/B-admin files.svg';
let icons = [
    { G: GView, B: BView }
];
const bS = { borderBottom: 'solid 1px #dcdde1' };
const FileType = lazy(() => import('../../containers/fileType'));
const HigRes = lazy(() => import('./higRes'));
const LowRes = lazy(() => import('./lowRes'));

const View = ({ File, AddToF, DelToF, tabNav, setTN, ver, downloadFile, disabled }) => {
    const [width, setWidth] = useState(0), [cmp, setCmp] = useState(false), [version, setVer1] = useState([]), [version2, setVer2] = useState([]), [url1, setUrl1] = useState(''), [id1, setId1] = useState(''), [i, setI] = useState(0),
        [ver1, setV1] = useState(0), [url2, setUrl2] = useState(''), [ver2, setV2] = useState(0), [p1, setP1] = useState(''), [p2, setP2] = useState(''), [d1, setD1] = useState(''), [id2, setId2] = useState(''), [active, setAct] = useState(false),
        [d2, setD2] = useState(''), [desc1, setDesc1] = useState(''), [desc2, setDesc2] = useState(''), [i1, setI1] = useState(''), [i2, setI2] = useState(''), [t1, setT1] = useState(''), [t2, setT2] = useState('');
    const node = useRef({});

    useEffect(() => {
        if (File && File.versions && File.versions.length > 0 && File.file) {
            let latestVersion = !File.file.latest ? 0 : File.versions.length - 1;

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
            setT1(latestFile.type); setT2(latestFile.type);
            setI(File.isF ? 1 : 0);
        }
        uWD();
        window.addEventListener('resize', uWD);
        return () => { window.removeEventListener('resize', uWD); }
    }, [File, setId1, setId2, ver]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const uWD = () => setWidth(window.innerWidth);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, i) => <Suspense fallback={<></>}>
        <FileType width={width} cmp={cmp} type={type} url={url} name={name} />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' }}>
            <img src={i ? i : Org} alt="user" style={{ width: '40px', height: '40px', borderRadius: '1000px', marginRight: '12px' }} />
            <h6 className="name mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        <h6 className="desc">{desc}</h6>
    </Suspense>


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
    };

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
    };

    const renderScreenSize = () => {
        if (File && File.file) var { name } = File.file;
        return width === 0 || width >= 992 ? <>
            {cmp && version && version.length > 0 && url1 !== '' && url2 !== '' && t1 !== '' && t2 !== '' && id1 !== '' && id2 !== '' && <Suspense fallback={<></>}>
                <HigRes disabled={disabled} width={width} cmp={cmp} type1={t1} type2={t2} url1={url1} url2={url2} name={name} ver1={ver1} ver2={ver2} i2={i2}
                    p1={p1} p2={p2} d1={d1} d2={d2} desc1={desc1} desc2={desc2} version={version} version2={version2} i1={i1} id1={id1} id2={id2}
                    onhandleSelect={handleSelect} onhandleSelect2={handleSelect2} />
            </Suspense>} </> : <>
            {cmp && version2 && version2.length > 0 && url1 !== '' && url2 !== '' && t1 !== '' && t2 !== '' && id1 !== '' && id2 !== '' && <Suspense fallback={<></>}>
                <LowRes disabled={disabled} width={width} cmp={cmp} type1={t1} type2={t2} url1={url1} url2={url2} name={name} ver1={ver1} ver2={ver2} i1={i1}
                    p1={p1} p2={p2} d1={d1} d2={d2} desc1={desc1} desc2={desc2} version={version} version2={version2} i2={i2} id1={id1} id2={id2}
                    onhandleSelect={handleSelect} onhandleSelect2={handleSelect2} />
            </Suspense>}
        </>
    };

    const Add = async () => {
        let data = { fileId: _id, fileType: 0, pId: '' };
        i === 0 ? await AddToF(data) : await DelToF({ fileId: _id });
        setI(1);
    };

    const renderOptions = versions => versions.map(Item => <option data-key={Item.url} key={Item._id} data-id={Item._id} data-ver={`${Item.version}`} data-img={Item.postedby ? Item.postedby.image : ''} data-type={Item.type}
        data-post={Item.postedby ? Item.postedby.name : ''} data-date={Item.date} data-desc={Item.description}>Version {Item.version}</option>);

    if (File && File.file) var { _id, name, versioning, latest, compare, date, postedby, description, type, url } = File.file;

    return <div className="col-11 p-0 f-w">
        <Tabnav items={[name ? name : '']} icons={icons} i={tabNav} setI={setTN} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">File</h4>
            <div style={{ marginLeft: 'auto' }} />
            {!cmp && version && version.length > 1 && url1 !== '' && <select className={`custom-select col-lg-3 col-6`} style={{ marginRight: '12px', marginTop: '-8px' }} onChange={e => handleSelect(e)} defaultValue={`Version ${ver1}`}>
                {renderOptions(version)}
            </select>}
            <h6 ref={node} className="order orderA" style={{ position: 'relative', width: 'fit-content', marginRight: '0px', marginTop: '0px' }} onClick={e => setAct(!active)}>
                <div style={{ width: '16px', height: '16px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}`, top: '12px' }}>
                    {!File.isF ?
                        <h6 className='s-l' style={bS} onClick={e => { setAct(false); Add(); }}>Add To Favorites</h6> :
                        <h6 className='s-l' style={bS} onClick={e => { setAct(false); Add(); }}>Remove From Favorites</h6>}
                    {!cmp && version && version.length > 0 && versioning && compare && <h6 className='s-l' style={bS} onClick={e => { setAct(false); setCmp(!cmp); }}>Compare Version</h6>}
                    {cmp && versioning && compare && <h6 className='s-l' style={bS} onClick={e => { setAct(false); setCmp(!cmp) }}>Standalone View</h6>}
                    <h6 className='s-l' style={bS} onClick={e => { setAct(false); !disabled && downloadFile(_id); }}>Download File</h6>
                </div>
            </h6>
        </div>
        {!cmp && !versioning && url !== '' && type !== '' && _id !== '' && !compare && renderAccordingToFileTypesDyn(type, url, name, postedby ? postedby.name : '', date, description, postedby ? postedby.image : '')}
        {!cmp && versioning && url1 !== '' && t1 !== '' && id1 !== '' && renderAccordingToFileTypesDyn(t1, url1, name, p1, d1, desc1, i1)}
        {versioning && !latest && compare && renderScreenSize()}
    </div>
}

export default connect(null, { AddToF, DelToF, downloadFile })(View)