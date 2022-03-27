/**
 * Copyright (c) 2021 Hengyang Zhang
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * @ts error Can't find namespace timer in this file
 * So import the faked one
 */
import { FakedLocale } from ".."
import compile from "./compile"
import messages from "./message"

const _default: { [locale in FakedLocale]: any } = {
    zh_CN: compile(messages.zh_CN),
    en: compile(messages.en),
    ja: compile(messages.ja)
}

export default _default