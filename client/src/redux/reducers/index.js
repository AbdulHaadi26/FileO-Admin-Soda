import { combineReducers } from 'redux';
import { loginReducer } from './loginReducer';
import { profileReducer, dashboardReducer, sidenavReducer, modalReducer } from './profileReducer';
import { OrganizationReducer } from './organizationReducer';
import { EmployeeReducer } from './employeeReducer';
import { RoleReducer } from './roleReducer'
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

const CombinedReducers = combineReducers({
    Category: CatReducer, Login: loginReducer, Profile: profileReducer, NotificationCount: countReducer,
    Organization: OrganizationReducer, Employee: EmployeeReducer, Role: RoleReducer, Notification: NotifReducer,
    File: FileReducer, dashboard: dashboardReducer, verification: verReducer, setting: setReducer, Modal: modalReducer,
    Project: ProjectReducer, Ticket: TicketReducer, Reset: resetReducer, Discussion: DiscussionReducer, Task: TaskReducer,
    Note: NoteReducer, sidenav: sidenavReducer, Plan: PlanReducer
});

export default CombinedReducers;