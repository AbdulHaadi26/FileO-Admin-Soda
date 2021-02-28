import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import Tabnav from '../../tabnav';
import { updateOrganization } from '../../../redux/actions/organizationActions';
const OText = lazy(() => import('../../edits/editText'));
const OTextArea = lazy(() => import('../../edits/editTextArea'));
const OImage = lazy(() => import('../../edits/editImage'));
const Dashes = lazy(() => import('./Dashes'));
const Storage = lazy(() => import('./storage'));
const t = { textAlign: 'right' };

const Details = ({ setting, Org, empCount, roleCount, catCount, tabNav, setTN }) => {
    const { _id, name, email, contact, address, data_uploaded, available, active_plan, logo, countryCode } = Org;
    const [num, setNum] = useState(0);
    const onhandleModal = mv => setNum(mv);

    var data = {
        labels: ['Free Space', 'Used Space'],
        datasets: [{ data: [available.toFixed(4), data_uploaded ? data_uploaded.toFixed(4) : 0], backgroundColor: ['#40739e', '#e1b12c'], hoverBackgroundColor: ['#487eb0', '#fbc531'] }]
    };

    return <div className="col-11 o-w p-0">
        <h4 className="h">Organization</h4>
        <Tabnav items={['Details', 'Information', 'Plan']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <Suspense fallback={<></>}>
            <div className="col-12 p-0 o-dsh-w">
                <Dashes id={_id} r={roleCount} e={empCount} c={catCount} />
            </div>
        </Suspense>}
        {tabNav === 1 && <Suspense fallback={<></>}>
            <OImage name={'image'} head={'Company Logo'} modal={num === 1 ? true : false} num={1} imgSize={setting && setting.maxImageSize ? setting.maxImageSize : 1} handleModal={onhandleModal} val={logo} refAct='organization' id={_id} />
            <OText name={'name'} notEdit={true} head={'Name'} val={name} title={'NAME'} modal={num === 2 ? true : false} num={2} handleModal={onhandleModal} type={'text'} refAct='organization' id={_id} />
            <OText name={'email'} head={'Email'} val={email} title={'EMAIL'} modal={num === 3 ? true : false} num={3} handleModal={onhandleModal} type={'text'} refAct='organization' id={_id} />
            <OText name={'contact'} notEdit={true} head={'Contact Number'} code={countryCode} val={contact} title={'CONTACT NUMBER'} modal={num === 4 ? true : false} num={4} handleModal={onhandleModal} type={'text'} refAct='organization' id={_id} />
            <OTextArea skip={true} name={'address'} head={'Address'} val={address} title={'ADDRESS'} modal={num === 5 ? true : false} num={5} handleModal={onhandleModal} type={'text'} refAct='organization' id={_id} />
        </Suspense>}
        {tabNav === 2 && <>
            <div className="oI">
                <h6 className="dyna mr-auto">Active Plan</h6>
                <h6 className="static" style={t}>{active_plan && active_plan.name ? active_plan.name : 'None'}</h6>
            </div>
            {active_plan && active_plan.name && <Suspense fallback={<></>}>
                <Storage data={data} />
            </Suspense>}
        </>}
    </div>
}

export default connect(null, { updateOrganization })(Details);