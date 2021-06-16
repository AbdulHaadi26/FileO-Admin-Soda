import React, { lazy, Suspense, useState } from 'react';
import SideNav from '../components/sidenav';
import Loader from '../components/loader/loaderMain';
import EasyPaisa from '../components/modals/easyPaisa';
import SelectTypeE from '../components/modals/selectTypeE';
import '../animate.css';
import ScrollTop from '../components/scrollTop';
const Counter = lazy(() => import('../components/trailPeriod/counter'));
const NFC = lazy(() => import('../utils/notificationContainer'));
const Admin = lazy(() => import('./admin'));
const ProjectM = lazy(() => import('./projectM'));
const User = lazy(() => import('./user'));
const NotifToast = lazy(() => import('../components/notifToast'));
const BillingReminder = lazy(() => import('../components/modals/billing_reminder'));
const ChoosePlan = lazy(() => import('../components/modals/choosePlan'));
const Message = lazy(() => import('../components/message'));

const RenderCEAR = i => i === 2 ? <Admin /> :
    i === 1 ? <ProjectM /> : <User />

export default ({ profile, num, number }) => {


    const [type, setType] = useState(''), [oId, setOId] = useState('');

    return <div className="container-fluid">
        <div className="row">
            <div className="col-12 p-0 cF">
                <SideNav User={profile} num={num} />
                <div className="col-lg-10 p-0 cF3">
                    <Suspense fallback={<Loader />}>
                        {profile.isMessage && <Message profile={profile} />}
                        {RenderCEAR(profile.userType)}
                    </Suspense>
                </div>
                <Suspense fallback={<></>}>
                    <NFC />
                    <NotifToast />
                    {number === 1 && <BillingReminder type={profile.userType} />}
                    {number === 2 && <ChoosePlan onNext={(order) => {
                        setOId(order);
                    }} />}
                    {profile.current_employer && profile.current_employer.isTrail && <Counter end_date={profile.current_employer.trail_end_date} />}
                </Suspense>

                {oId && !type && <SelectTypeE onhandleModal={e => {
                    setOId('');
                }} onNext={item => {
                    setType(item === 1 ? 'MA_PAYMENT_METHOD' : 'CC_PAYMENT_METHOD');
                }} />}
                {oId && type && <EasyPaisa onHandleModal={e => {
                    setType('');
                    setOId('');
                }} order={oId} type={type} />}
                <ScrollTop />
            </div>
        </div>
    </div>
}