import { DATE_FORMAT } from "../../src/database/common/constant"
import TimerDatabase, { TimerCondition } from "../../src/database/timer-database"
import WastePerDay from "../../src/entity/dao/waste-per-day"
import { formatTime, MILL_PER_DAY } from "../../src/util/time"
import storage from '../__mock__/storage'

const db = new TimerDatabase(storage.local)
const now = new Date()
const nowStr = formatTime(now, DATE_FORMAT)
const yesterday = new Date(now.getTime() - MILL_PER_DAY)
const beforeYesterday = new Date(now.getTime() - MILL_PER_DAY * 2)
const baidu = 'www.baidu.com'
const google = 'www.google.com.hk'

describe('timer-database', () => {
    beforeEach(async () => storage.local.clear())

    test('1', async () => {
        await db.accumulate(baidu, now, WastePerDay.of(100, 100, 0))
        const data: WastePerDay = await db.get(baidu, now)
        expect(data).toEqual(WastePerDay.of(100, 100, 0))
    })

    test('2', async () => {
        await db.accumulate(baidu, now, WastePerDay.of(100, 200, 0))
        await db.accumulate(baidu, now, WastePerDay.of(100, 200, 0))
        let data = await db.get(baidu, now)
        expect(data).toEqual(WastePerDay.of(200, 400, 0))
        await db.accumulate(baidu, now, WastePerDay.of(0, 0, 1))
        data = await db.get(baidu, now)
        expect(data).toEqual(WastePerDay.of(200, 400, 1))
    })

    test('3', async () => {
        await db.accumulateBatch(
            {
                [google]: WastePerDay.of(11, 11, 0),
                [baidu]: WastePerDay.of(1, 1, 0)
            }, now
        )
        expect((await db.select()).length).toEqual(2)

        await db.accumulateBatch(
            {
                [google]: WastePerDay.of(12, 12, 1),
                [baidu]: WastePerDay.of(2, 2, 1)
            }, yesterday
        )
        expect((await db.select()).length).toEqual(4)

        await db.accumulateBatch(
            {
                [google]: WastePerDay.of(13, 13, 2),
                [baidu]: WastePerDay.of(3, 3, 2)
            }, beforeYesterday
        )
        expect((await db.select()).length).toEqual(6)

        let cond: TimerCondition = {}
        cond.host = 'google'

        let list = await db.select(cond)
        expect(list.length).toEqual(3)

        // full host is not correct, result is empty
        cond.fullHost = true
        expect((await db.select(cond)).length).toEqual(0)

        cond.host = google
        expect((await db.select(cond)).length).toEqual(3)

        // By daterange
        cond = {}
        cond.date = [now, now]
        const expectedResult = [
            { date: nowStr, focus: 11, host: google, mergedHosts: [], time: 0, total: 11 },
            { date: nowStr, focus: 1, host: baidu, mergedHosts: [], time: 0, total: 1 }
        ]
        expect(await db.select(cond)).toEqual(expectedResult)
        // Only use start
        cond.date = [now]
        expect(await db.select(cond)).toEqual(expectedResult)
        // Use extra date
        cond.date = now
        expect(await db.select(cond)).toEqual(expectedResult)

        // If start is after end, nothing returned
        cond.date = [now, yesterday]
        expect(await db.select(cond)).toEqual([])

        // test item
        cond = {}
        // No range, all returned
        cond.totalRange = []
        expect((await db.select(cond)).length).toEqual(6)
        // Only 2 item
        cond.totalRange = [, 2]
        expect((await db.select(cond)).length).toEqual(2)
        // Expect 1 item
        cond.totalRange = [2,]
        expect((await db.select(cond)).length).toEqual(5)

        // focus [0,10] && total [2, unlimited)
        cond.focusRange = [0, 10]
        expect((await db.select(cond)).length).toEqual(2)

        // only focus [0,10] 
        cond.totalRange = []
        expect((await db.select(cond)).length).toEqual(3)

        // time [2, 3]
        cond.timeRange = [2, 3]
        cond.focusRange = []
        expect((await db.select(cond)).length).toEqual(2)
    })

    test('5', async () => {
        await db.accumulate(baidu, now, WastePerDay.of(10, 10, 0))
        await db.accumulate(baidu, yesterday, WastePerDay.of(10, 12, 0))
        expect((await db.select()).length).toEqual(2)
        // Delete yesterday's data
        await db.deleteByUrlAndDate(baidu, yesterday)
        expect((await db.select()).length).toEqual(1)
        // Delete yesterday's data again, nothing changed
        await db.deleteByUrlAndDate(baidu, yesterday)
        expect((await db.get(baidu, now)).focus).toEqual(10)
        // Add one again, and another
        await db.accumulate(baidu, beforeYesterday, WastePerDay.of(1, 1, 1))
        await db.accumulate(google, now, WastePerDay.of(0, 0, 0))
        expect((await db.select()).length).toEqual(3)
        // Delete all the baidu
        await db.deleteByUrl(baidu)
        const cond: TimerCondition = { host: baidu, fullHost: true }
        // Nothing of baidu remained
        expect((await db.select(cond)).length).toEqual(0)
        // But google remained
        cond.host = google
        const list = await db.select(cond)
        expect(list.length).toEqual(1)
        // Add one item of baidu again again 
        await db.accumulate(baidu, now, WastePerDay.of(1, 1, 1))
        // But delete google
        await db.delete(list)
        // Then only one item of baidu
        expect((await db.select()).length).toEqual(1)
    })

    test('6', async () => {
        await db.accumulateBatch({}, now)
        expect((await db.select()).length).toEqual(0)
        // Return zero instance
        const result = await db.get(baidu, now)
        expect([result.focus, result.time, result.total]).toEqual([0, 0, 0])
    })

    test('7', async () => {
        const foo = WastePerDay.of(1, 1, 1)
        await db.accumulate(baidu, now, foo)
        await db.accumulate(baidu, yesterday, foo)
        await db.accumulate(baidu, beforeYesterday, foo)
        await db.deleteByUrlBetween(baidu, now, now)
        expect((await db.select()).length).toEqual(2)

        await db.deleteByUrlBetween(baidu, now, beforeYesterday) // Invalid
        expect((await db.select()).length).toEqual(2)
    })
})


