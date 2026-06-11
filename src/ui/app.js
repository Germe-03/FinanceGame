// Einstiegspunkt: verbindet Routen mit Screens und startet die App.
// Jeder Screen liegt in screens/, wiederverwendbare UI-Teile in components/.
import { ROUTES } from "../domain/navigation.js";
import { initModuleModal } from "./components/moduleModal.js";
import { initLearningModuleSearch } from "./components/sidebar.js";
import { initSupportModal } from "./components/supportModal.js";
import { configureRouter, startRouter } from "./router.js";
import { renderAccountPlanSearchScreen } from "./screens/accountPlanSearch.js";
import { renderBookingTaskScreen, renderInvoiceBookingScreen, renderMixedBookingTaskScreen } from "./screens/bookingTasks.js";
import { renderCaseScreen } from "./screens/caseBriefing.js";
import { renderConfigurationScreen } from "./screens/configuration.js";
import { renderDescriptionScreen } from "./screens/description.js";
import { renderIncomeStatementIntroScreen } from "./screens/incomeIntro.js";
import {
  renderMwstAdvancedBookingScreen,
  renderMwstBookingScreen,
  renderMwstClassifyScreen,
  renderMwstTKontoScreen,
  renderMwstVorsteuerScreen,
} from "./screens/mwst.js";
import { renderTKontoScreen } from "./screens/tKonto.js";
import { gameRound } from "../content/gameRound.js";

configureRouter(
  {
    [ROUTES.description]: renderDescriptionScreen,
    [ROUTES.case]: renderCaseScreen,
    [ROUTES.configuration]: renderConfigurationScreen,
    [ROUTES.game]: renderAccountPlanSearchScreen,
    [ROUTES.gameAccountPlan]: renderAccountPlanSearchScreen,
    [ROUTES.gameBalance]: renderBookingTaskScreen,
    [ROUTES.gameIncomeIntro]: renderIncomeStatementIntroScreen,
    [ROUTES.gameMixed]: renderMixedBookingTaskScreen,
    [ROUTES.gameInvoices]: renderInvoiceBookingScreen,
    [ROUTES.gameTKonto]: () => renderTKontoScreen(gameRound.tKontoBank),
    [ROUTES.gameMwstClassify]: renderMwstClassifyScreen,
    [ROUTES.gameMwstBooking]: renderMwstBookingScreen,
    [ROUTES.gameMwstVorsteuer]: renderMwstVorsteuerScreen,
    [ROUTES.gameMwstBookingPro]: renderMwstAdvancedBookingScreen,
    [ROUTES.gameMwstTKonto]: renderMwstTKontoScreen,
  },
  renderDescriptionScreen,
);

startRouter();
initLearningModuleSearch();
initModuleModal();
initSupportModal();
