import React, { lazy, Suspense, useState } from 'react';
import './style.css';
import Tabnav from '../tabnav';
import GInformation from '../../assets/tabnav/G-information.svg';
import BInformation from '../../assets/tabnav/B-information.svg';
import GAInfo from '../../assets/tabnav/G-additional Info.svg';
import BAInfo from '../../assets/tabnav/B-additional info.svg';
const PImage = lazy(() => import('../edits/editImage'));
const PText = lazy(() => import('../edits/editText'));
const PTextArea = lazy(() => import('../edits/editTextArea'));
const PPassword = lazy(() => import('../edits/editPasswordSingle'));

let icons = [
    { G: GInformation, B: BInformation },
    { G: GAInfo , B: BAInfo }
];

export default ({ User, setting, tabNav, setTN }) => {
    const { _id, name, email, contact, image, address, dob, cnic } = User, [num, setNum] = useState(0);

    const onhandleModal = mv => setNum(mv);

    return <div className="col-11 u-p-w p-0">
        <h4 className="h">Personal details</h4>
        <Tabnav items={['Basic', 'Additional']} i={tabNav} icons={icons} setI={setTN} />
        {tabNav === 0 && <>
            <Suspense fallback={<></>}><PImage name={'image'} head={'Photo'} modal={num === 1 ? true : false} num={1} handleModal={onhandleModal} val={image} refAct={'profile'} id={_id} imgSize={setting && setting.maxImageSize ? setting.maxImageSize : 1} /> </Suspense>
            <Suspense fallback={<></>}>
                <PText name={'name'} head={'Name'} notEdit={true} val={name} title={'NAME'} modal={num === 2 ? true : false} num={2} handleModal={onhandleModal} type={'text'} refAct={'profile'} />
                <PText name={'email'} head={'Email'} notEdit={true} val={email} title={'EMAIL'} modal={num === 3 ? true : false} num={3} handleModal={onhandleModal} type={'text'} refAct={'profile'} />
                <PPassword name={'password'} head={'Password'} val={''} modal={num === 4 ? true : false} num={4} handleModal={onhandleModal} type={'password'} refAct={'profile'} />
            </Suspense>
        </>}
        {tabNav === 1 && <Suspense fallback={<></>}>
            <PText name={'contact'} head={'Contact Number'} val={contact} title={'CONTACT NUMBER'} modal={num === 5 ? true : false} num={5} handleModal={onhandleModal} type={'text'} refAct={'profile'} />
            <PText name={'cnic'} head={'Identification Number'} val={cnic} title={'IDENTIFICATION NUMBER'} modal={num === 6 ? true : false} num={6} handleModal={onhandleModal} type={'text'} refAct={'profile'} />
            <PTextArea name={'address'} head={'Address'} val={address} title={'ADDRESS'} modal={num === 7 ? true : false} num={7} handleModal={onhandleModal} type={'text'} refAct={'profile'} />
            <PText name={'dob'} head={'Date of Birth'} val={dob} title={'DOB'} modal={num === 8 ? true : false} num={8} handleModal={onhandleModal} type={'date'} refAct={'profile'} />
     </Suspense>}
    </div>
} 
