/**
 * Icons aus Google Material Symbols (Apache-2.0), als SVG-Pfade eingebunden.
 * Es landen nur die hier gelisteten Icons im Bundle, kein Font und keine
 * externen Anfragen.
 *
 * Diese Datei wird erzeugt (npm run icons), nicht von Hand bearbeiten.
 * Neue Icons: Namen in scripts/icons.json ergänzen.
 */

import home from "@material-symbols/svg-400/outlined/home.svg?raw";
import homeFill from "@material-symbols/svg-400/outlined/home-fill.svg?raw";
import sensors from "@material-symbols/svg-400/outlined/sensors.svg?raw";
import sensorsFill from "@material-symbols/svg-400/outlined/sensors-fill.svg?raw";
import calendarmonth from "@material-symbols/svg-400/outlined/calendar_month.svg?raw";
import calendarmonthFill from "@material-symbols/svg-400/outlined/calendar_month-fill.svg?raw";
import smartdisplay from "@material-symbols/svg-400/outlined/smart_display.svg?raw";
import smartdisplayFill from "@material-symbols/svg-400/outlined/smart_display-fill.svg?raw";
import micexternalon from "@material-symbols/svg-400/outlined/mic_external_on.svg?raw";
import micexternalonFill from "@material-symbols/svg-400/outlined/mic_external_on-fill.svg?raw";
import groups from "@material-symbols/svg-400/outlined/groups.svg?raw";
import groupsFill from "@material-symbols/svg-400/outlined/groups-fill.svg?raw";
import menu from "@material-symbols/svg-400/outlined/menu.svg?raw";
import menuFill from "@material-symbols/svg-400/outlined/menu-fill.svg?raw";
import search from "@material-symbols/svg-400/outlined/search.svg?raw";
import searchFill from "@material-symbols/svg-400/outlined/search-fill.svg?raw";
import searchoff from "@material-symbols/svg-400/outlined/search_off.svg?raw";
import searchoffFill from "@material-symbols/svg-400/outlined/search_off-fill.svg?raw";
import close from "@material-symbols/svg-400/outlined/close.svg?raw";
import closeFill from "@material-symbols/svg-400/outlined/close-fill.svg?raw";
import accountcircle from "@material-symbols/svg-400/outlined/account_circle.svg?raw";
import accountcircleFill from "@material-symbols/svg-400/outlined/account_circle-fill.svg?raw";
import login from "@material-symbols/svg-400/outlined/login.svg?raw";
import loginFill from "@material-symbols/svg-400/outlined/login-fill.svg?raw";
import logout from "@material-symbols/svg-400/outlined/logout.svg?raw";
import logoutFill from "@material-symbols/svg-400/outlined/logout-fill.svg?raw";
import personadd from "@material-symbols/svg-400/outlined/person_add.svg?raw";
import personaddFill from "@material-symbols/svg-400/outlined/person_add-fill.svg?raw";
import dashboard from "@material-symbols/svg-400/outlined/dashboard.svg?raw";
import dashboardFill from "@material-symbols/svg-400/outlined/dashboard-fill.svg?raw";
import arrowback from "@material-symbols/svg-400/outlined/arrow_back.svg?raw";
import arrowbackFill from "@material-symbols/svg-400/outlined/arrow_back-fill.svg?raw";
import chevronright from "@material-symbols/svg-400/outlined/chevron_right.svg?raw";
import chevronrightFill from "@material-symbols/svg-400/outlined/chevron_right-fill.svg?raw";
import bolt from "@material-symbols/svg-400/outlined/bolt.svg?raw";
import boltFill from "@material-symbols/svg-400/outlined/bolt-fill.svg?raw";
import localfiredepartment from "@material-symbols/svg-400/outlined/local_fire_department.svg?raw";
import localfiredepartmentFill from "@material-symbols/svg-400/outlined/local_fire_department-fill.svg?raw";
import graphiceq from "@material-symbols/svg-400/outlined/graphic_eq.svg?raw";
import graphiceqFill from "@material-symbols/svg-400/outlined/graphic_eq-fill.svg?raw";
import wbtwilight from "@material-symbols/svg-400/outlined/wb_twilight.svg?raw";
import wbtwilightFill from "@material-symbols/svg-400/outlined/wb_twilight-fill.svg?raw";
import album from "@material-symbols/svg-400/outlined/album.svg?raw";
import albumFill from "@material-symbols/svg-400/outlined/album-fill.svg?raw";
import forest from "@material-symbols/svg-400/outlined/forest.svg?raw";
import forestFill from "@material-symbols/svg-400/outlined/forest-fill.svg?raw";
import musicnote from "@material-symbols/svg-400/outlined/music_note.svg?raw";
import musicnoteFill from "@material-symbols/svg-400/outlined/music_note-fill.svg?raw";
import festival from "@material-symbols/svg-400/outlined/festival.svg?raw";
import festivalFill from "@material-symbols/svg-400/outlined/festival-fill.svg?raw";
import stadium from "@material-symbols/svg-400/outlined/stadium.svg?raw";
import stadiumFill from "@material-symbols/svg-400/outlined/stadium-fill.svg?raw";
import playcircle from "@material-symbols/svg-400/outlined/play_circle.svg?raw";
import playcircleFill from "@material-symbols/svg-400/outlined/play_circle-fill.svg?raw";
import schedule from "@material-symbols/svg-400/outlined/schedule.svg?raw";
import scheduleFill from "@material-symbols/svg-400/outlined/schedule-fill.svg?raw";

