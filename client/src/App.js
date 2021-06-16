import React, { useEffect, lazy, Suspense } from 'react';
import { RenderErr, RenderPR, RenderEV } from './routes';
import { getSetting } from './redux/actions/settingActions';
import { connect } from 'react-redux';
import Loader from './components/loader/loaderMain';
import { getCurrentUser } from './redux/actions/userActions';
import ScrollTop from './components/scrollTop';
const RenderRoutesP = lazy(() => import('./routes/authP'));
const RenderRoutes = lazy(() => import('./routes/auth'));
const Toast = lazy(() => import('./components/toast'));

const App = ({ getSetting, isL, isErr, profile, auth, setting, num, getCurrentUser, number }) => {

  useEffect(() => {
    async function fetch() {
      localStorage.getItem('token') !== null && await getCurrentUser();
      await getSetting();
    }
    fetch();
  }, [getSetting, getCurrentUser]);

  return <Suspense fallback={<Loader />}>
    <Toast />
    {!auth ? <>
      <RenderPR />
      <ScrollTop />
    </> : !isL && !isErr && profile && profile.user ?
      <>{profile.user.verified ?
        <>{profile.user.flag === 'B' ? <RenderRoutes number={number ? number : 0} profile={profile.user} setting={setting} num={num} /> : <RenderRoutesP number={number ? number : 0} profile={profile.user} setting={setting} num={num} />}</>
        : <RenderEV />} </>
      : isErr ? <RenderErr /> : <Loader />}
  </Suspense>
};

const mapStateToProps = state => {
  return {
    auth: state.Profile.isAuth,
    isL: state.Profile.isL,
    isErr: state.Profile.isErr,
    profile: state.Profile.data,
    isSuc: state.setting.isSuc,
    setting: state.setting.data,
    num: state.sidenav.count,
    number: state.Organization.bill
  }
};

export default connect(mapStateToProps, { getSetting, getCurrentUser })(App);
