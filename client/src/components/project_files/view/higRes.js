import React, { lazy, Suspense } from 'react';
import User from '../../../assets/static/user.png';
import ButtonDown from './buttonDown';
import ConvertDate from '../../containers/dateConvert';
const FileType = lazy(() => import('../../containers/fileType'));
const mT = { marginTop: '12px', marginBottom: '12px' };
const dF = { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' };
const dS = { width: '40px', height: '40px', borderRadius: '1000px', marginRight: '12px', marginTop:'12px' };

export default ({ disabled, name, type1, type2, url1, url2, ver1, ver2, cmp, width, version, version2, p1, p2, d1, d2, desc1, desc2, i1, i2, id1, id2, onhandleSelect, onhandleSelect2 }) => <>
    <div className="f-v-w" style={mT}>
        <select className="custom-select col-lg-4" onChange={e => onhandleSelect(e)} defaultValue={`Version ${ver1}`}>
            {renderOptions(version)}
        </select>
        <ButtonDown id={id1} url={url1} mT='-0px' disabled={disabled} />
        <ButtonDown id={id2} url={url2} mT='-0px' disabled={disabled} />
        <select className="custom-select col-lg-4" onChange={e => onhandleSelect2(e)} defaultValue={`Version ${ver2}`}>
            {renderOptions(version2)}
        </select>
    </div>
    <div className="f-v-w">
        <div className="col-lg-6 p-1"><Suspense fallback={<></>}>
            <FileType width={width} cmp={cmp} type={type1} url={url1} name={name} />
            <div style={dF}>
                <img src={i1 ? i1 : User} alt="user" style={dS} />
                <h6 className="name mr-auto">{p1}</h6>
                <h6 className="date">Uploaded on {ConvertDate(d1)}</h6>
            </div>
            <h6 className="desc">{desc1}</h6>
        </Suspense></div>
        <div className="col-lg-6 p-1"><Suspense fallback={<></>}>
            <FileType width={width} cmp={cmp} type={type2} url={url2} name={name} />
            <div style={dF}>
                <img src={i2 ? i2 : User} alt="user" style={dS} />
                <h6 className="name mr-auto">{p2}</h6>
                <h6 className="date">Uploaded on {ConvertDate(d2)}</h6>
            </div>
            <h6 className="desc">{desc2}</h6>
        </Suspense></div>
    </div>
</>

const renderOptions = versions => versions.map(Item => <option data-id={Item._id} data-key={Item.url} key={Item._id} data-ver={`${Item.version}`} data-img={Item.postedby ? Item.postedby.image : ''} data-type={Item.type} data-post={Item.postedby ? Item.postedby.name : ''} data-date={Item.date} data-desc={Item.description}>Version {Item.version}</option >);