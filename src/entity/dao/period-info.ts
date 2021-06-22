/**
 * The focus period of one day
 * 
 * @since v0.2.1
 */
type FocusPerDay = {
    /**
     * minute order => millseconds of focus 
     */
    [minuteOrder: number]: number
}

export default FocusPerDay