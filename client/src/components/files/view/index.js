import React, { Suspense, lazy, useState, useEffect } from 'react';
import '../style.css';
import ButtonDown from './buttonDown';
import ConvertDate from '../../containers/dateConvert';
import Heart from '../../../assets/empty-heart.svg';
import Filled from '../../../assets/heart-filled.svg';
import { AddToF, DelToF } from '../../../redux/actions/fvrActions';
import { connect } from 'react-redux';
import Org from '../../../assets/static/org.svg';
import Tabnav from '../../tabnav';
const dF = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' };
const FileType = lazy(() => import('../../containers/fileType'));
const HigRes = lazy(() => import('./higRes'));
const LowRes = lazy(() => import('./lowRes'));
const Select = lazy(() => import('./select'));

const View = ({ File, getF, AddToF, DelToF, tabNav, setTN }) => {
    const [width, setWidth] = useState(0), [cmp, setCmp] = useState(false), [version, setVer1] = useState([]), [version2, setVer2] = useState([]), [url1, setUrl1] = useState(''), [id1, setId1] = useState(''), [i, setI] = useState(0),
        [ver1, setV1] = useState(0), [url2, setUrl2] = useState(''), [ver2, setV2] = useState(0), [p1, setP1] = useState(''), [p2, setP2] = useState(''), [d1, setD1] = useState(''), [id2, setId2] = useState(''),
        [d2, setD2] = useState(''), [desc1, setDesc1] = useState(''), [desc2, setDesc2] = useState(''), [i1, setI1] = useState(''), [i2, setI2] = useState(''), [t1, setT1] = useState(''), [t2, setT2] = useState('');

    useEffect(() => {
        if (File && File.versions && File.versions.length > 0 && File.file) {
            let latestVersion = !File.file.latest ? 0 : File.versions.length - 1;

            File.versions = File.versions.sort(function (a, b) {
                var textA = a.version;
                var textB = b.version;
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            let latestFile = File.versions[latestVersion];

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
    }, [File, setId1, setId2]);

    const uWD = () => setWidth(window.innerWidth);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, i) => <Suspense fallback={<></>}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' }}>
            <img src={i ? i : Org} alt="user" style={{ width: '50px', height: '50px', borderRadius: '1000px', marginRight: '12px' }} />
            <h6 className="name mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        <h6 className="desc">{desc}</h6>
        <FileType width={width} cmp={cmp} type={type} url={url} name={name} />
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
        if (File && File.file)
            var { name } = File.file;
        return width === 0 || width >= 992 ? <>
            {cmp && version && version.length > 0 && url1 !== '' && url2 !== '' && t1 !== '' && t2 !== '' && id1 !== '' && id2 !== '' && <Suspense fallback={<></>}>
                <HigRes width={width} cmp={cmp} type1={t1} type2={t2} url1={url1} url2={url2} name={name} ver1={ver1} ver2={ver2} i2={i2}
                    p1={p1} p2={p2} d1={d1} d2={d2} desc1={desc1} desc2={desc2} version={version} version2={version2} i1={i1} id1={id1} id2={id2}
                    onhandleSelect={handleSelect} onhandleSelect2={handleSelect2} />
            </Suspense>} </> : <>
                {cmp && version2 && version2.length > 0 && url1 !== '' && url2 !== '' && t1 !== '' && t2 !== '' && id1 !== '' && id2 !== '' && <Suspense fallback={<></>}>
                    <LowRes width={width} cmp={cmp} type1={t1} type2={t2} url1={url1} url2={url2} name={name} ver1={ver1} ver2={ver2} i1={i1}
                        p1={p1} p2={p2} d1={d1} d2={d2} desc1={desc1} desc2={desc2} version={version} version2={version2} i2={i2} id1={id1} id2={id2}
                        onhandleSelect={handleSelect} onhandleSelect2={handleSelect2} />
                </Suspense>}
            </>
    }

    const Add = async () => {
        var data = { fileId: _id, fileType: 0, pId: '' };
        i === 0 ? await AddToF(data) : await DelToF({ fileId: _id });
        getF();
        setI(1);
    }

    if (File && File.file) var { _id, name, versioning, latest, compare, date, postedby, description, type, url } = File.file;

    return <div className="col-11 p-0 f-w">
        <h4 className="h">File</h4>
        <Tabnav items={[name ? name : '']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <h6 className={`order`} onClick={e => Add()}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${i === 0 ? Heart : Filled}')` }} /></h6>
            {id1 !== '' && !cmp && <ButtonDown id={id1} />}
        </div>
        <div style={dF}>
            {!cmp && version && version.length > 0 && versioning && compare && <button className="btn btn-dark" type="button" onClick={e => setCmp(!cmp)}>Compare Version</button>}
            {cmp && versioning && compare && <button className="btn btn-dark" type="button" onClick={e => setCmp(!cmp)}>Standalone View</button>}
        </div>
        {!cmp && version && version.length > 0 && url1 !== '' && versioning && !latest && <Suspense fallback={<></>}>
            <Select ver1={ver1} version={version} compare={compare} onhandleSelect={handleSelect} />
        </Suspense>}
        {!cmp && !versioning && url !== '' && type !== '' && _id !== '' && !compare && renderAccordingToFileTypesDyn(type, url, name, postedby ? postedby.name : '', date, description, postedby ? postedby.image : '')}
        {!cmp && versioning && url1 !== '' && t1 !== '' && id1 !== '' && renderAccordingToFileTypesDyn(t1, url1, name, p1, d1, desc1, i1)}
        {versioning && !latest && compare && renderScreenSize()}
    </div>
}

export default connect(null, { AddToF, DelToF })(View)