/** Extrahiert die Pfaddaten (d) aus einem SVG-String. */
function pathOf(svg: string): string {
  const match = /\sd="([^"]+)"/.exec(svg);

  if (!match) {
    throw new Error("Icon without path data");
  }

  return match[1];
}

export const ICON_NAMES = [
  "home",
  "sensors",
  "calendar_month",
  "smart_display",
  "mic_external_on",
  "groups",
  "menu",
  "search",
  "search_off",
  "close",
  "account_circle",
  "login",
  "logout",
  "person_add",
  "dashboard",
  "arrow_back",
  "chevron_right",
  "bolt",
  "local_fire_department",
  "graphic_eq",
  "wb_twilight",
  "album",
  "forest",
  "music_note",
  "festival",
  "stadium",
  "play_circle",
  "schedule",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICONS: Record<IconName, { outlined: string; filled: string }> = {
  home: { outlined: pathOf(home), filled: pathOf(homeFill) },
  sensors: { outlined: pathOf(sensors), filled: pathOf(sensorsFill) },
  calendar_month: { outlined: pathOf(calendarmonth), filled: pathOf(calendarmonthFill) },
  smart_display: { outlined: pathOf(smartdisplay), filled: pathOf(smartdisplayFill) },
  mic_external_on: { outlined: pathOf(micexternalon), filled: pathOf(micexternalonFill) },
  groups: { outlined: pathOf(groups), filled: pathOf(groupsFill) },
  menu: { outlined: pathOf(menu), filled: pathOf(menuFill) },
  search: { outlined: pathOf(search), filled: pathOf(searchFill) },
  search_off: { outlined: pathOf(searchoff), filled: pathOf(searchoffFill) },
  close: { outlined: pathOf(close), filled: pathOf(closeFill) },
  account_circle: { outlined: pathOf(accountcircle), filled: pathOf(accountcircleFill) },
  login: { outlined: pathOf(login), filled: pathOf(loginFill) },
  logout: { outlined: pathOf(logout), filled: pathOf(logoutFill) },
  person_add: { outlined: pathOf(personadd), filled: pathOf(personaddFill) },
  dashboard: { outlined: pathOf(dashboard), filled: pathOf(dashboardFill) },
  arrow_back: { outlined: pathOf(arrowback), filled: pathOf(arrowbackFill) },
  chevron_right: { outlined: pathOf(chevronright), filled: pathOf(chevronrightFill) },
  bolt: { outlined: pathOf(bolt), filled: pathOf(boltFill) },
  local_fire_department: { outlined: pathOf(localfiredepartment), filled: pathOf(localfiredepartmentFill) },
  graphic_eq: { outlined: pathOf(graphiceq), filled: pathOf(graphiceqFill) },
  wb_twilight: { outlined: pathOf(wbtwilight), filled: pathOf(wbtwilightFill) },
  album: { outlined: pathOf(album), filled: pathOf(albumFill) },
  forest: { outlined: pathOf(forest), filled: pathOf(forestFill) },
  music_note: { outlined: pathOf(musicnote), filled: pathOf(musicnoteFill) },
  festival: { outlined: pathOf(festival), filled: pathOf(festivalFill) },
  stadium: { outlined: pathOf(stadium), filled: pathOf(stadiumFill) },
  play_circle: { outlined: pathOf(playcircle), filled: pathOf(playcircleFill) },
  schedule: { outlined: pathOf(schedule), filled: pathOf(scheduleFill) },
};
