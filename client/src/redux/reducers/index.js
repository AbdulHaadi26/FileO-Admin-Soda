import { combineReducers } from 'redux';
import { loginReducer } from './loginReducer';
import { profileReducer, dashboardReducer, sidenavReducer, modalReducer, billReducer } from './profileReducer';
import { OrganizationReducer } from './organizationReducer';
import { EmployeeReducer } from './employeeReducer';
import { CatReducer } from './categoryReducer';
import { FileReducer } from './fileReducer';
import { verReducer } from './verificationReducer';
import { setReducer } from './settingReducer';
import { ProjectReducer } from './projectReducer';
import { TicketReducer } from './ticketReducer';
import { countReducer, NotifReducer } from './notifReducer';
import { NoteReducer } from './noteReducer';
import { resetReducer } from './resetReducer';
import { DiscussionReducer } from './discussionReducer';
import { TaskReducer } from './taskReducer';
import { PlanReducer } from './planReducer';
import { PackageReducer, CodeReducer, NavReducer } from './fileOReducer';
import { PlanDReducer } from './planDReducer';
import { AnncReducer } from './announcementReducer';
import { PollReducer } from './pollReducer';

const CombinedReducers = combineReducers({
    Category: CatReducer, Login: loginReducer, Profile: profileReducer, NotificationCount: countReducer, Bill: billReducer,
    Organization: OrganizationReducer, Employee: EmployeeReducer, Notification: NotifReducer, PlanD: PlanDReducer,
    File: FileReducer, dashboard: dashboardReducer, verification: verReducer, setting: setReducer, Modal: modalReducer,
    Project: ProjectReducer, Ticket: TicketReducer, Reset: resetReducer, Discussion: DiscussionReducer, Task: TaskReducer,
    Note: NoteReducer, sidenav: sidenavReducer, Plan: PlanReducer, Nav: NavReducer, Code: CodeReducer, Package: PackageReducer,
    Annc: AnncReducer, Poll: PollReducer
});

export default CombinedReducers;