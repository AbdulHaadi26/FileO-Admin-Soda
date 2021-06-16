import React, { lazy } from 'react';
import Switch from "react-router-dom/Switch";
import Route from 'react-router-dom/Route';
import Redirect from 'react-router-dom/Redirect';
const DashboardPage = lazy(() => import('../pagePersonal/dashboardPageP'));
const ErrorLimit = lazy(() => import('../components/error/errorLimitP'));
const UserProfilePage = lazy(() => import('../pagePersonal/userProfilePage'));
const PlanListPage = lazy(() => import('../pagePersonal/plans/planListPage'));
const PlanViewPage = lazy(() => import('../pagePersonal/plans/planPage'));
const CatListPageU = lazy(() => import('../pagePersonal/user_category/catListPage'));
const FileListPageU = lazy(() => import('../pagePersonal/user_files/fileListPage'));
const FileViewPageU = lazy(() => import('../pagePersonal/user_files/fileViewPage'));
const FileViewPageUV = lazy(() => import('../pagePersonal/user_files/fileViewPageV'));
const CatListPageC = lazy(() => import('../pagePersonal/client_category/catListPage'));
const FileListPageC = lazy(() => import('../pagePersonal/client_files/fileListPage'));
const FileViewPageC = lazy(() => import('../pagePersonal/client_files/fileViewPage'));
const RecentFileDate = lazy(() => import('../pagePersonal/files/recentDatePage'));
const AllFilePage = lazy(() => import('../pagePersonal/fileCategoriesPage'));
const NotificationPage = lazy(() => import('../pagePersonal/notifications/notificationPage'));
const FvrFileList = lazy(() => import('../pagePersonal/files/fvrFilePage'));
const NotificationListPage = lazy(() => import('../pagePersonal/notifications/notificationListPage'));
const BillingListPage = lazy(() => import('../pagePersonal/billing/billingListPage'));

export default () => <Switch>
    <Route exact path='/personal/user/dashboard' component={DashboardPage} />
    <Route path='/personal/user/profile' component={UserProfilePage} />
    <Route path='/personal/upload/limit' component={ErrorLimit} />
    <Route path='/personal/bill/list/page/:num' component={BillingListPage} />
    <Route path='/personal/myspace/user/:_id/plan/list' component={PlanListPage} />
    <Route path='/personal/myspace/user/:_id/plan/view/:nId' component={PlanViewPage} />
    <Route path='/personal/myspace/user/:_id/files/:catId/list' component={FileListPageU} />
    <Route path='/personal/myspace/user/:uId/file/:_id' component={FileViewPageU} />
    <Route path='/personal/myspace/user/:uId/version/:ver/file/:_id' component={FileViewPageUV} />
    <Route path='/personal/myspace/user/:_id/category/list' component={CatListPageU} />
    <Route path='/personal/user/:_id/clients/category/list' component={CatListPageC} />
    <Route path='/personal/user/:_id/clients/files/:catId/list' component={FileListPageC} />
    <Route path='/personal/user/:uId/clients/file/:_id' component={FileViewPageC} />
    <Route path='/personal/files/recent/page/:num' component={RecentFileDate} />
    <Route path='/personal/all/files/page/:num' component={AllFilePage} />
    <Route path='/personal/notification/details/:_id' component={NotificationPage} />
    <Route path='/personal/notification/list/page/:num' component={NotificationListPage} />
    <Route path='/organization/:id/myspace/user/:_id/category/data/:term/list' component={CatListPageU} />
    <Route path='/personal/user/:uId/favourites' component={FvrFileList} />
    <Route render={() => <Redirect to='/personal/user/dashboard' />} />
</Switch>


