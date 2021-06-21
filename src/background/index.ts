import { openLog } from '../common/logger'
import ContextMenusManager from './context-menus-manager'
import IconUrlCollector from './icon-url-collector'
import Timer from './timer'
import VersionManager from './version-manager'

// Open the log of console
openLog()

// Start the timer
new Timer().start()

// Collect the icon url
new IconUrlCollector().listen()

// Process version
new VersionManager().init()

// Mange the context menus
ContextMenusManager()