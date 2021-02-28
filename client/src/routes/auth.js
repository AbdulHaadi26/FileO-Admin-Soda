import React, { lazy, Suspense } from 'react';
import SideNav from '../components/sidenav';
import Loader from '../components/loader/loaderMain';
import '../index.css';
import '../animate.css';
const NFC = lazy(() => import('../utils/notificationContainer'));
const Topnav = lazy(() => import('../components/topnav'));
const PoweredBy = lazy(() => import('../components/poweredBy'));
const Admin = lazy(() => import('./admin'));
const ProjectM = lazy(() => import('./projectM'));
const User = lazy(() => import('./user'));
const Toast = lazy(() => import('../components/toast'));
const NotifToast = lazy(() => import('../components/notifToast'))

const RenderCEAR = i => i === 2 ? <Admin /> : i === 1 ? <ProjectM /> : <User />

export default ({ profile, num }) => <div className="container-fluid">
    <div className="row">
        <div className="col-12 p-0 cF">
            <SideNav User={profile} num={num} />
            <div className="col-lg-10 p-0 cF3">
                <Suspense fallback={<Loader />}>
                    <Topnav profile={profile} />
                    {RenderCEAR(profile.userType)}
                    <PoweredBy />
                </Suspense>
            </div>
            <Suspense fallback={<></>}>
                <NFC />
                <NotifToast />
            </Suspense>
        </div>
        <Toast />
    </div>
</div>