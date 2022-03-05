/**
 * Copyright (c) 2022 Hengyang Zhang
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { ElementButtonType } from "@app/element-ui/button"
import ElementIcon from "@app/element-ui/icon"
import { t } from "@app/locale"
import { ElButton, ElPopconfirm } from "element-plus"
import { defineComponent, PropType, h } from "vue"

const confirmButtonText = t(msg => msg.confirm.confirmMsg)
const cancelButtonText = t(msg => msg.confirm.cancelMsg)

const _default = defineComponent({
    name: "OperationPopupConfirmButton",
    props: {
        confirmText: String,
        buttonText: String,
        buttonType: String as PropType<ElementButtonType>,
        buttonIcon: Object as PropType<ElementIcon>
    },
    emits: ["confirm", "referenceClick"],
    setup(props, ctx) {
        return () => h(ElPopconfirm, {
            confirmButtonText,
            cancelButtonText,
            title: props.confirmText,
            onConfirm: () => ctx.emit("confirm")
        }, {
            reference: () => h(ElButton, {
                size: "mini",
                type: props.buttonType,
                icon: props.buttonIcon,
                onClick: () => ctx.emit("referenceClick")
            }, () => props.buttonText)
        })
    }
})

export default _default