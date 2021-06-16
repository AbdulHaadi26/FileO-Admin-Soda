import React, { lazy, Suspense, useState } from 'react';
import SideNav from '../componentsP/sidenav';
import Loader from '../componentsP/loader/loaderMain';
import EasyPaisa from '../componentsP/modals/easyPaisa';
import SelectTypeE from '../componentsP/modals/selectTypeE';
import '../animate.css';
const Counter = lazy(() => import('../componentsP/trailPeriod/counter'));
const NFC = lazy(() => import('../utils/notificationContainer'));
const Personal = lazy(() => import('./personal'));
const NotifToast = lazy(() => import('../componentsP/notifToast'));
const BillingReminder = lazy(() => import('../componentsP/modals/billing_reminder'));
const ChoosePlan = lazy(() => import('../componentsP/modals/choosePlan'));

export default ({ profile, num, number }) => {

    const [type, setType] = useState(''), [oId, setOId] = useState('');

    return <div className="container-fluid">
        <div className="row">
            <div className="col-12 p-0 cF">
                <SideNav User={profile} num={num} />
                <div className="col-lg-10 p-0 cF3">
                    <Suspense fallback={<Loader />}>
                        <Personal />
                    </Suspense>
                </div>
                <Suspense fallback={<></>}>
                    <NFC />
                    <NotifToast />
                    {number === 1 && <BillingReminder profile={profile} />}
                    {number === 2 && <ChoosePlan onNext={(order) => {
                        setOId(order);
                    }} />}
                    {profile && profile.isTrail && <Counter end_date={profile.trail_end_date} />}
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
            </div>
        </div>
    </div>
}